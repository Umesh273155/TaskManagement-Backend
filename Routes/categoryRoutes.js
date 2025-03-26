const express = require("express");
const{createCategory,getCategory,updateCategory,deleteCategory,getCategoryStatus,categoryById} = require("../Controllers/Categorycontrolller");
const router = express.Router();
router.post("/",createCategory);
router.get("/",getCategory);
router.get("/getstatus",getCategoryStatus)
router.get("/:UserId",getCategory);
router.patch("/:id",updateCategory);
router.delete("/:id",deleteCategory);
router.get("/getById/:id",categoryById);

module.exports = router;