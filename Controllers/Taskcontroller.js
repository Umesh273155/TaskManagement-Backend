const Category = require("../models/Category"); 
const  Tasks  = require("../models/Task");
const ShareTask = require("../models/ShareTask");
const Users = require("../models/User");
const mongoose = require("mongoose");

//Create Task
exports.createTask = async (req, res) => {
  try {
    const { UserId, Task, Status, CategoryId } = req.body;

    if (!UserId || !Task || !Status || !CategoryId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    
    const categoryData = await Category.findById(CategoryId);
    if (!categoryData) {
      return res.status(404).json({ message: "Category not found" });
    }

    const task = await Tasks.create({
      UserId,
      Task,
      Status,
      CategoryId,
      //Category: categoryData.Category  // ✅ Store actual category name
    });
 console.log("its backend data to store the task ",task);
    res.status(201).json({ message: "Task created successfully", task });
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ message: "Error creating task", error: err.message });
  }
};
//get tasks

//update tasks
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId before using it in a query
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    // Update task
    await Tasks.findByIdAndUpdate(id, req.body, { new: true });

    // Retrieve updated task
    const task = await Tasks.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ task });
  } catch (err) {
    res.status(500).json({ message: "Error updating task", error: err.message });
  }
};
//Detlet Task
exports.deleteTask = async (req, res) =>{
  try{
    const task=await Tasks.findByIdAndDelete(req.params.id);
    res.status(200).json({message:"Task is delete succefully",task})
    

  }
  catch(error){
    res.status(500).json({message:"unable Task Detele successfully!"});

  }
}
//get task by id
 exports.taskById= async (req, res) => {
  const { id } = req.params;  // Get the ID from request parameters

  if (!mongoose.Types.ObjectId.isValid(id)) {  // Validate ObjectId
      return res.status(400).json({ error: "Invalid Task ID format" });
  }

  try {
      const task = await Tasks.findById(id)
      .select("-UserId -__v -updatedAt  -createdAt")  
      if (!task) {
          return res.status(404).json({ error: "Task not found" });

      }
     
      res.json(task);
  } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
  }
};


// exports.getTasks = async (req, res) => {
//   try {
//     const userId = req.query.UserId;

//     // Validate User ID format
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ message: "Invalid User ID format" });
//     }

//     const objectIdUserId = new mongoose.Types.ObjectId(userId);

//     // 1️⃣ Fetch tasks owned by the user
//     const userTasks = await Tasks.aggregate([
//       { $match: { UserId: objectIdUserId } },
//       { $sort: { createdAt: -1 } },
//       {
//         $lookup: {
//           from: "categorydatas",
//           localField: "CategoryId",
//           foreignField: "_id",
//           as: "CategoryDetails",
//         },
//       },
//       { $unwind: { path: "$CategoryDetails", preserveNullAndEmptyArrays: true } },
//       { $match: { "CategoryDetails.Status": "Active" } },
//       {
//         $project: {
//           _id: 1,
//           Task: 1,
//           Status: 1,
//           createdAt: 1,
//           Category: "$CategoryDetails.Category",
//           sharedWithOthers: { $literal: false },  // ✅ Fixed (No exclusion)
//           isShared: { $literal: false },          // ✅ Fixed
//           Permission: { $literal: "Owner" },      // ✅ Fixed
//         },
//       },
//     ]);

//     // 2️⃣ Fetch tasks that are shared with the user (received tasks)
//     const sharedTasks = await ShareTask.aggregate([
//       { $match: { receiverId: objectIdUserId } },
//       {
//         $lookup: {
//           from: "taskdatas",
//           localField: "taskId",
//           foreignField: "_id",
//           as: "TaskDetails",
//         },
//       },
//       { $unwind: "$TaskDetails" },
//       {
//         $lookup: {
//           from: "categorydatas",
//           localField: "TaskDetails.CategoryId",
//           foreignField: "_id",
//           as: "CategoryDetails",
//         },
//       },
//       { $unwind: { path: "$CategoryDetails", preserveNullAndEmptyArrays: true } },
//       { $match: { "CategoryDetails.Status": "Active" } },
    
//       // ✅ Group by taskId to prevent duplicates
//       {
//         $group: {
//           _id: "$TaskDetails._id",
//           Task: { $first: "$TaskDetails.Task" },
//           Status: { $first: "$TaskDetails.Status" },
//           createdAt: { $first: "$TaskDetails.createdAt" },
//           Category: { $first: "$CategoryDetails.Category" },
//           Permissions: { $push: "$Permission" }, // Collect permissions in an array
//         },
//       },
    
//       // ✅ Add fixed values after grouping
//       {
//         $addFields: {
//           sharedWithOthers: false, // ✅ Fixed
//           isShared: true, // ✅ Fixed
//           Permission: { $arrayElemAt: ["$Permissions", 0] }, // Pick first permission
//         },
//       },
    
//       {
//         $project: {
//           _id: 1,
//           Task: 1,
//           Status: 1,
//           createdAt: 1,
//           Category: 1,
//           Permission: 1,
//           sharedWithOthers: 1,
//           isShared: 1,
//         },
//       },
//     ]);
    

//     // 3️⃣ Fetch tasks that the user has shared with others (sent tasks)
//     const sentSharedTasks = await ShareTask.aggregate([
//       { $match: { senderId: objectIdUserId } },
//       {
//         $lookup: {
//           from: "taskdatas",
//           localField: "taskId",
//           foreignField: "_id",
//           as: "TaskDetails",
//         },
//       },
//       { $unwind: "$TaskDetails" },
//       {
//         $lookup: {
//           from: "categorydatas",
//           localField: "TaskDetails.CategoryId",
//           foreignField: "_id",
//           as: "CategoryDetails",
//         },
//       },
//       { $unwind: { path: "$CategoryDetails", preserveNullAndEmptyArrays: true } },
//       { $match: { "CategoryDetails.Status": "Active" } },
    
