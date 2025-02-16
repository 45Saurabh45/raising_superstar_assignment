import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true }
    },
    { timestamps: true }
);

const activitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    
    frequencyType: {
      type: String,
      enum: ["daily", "week", "month"],
      required: true
    },
    frequencyCount: { type: String, required: true }, 
  
    duration: { type: String, required: true }, 
    
    scheduledDays: {
      type: [Number],
      default: [] 
    },
  
    completed: {
      type: Map,
      of: Boolean,
      default: {}
    },
  
    createdAt: { type: Date, default: Date.now }
  });
  

const Activity = mongoose.model("Activity", activitySchema);
const User = mongoose.model("User", userSchema)
export  {Activity, User};
