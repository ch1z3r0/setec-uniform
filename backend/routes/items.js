const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/itemController");
const { authenticate, staffOnly } = require("../middleware/auth");

router.get("/",          authenticate, ctrl.getAll);
router.get("/available", authenticate, ctrl.getAvailable);
router.get("/:id",       authenticate, ctrl.getOne);
router.post("/",         authenticate, staffOnly, ctrl.create);
router.put("/:id",       authenticate, staffOnly, ctrl.update);
router.delete("/:id",    authenticate, staffOnly, ctrl.remove);

module.exports = router;
