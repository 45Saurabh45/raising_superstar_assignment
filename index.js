import 'dotenv/config';
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import router from "./src/routes/index.js"
const app = express();


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("***** MongoDB Connected *****");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};
connectDB()



// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api", router);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
