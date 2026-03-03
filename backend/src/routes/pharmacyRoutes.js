const express = require("express");
const authenticate = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const { nearbyPharmacies, updateStock } = require("../controllers/pharmacyController");

const router = express.Router();

router.get("/nearby-pharmacies", nearbyPharmacies);
router.post("/update-stock", authenticate, authorizeRoles("pharmacy"), updateStock);

module.exports = router;
