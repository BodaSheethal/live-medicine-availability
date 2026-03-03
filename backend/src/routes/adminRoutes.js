const express = require("express");
const authenticate = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const { getUsers, getMedicines, getPharmacies } = require("../controllers/adminController");

const router = express.Router();

router.use(authenticate, authorizeRoles("admin"));

router.get("/users", getUsers);
router.get("/medicines", getMedicines);
router.get("/pharmacies", getPharmacies);

module.exports = router;
