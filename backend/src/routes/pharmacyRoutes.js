const express = require("express");
const authenticate = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const {
  nearbyPharmacies,
  updateStock,
  getMyStock,
  addMedicineManual,
} = require("../controllers/pharmacyController");

const router = express.Router();

router.get("/nearby-pharmacies", nearbyPharmacies);
router.get("/my-stock", authenticate, authorizeRoles("pharmacy"), getMyStock);
router.post("/update-stock", authenticate, authorizeRoles("pharmacy"), updateStock);
router.post("/add-medicine", authenticate, authorizeRoles("pharmacy"), addMedicineManual);

module.exports = router;
