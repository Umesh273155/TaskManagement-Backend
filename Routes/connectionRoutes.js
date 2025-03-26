const express = require("express");
const {
  createConnection,
  getConnection,
  updateConnection,
  deleteConnection,
  getSentRequests,
  getFriends
} = require("../Controllers/ConnectionController");

const router = express.Router();

router.post("/send-request", createConnection);
router.get("/:userId", getConnection);
router.put("/update/:id", updateConnection);
router.get("/getsentRequests/:userId", getSentRequests);
router.delete("/remove/:id", deleteConnection);
router.get("/getFriends/:userId", getFriends);


module.exports = router;