//       // ✅ Group by taskId to remove duplicates
//       {
//         $group: {
//           _id: "$TaskDetails._id",
//           Task: { $first: "$TaskDetails.Task" },
//           Status: { $first: "$TaskDetails.Status" },
//           createdAt: { $first: "$TaskDetails.createdAt" },
//           Category: { $first: "$CategoryDetails.Category" },
//           sharedWithOthers: { $first: true },
//           isShared: { $first: false },
//         },
//       }
//     ]);
    
//     // Combine all tasks
//     const tasksMap = new Map();
// [...userTasks, ...sharedTasks, ...sentSharedTasks].forEach(task => {
//   tasksMap.set(task._id.toString(), task); // Store unique tasks by ID
// });
// const tasks = Array.from(tasksMap.values());

// res.status(200).json({ tasks });

//   } catch (error) {
//     res.status(500).json({ message: "Error fetching tasks", error: error.message });
//   }
// };



exports.getTasks = async (req, res) => {
  try {
    const userId = req.query.UserId;

    // Validate User ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    const objectIdUserId = new mongoose.Types.ObjectId(userId);

    // 1️⃣ Fetch tasks owned by the user
    const userTasks = await Tasks.aggregate([
      { $match: { UserId: objectIdUserId } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "categorydatas",
          localField: "CategoryId",
          foreignField: "_id",
          as: "CategoryDetails",
        },
      },
      { $unwind: { path: "$CategoryDetails", preserveNullAndEmptyArrays: true } },
      { $match: { "CategoryDetails.Status": "Active" } },
      {
        $lookup: {
          from: "users",
          localField: "UserId",
          foreignField: "_id",
          as: "UserDetails",
        },
      },
      { $unwind: { path: "$UserDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          Task: 1,
          Status: 1,
          createdAt: 1,
          Category: "$CategoryDetails.Category",
          CreatedBy: "$UserDetails.Name",  // ✅ Fetch creator's name
          sharedWithOthers: { $literal: false },
          isShared: { $literal: false },
          Permission: { $literal: "Owner" },
        },
      },
    ]);

    // 2️⃣ Fetch tasks that are shared with the user (received tasks)
    const sharedTasks = await ShareTask.aggregate([
      { $match: { receiverId: objectIdUserId } },
      {
        $lookup: {
          from: "taskdatas",
          localField: "taskId",
          foreignField: "_id",
          as: "TaskDetails",
        },
      },
      { $unwind: "$TaskDetails" },
      {
        $lookup: {
          from: "categorydatas",
          localField: "TaskDetails.CategoryId",
          foreignField: "_id",
          as: "CategoryDetails",
        },
      },
      { $unwind: { path: "$CategoryDetails", preserveNullAndEmptyArrays: true } },
      { $match: { "CategoryDetails.Status": "Active" } },
      {
        $lookup: {
          from: "users",
          localField: "TaskDetails.UserId",
          foreignField: "_id",
          as: "UserDetails",
        },
      },
      { $unwind: { path: "$UserDetails", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$TaskDetails._id",
          Task: { $first: "$TaskDetails.Task" },
          Status: { $first: "$TaskDetails.Status" },
          createdAt: { $first: "$TaskDetails.createdAt" },
          Category: { $first: "$CategoryDetails.Category" },
          CreatedBy: { $first: "$UserDetails.Name" },  // ✅ Fetch creator's name
          Permissions: { $push: "$Permission" },
        },
      },
      {
        $addFields: {
          sharedWithOthers: false,
          isShared: true,
          Permission: { $arrayElemAt: ["$Permissions", 0] },
        },
      },
      {
        $project: {
          _id: 1,
          Task: 1,
          Status: 1,
          createdAt: 1,
          Category: 1,
          CreatedBy: 1,  // ✅ Include creator's name
          Permission: 1,
          sharedWithOthers: 1,
          isShared: 1,
        },
      },
    ]);

    // 3️⃣ Fetch tasks that the user has shared with others (sent tasks)
    const sentSharedTasks = await ShareTask.aggregate([
      { $match: { senderId: objectIdUserId } },
      {
        $lookup: {
          from: "taskdatas",
          localField: "taskId",
          foreignField: "_id",
          as: "TaskDetails",
        },
      },
      { $unwind: "$TaskDetails" },
      {
        $lookup: {
          from: "categorydatas",
          localField: "TaskDetails.CategoryId",
          foreignField: "_id",
          as: "CategoryDetails",
        },
      },
      { $unwind: { path: "$CategoryDetails", preserveNullAndEmptyArrays: true } },
      { $match: { "CategoryDetails.Status": "Active" } },
      {
        $lookup: {
          from: "users",
          localField: "TaskDetails.UserId",
          foreignField: "_id",
          as: "UserDetails",
        },
      },
      { $unwind: { path: "$UserDetails", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$TaskDetails._id",
          Task: { $first: "$TaskDetails.Task" },
          Status: { $first: "$TaskDetails.Status" },
          createdAt: { $first: "$TaskDetails.createdAt" },
          Category: { $first: "$CategoryDetails.Category" },
          CreatedBy: { $first: "$UserDetails.Name" },  // ✅ Fetch creator's name
          sharedWithOthers: { $first: true },
          isShared: { $first: false },
        },
      },
    ]);

    // Combine all tasks
    const tasksMap = new Map();
    [...userTasks, ...sharedTasks, ...sentSharedTasks].forEach(task => {
      tasksMap.set(task._id.toString(), task); // Store unique tasks by ID
    });
    const tasks = Array.from(tasksMap.values());

    res.status(200).json({ tasks });

  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
};

