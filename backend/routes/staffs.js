const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/staffController");
const { authenticate, staffOnly } = require("../middleware/auth");

router.get("/",         authenticate, staffOnly, ctrl.getAll);
router.get("/active",   authenticate, ctrl.getActive);
router.get("/:id",      authenticate, staffOnly, ctrl.getOne);
router.post("/",        authenticate, staffOnly, ctrl.create);
router.put("/:id",      authenticate, staffOnly, ctrl.update);
router.delete("/:id",   authenticate, staffOnly, ctrl.remove);

module.exports = router;
