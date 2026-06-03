const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/borrowController");

router.get("/",                   ctrl.getAll);
router.get("/stats",              ctrl.getStats);
router.get("/:id",                ctrl.getOne);
router.post("/",                  ctrl.create);
router.patch("/:id/return",       ctrl.processReturn);
router.patch("/:id/overdue",      ctrl.markOverdue);
router.delete("/:id",             ctrl.remove);

module.exports = router;
