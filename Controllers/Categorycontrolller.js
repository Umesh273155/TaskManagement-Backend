const mongoose = require("mongoose");
const Categorys = require("../models/Category");
const Tasks = require("../models/Task");
//create Category
exports.createCategory = async (req, res) => {
    try {
        const category = await Categorys.create(req.body);
        console.log(category);
        res.status(201).json({ message: "Category create Successfull!", category })
    }
    catch (err) {
        res.status(500).json({ message: "err creating Category", err })
    }
}
//get category by id 
exports.getCategory = async (req, res) => {

    try {
        const userId = req.query.UserId;

        // Validate UserId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID format" });
        }

        const categories = await Categorys.aggregate([
            { $match: { UserId: new mongoose.Types.ObjectId(userId) } }, 
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "taskdatas", 
                    localField: "_id",
                    foreignField: "CategoryId",
                    as: "relatedTasks",
                },
            },
            {
                $addFields: {
                    totalTasks: { $size: "$relatedTasks" }, 
                },
            },
            {
                $project: {
                    relatedTasks: 0, 
                    updatedAt: 0,  
                    __v: 0,
                    UserId:0,
                },
            },
        ]);

        res.status(200).json(categories);

    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({ message: "Error getting category list", error: err.message });
    }
};
//get category by id 
exports.getCategoryStatus = async (req, res) => {
    try {
        const { UserId } = req.query;

        if (!UserId) {
            return res.status(400).json({ message: "UserId is required" });
        }

        // Convert UserId to ObjectId
        //const userObjectId = new mongoose.Types.ObjectId(UserId);

        // Correct field names in query
        const categories = await Categorys.find(
            { UserId, Status: "Active" },
            "Category"
            // .select("-_id")
        );

       
        
        res.status(200).json(categories);
    } catch (err) {
        console.error("Error getting status:", err);
        res.status(500).json({ message: "Error getting status", error: err });
    }
};
//update by id
exports.updateCategory = async (req, res) => {
    try {
        await Categorys.findByIdAndUpdate(req.params.id, req.body);
        const category = await Categorys.findById(req.params.id);
        res.status(200).json({ message: "category Updated Successfully!", category })
    }
    catch (err) {
        res.status(500).json({ message: "err during to update task!", err })
    }
}
//delete category
exports.deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: "Invalid Category ID format" });
        }

        // Check if category exists and fetch related tasks
        const category = await Categorys.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Check if tasks exist for this category
        const relatedTasksCount = await Tasks.countDocuments({ CategoryId: categoryId });

        if (relatedTasksCount > 0) {
            return res.status(400).json({
                message: "You have category data. You cannot delete it. If you want to delete, first delete the tasks and then the category."
            });
        }

        // If no tasks, delete the category
        await Categorys.findByIdAndDelete(categoryId);

        res.status(200).json({ message: "Category deleted successfully" });

    } catch (err) {
        console.error("Error deleting category:", err);
        res.status(500).json({ message: "Error during deletion", error: err.message });
    }
};
//get category By Id 
exports.categoryById= async (req, res) => {
    const { id } = req.params;  // Get the ID from request parameters
  
    if (!mongoose.Types.ObjectId.isValid(id)) {  // Validate ObjectId
        return res.status(400).json({ error: "Invalid Task ID format" });
    }
  
    try {
        const category = await Categorys.findById(id)
        .select("-UserId -__v -updatedAt  -createdAt")  
        if (!category) {
            return res.status(404).json({ error: "Task not found" });
  
        }
       
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
  };
  