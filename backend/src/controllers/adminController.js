const pool = require("../config/db");

exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY id DESC"
    );
    return res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (error) {
    console.error("getUsers error", error);
    return res.status(500).json({ success: false, message: "Could not fetch users" });
  }
};

exports.getMedicines = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, category FROM medicines ORDER BY id DESC");
    return res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (error) {
    console.error("getMedicines error", error);
    return res.status(500).json({ success: false, message: "Could not fetch medicines" });
  }
};

exports.getPharmacies = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         p.id,
         p.name,
         p.latitude,
         p.longitude,
         p.open_24x7,
         u.email AS owner_email
       FROM pharmacies p
       LEFT JOIN users u ON u.id = p.user_id
       ORDER BY p.id DESC`
    );
    return res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (error) {
    console.error("getPharmacies error", error);
    return res.status(500).json({ success: false, message: "Could not fetch pharmacies" });
  }
};
