const pool = require("../config/db");

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const ensureVerifiedPharmacyUser = async (userId) => {
  const userRows = await pool.query(
    `SELECT id, name, pharmacy_store_name, pharmacy_verified
     FROM users
     WHERE id = $1 AND role = 'pharmacy'`,
    [userId]
  );

  if (userRows.rowCount === 0) {
    return { ok: false, status: 403, message: "Only pharmacy accounts can perform this action" };
  }

  if (!userRows.rows[0].pharmacy_verified) {
    return { ok: false, status: 403, message: "Pharmacy account is pending admin verification" };
  }

  return { ok: true, user: userRows.rows[0] };
};

const ensurePharmacyProfile = async (userId, fallbackName) => {
  const pharmacyRows = await pool.query("SELECT id FROM pharmacies WHERE user_id = $1", [userId]);
  if (pharmacyRows.rowCount > 0) {
    return pharmacyRows.rows[0].id;
  }

  const profileName = `${fallbackName || "Pharmacy"} #${userId}`;
  const created = await pool.query(
    `INSERT INTO pharmacies (user_id, name, latitude, longitude, open_24x7)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [userId, profileName, 0, 0, false]
  );
  return created.rows[0].id;
};

exports.nearbyPharmacies = async (req, res) => {
  try {
    const lat = parseNumber(req.query.lat, 12.9716);
    const lng = parseNumber(req.query.lng, 77.5946);
    const emergency = req.query.emergency === "true";
    const maxDistance = parseNumber(req.query.maxDistance, 20);

    const filters = ["TRUE"];
    const values = [lat, lng, lat];

    if (emergency) {
      filters.push("p.open_24x7 = TRUE");
    }

    values.push(maxDistance);
    const maxDistanceParam = values.length;

    const query = `
      SELECT
        p.id,
        p.name,
        p.open_24x7,
        p.latitude,
        p.longitude,
        ROUND((
          6371 * ACOS(
            COS(RADIANS($1)) * COS(RADIANS(p.latitude)) * COS(RADIANS(p.longitude) - RADIANS($2)) +
            SIN(RADIANS($3)) * SIN(RADIANS(p.latitude))
          )
        )::numeric, 2) AS distance_km
      FROM pharmacies p
      WHERE ${filters.join(" AND ")}
      AND (
        6371 * ACOS(
          COS(RADIANS($1)) * COS(RADIANS(p.latitude)) * COS(RADIANS(p.longitude) - RADIANS($2)) +
          SIN(RADIANS($3)) * SIN(RADIANS(p.latitude))
        )
      ) <= $${maxDistanceParam}
      ORDER BY distance_km ASC
    `;

    const result = await pool.query(query, values);
    return res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (error) {
    console.error("nearbyPharmacies error", error);
    return res.status(500).json({ success: false, message: "Could not fetch nearby pharmacies" });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const userId = req.user.id;
    const { medicineId, stock, price } = req.body;

    if (!medicineId || stock === undefined || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "medicineId, stock, and price are required",
      });
    }

    const access = await ensureVerifiedPharmacyUser(userId);
    if (!access.ok) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const pharmacyId = await ensurePharmacyProfile(
      userId,
      access.user.pharmacy_store_name || access.user.name
    );

    await pool.query(
      `INSERT INTO pharmacy_medicines (pharmacy_id, medicine_id, stock, price)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (pharmacy_id, medicine_id)
       DO UPDATE SET stock = EXCLUDED.stock, price = EXCLUDED.price`,
      [pharmacyId, medicineId, stock, price]
    );

    return res.json({ success: true, message: "Stock updated successfully" });
  } catch (error) {
    console.error("updateStock error", error);
    return res.status(500).json({ success: false, message: "Could not update stock" });
  }
};

exports.getMyStock = async (req, res) => {
  try {
    const userId = req.user.id;

    const pharmacyRows = await pool.query(
      "SELECT id, name FROM pharmacies WHERE user_id = $1",
      [userId]
    );

    if (pharmacyRows.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No pharmacy profile linked to this account",
      });
    }

    const pharmacy = pharmacyRows.rows[0];

    const stockRows = await pool.query(
      `SELECT
         m.id AS medicine_id,
         m.name AS medicine_name,
         m.category,
         pm.stock,
         pm.price,
         (pm.stock > 0) AS available
       FROM pharmacy_medicines pm
       JOIN medicines m ON m.id = pm.medicine_id
       WHERE pm.pharmacy_id = $1
       ORDER BY m.name ASC`,
      [pharmacy.id]
    );

    return res.json({
      success: true,
      pharmacy: {
        id: pharmacy.id,
        name: pharmacy.name,
      },
      count: stockRows.rowCount,
      data: stockRows.rows,
    });
  } catch (error) {
    console.error("getMyStock error", error);
    return res.status(500).json({ success: false, message: "Could not fetch pharmacy stock" });
  }
};

exports.addMedicineManual = async (req, res) => {
  try {
    const userId = req.user.id;
    const { medicineName, category, stock, price } = req.body;

    if (!medicineName || !category || stock === undefined || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "medicineName, category, stock, and price are required",
      });
    }

    const access = await ensureVerifiedPharmacyUser(userId);
    if (!access.ok) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const pharmacyId = await ensurePharmacyProfile(
      userId,
      access.user.pharmacy_store_name || access.user.name
    );

    const medicineLookup = await pool.query(
      "SELECT id FROM medicines WHERE LOWER(name) = LOWER($1)",
      [medicineName.trim()]
    );

    let medicineId;
    if (medicineLookup.rowCount > 0) {
      medicineId = medicineLookup.rows[0].id;
    } else {
      const createdMedicine = await pool.query(
        "INSERT INTO medicines (name, category) VALUES ($1, $2) RETURNING id",
        [medicineName.trim(), category.trim()]
      );
      medicineId = createdMedicine.rows[0].id;
    }

    await pool.query(
      `INSERT INTO pharmacy_medicines (pharmacy_id, medicine_id, stock, price)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (pharmacy_id, medicine_id)
       DO UPDATE SET stock = EXCLUDED.stock, price = EXCLUDED.price`,
      [pharmacyId, medicineId, stock, price]
    );

    return res.json({ success: true, message: "Medicine added/updated successfully" });
  } catch (error) {
    console.error("addMedicineManual error", error);
    return res.status(500).json({ success: false, message: "Could not add medicine manually" });
  }
};
