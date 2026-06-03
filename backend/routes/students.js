const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/studentController");
const { authenticate, staffOnly } = require("../middleware/auth");

router.get("/",              authenticate, staffOnly, ctrl.getAll);
router.get("/:id",           authenticate, staffOnly, ctrl.getOne);
router.get("/:id/borrows",   authenticate, ctrl.getBorrowHistory);
router.post("/",             authenticate, staffOnly, ctrl.create);
router.put("/:id",           authenticate, staffOnly, ctrl.update);
router.delete("/:id",        authenticate, staffOnly, ctrl.remove);

module.exports = router;
