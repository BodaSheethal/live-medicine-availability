const pool = require("../config/db");

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

exports.searchMedicine = async (req, res) => {
  try {
    const name = req.query.name || "";
    const lat = parseNumber(req.query.lat, 12.9716);
    const lng = parseNumber(req.query.lng, 77.5946);

    if (!name.trim()) {
      return res.status(400).json({ success: false, message: "name query param is required" });
    }

    const query = `
      SELECT
        m.id AS medicine_id,
        m.name AS medicine_name,
        pm.stock,
        pm.price,
        p.name AS pharmacy_name,
        p.open_24x7,
        p.latitude,
        p.longitude,
        ROUND((
          6371 * ACOS(
            COS(RADIANS($1)) * COS(RADIANS(p.latitude)) * COS(RADIANS(p.longitude) - RADIANS($2)) +
            SIN(RADIANS($3)) * SIN(RADIANS(p.latitude))
          )
        )::numeric, 2) AS distance_km
      FROM medicines m
      JOIN pharmacy_medicines pm ON pm.medicine_id = m.id
      JOIN pharmacies p ON p.id = pm.pharmacy_id
      WHERE m.name ILIKE $4
      ORDER BY distance_km ASC, pm.stock DESC
    `;

    const result = await pool.query(query, [lat, lng, lat, `%${name}%`]);

    return res.json({
      success: true,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error("searchMedicine error", error);
    return res.status(500).json({ success: false, message: "Could not search medicine" });
  }
};

exports.alternativeMedicine = async (req, res) => {
  try {
    const category = req.query.category || "";

    if (!category.trim()) {
      return res.status(400).json({ success: false, message: "category query param is required" });
    }

    const result = await pool.query(
      "SELECT id, name, category FROM medicines WHERE category ILIKE $1 ORDER BY name ASC",
      [`%${category}%`]
    );

    return res.json({
      success: true,
      count: result.rowCount,
      alternatives: result.rows,
    });
  } catch (error) {
    console.error("alternativeMedicine error", error);
    return res.status(500).json({ success: false, message: "Could not fetch alternatives" });
  }
};
