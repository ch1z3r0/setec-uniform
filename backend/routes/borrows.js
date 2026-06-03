const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/borrowController");
const { authenticate, staffOnly } = require("../middleware/auth");

router.get("/",                 authenticate, staffOnly, ctrl.getAll);
router.get("/stats",            authenticate, staffOnly, ctrl.getStats);
router.get("/:id",              authenticate, ctrl.getOne);
router.post("/",                authenticate, staffOnly, ctrl.create);
router.patch("/:id/return",     authenticate, staffOnly, ctrl.processReturn);
router.patch("/:id/overdue",    authenticate, staffOnly, ctrl.markOverdue);
router.delete("/:id",           authenticate, staffOnly, ctrl.remove);

module.exports = router;
