// const express = require("express");
// require("dotenv").config();
// const cors = require("cors");
// const connectDB = require("./config/db");

// const authRoutes = require("./Routes/userRoutes");
// const taskRoutes = require("./Routes/taskRoutes");
// const shareTaskRoutes = require("./Routes/shareTaskRoutes");
// const categoryRoutes = require("./Routes/categoryRoutes");
// const connectionRoutes = require("./Routes/connectionRoutes");

// const app = express();
// connectDB();

// app.use(cors());

// // ✅ Allow only your frontend origin
// app.use(cors({
//   origin: 'https://task-management-frontend-azure.vercel.app',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true // only if you're using cookies
// }));

// app.use(express.json());

// // Routes
// app.use("/clustertaskmanagment/shareTaskmanegment", shareTaskRoutes); 
// app.use("/clustertaskmanagment/connectionmanegment", connectionRoutes);
// app.use("/clustertaskmanagment/categorymanegment", categoryRoutes);
// app.use("/clustertaskmanagment/taskmanegment", taskRoutes);
// app.use("/clustertaskmanagment", authRoutes);

// const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./Routes/userRoutes");
const taskRoutes = require("./Routes/taskRoutes");
const shareTaskRoutes = require("./Routes/shareTaskRoutes");
const categoryRoutes = require("./Routes/categoryRoutes");
const connectionRoutes = require("./Routes/connectionRoutes");

const app = express();
connectDB();

// ✅ Setup CORS
const corsOptions = {
  origin: "https://task-management-frontend-azure.vercel.app", // your frontend domain
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // only if you're using cookies or sessions
};

app.use(cors(corsOptions));

// ✅ Handle preflight requests (important!)
app.options("*", cors(corsOptions));

app.use(express.json());

// ✅ Routes
app.use("/clustertaskmanagment/shareTaskmanegment", shareTaskRoutes); 
app.use("/clustertaskmanagment/connectionmanegment", connectionRoutes);
app.use("/clustertaskmanagment/categorymanegment", categoryRoutes);
app.use("/clustertaskmanagment/taskmanegment", taskRoutes);
app.use("/clustertaskmanagment", authRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server is running on port ${PORT}`));
