const pool = require("../config/db");

exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         name,
         email,
         role,
         pharmacy_verified,
         pharmacy_license_no,
         pharmacy_store_name,
         created_at
       FROM users
       ORDER BY id DESC`
    );
    return res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (error) {
    console.error("getUsers error", error);
    return res.status(500).json({ success: false, message: "Could not fetch users" });
  }
};

exports.verifyPharmacy = async (req, res) => {
  try {
    const { userId, approved } = req.body;

    if (!userId || approved === undefined) {
      return res.status(400).json({ success: false, message: "userId and approved are required" });
    }

    const userResult = await pool.query(
      "SELECT id, role FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (userResult.rows[0].role !== "pharmacy") {
      return res.status(400).json({ success: false, message: "Only pharmacy users can be verified" });
    }

    await pool.query(
      "UPDATE users SET pharmacy_verified = $1 WHERE id = $2",
      [Boolean(approved), userId]
    );

    return res.json({
      success: true,
      message: approved ? "Pharmacy verified successfully" : "Pharmacy verification removed",
    });
  } catch (error) {
    console.error("verifyPharmacy error", error);
    return res.status(500).json({ success: false, message: "Could not update pharmacy verification" });
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
