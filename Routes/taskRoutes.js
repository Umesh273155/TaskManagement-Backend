const express = require("express");
const { createTask, getTasks, updateTask,deleteTask,taskById} = require("../Controllers/Taskcontroller");
const router = express.Router();
router.post("/", createTask);
router.get("/alldata", getTasks);
// router.get("/:UserId", getTasks);
router.patch("/single/:id", updateTask);
router.get("/:id", taskById);

router.delete("/:id", deleteTask);
module.exports = router;
