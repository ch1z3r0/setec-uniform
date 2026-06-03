const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

router.post("/staff/login",   ctrl.staffLogin);
router.post("/student/login", ctrl.studentLogin);
router.get("/me",             authenticate, ctrl.getMe);

module.exports = router;
