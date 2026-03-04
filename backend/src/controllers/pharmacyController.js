const pool = require("../config/db");

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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

    const userRows = await pool.query(
      "SELECT pharmacy_verified FROM users WHERE id = $1 AND role = 'pharmacy'",
      [userId]
    );

    if (userRows.rowCount === 0) {
      return res.status(403).json({ success: false, message: "Only pharmacy accounts can update stock" });
    }

    if (!userRows.rows[0].pharmacy_verified) {
      return res.status(403).json({
        success: false,
        message: "Pharmacy account is pending admin verification",
      });
    }

    const pharmacyRows = await pool.query("SELECT id FROM pharmacies WHERE user_id = $1", [userId]);

    if (pharmacyRows.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No pharmacy profile linked to this account",
      });
    }

    const pharmacyId = pharmacyRows.rows[0].id;

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
