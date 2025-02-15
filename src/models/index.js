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
  frequency: { type: String, required: true },
  duration: { type: Number, required: true }, // in seconds
  days: { type: [Number], required: true }, // Days on which the activity is done
  completed: { type: Map, of: Boolean, default: {} } // Track completion for each day
});

const Activity = mongoose.model("Activity", activitySchema);
const User = mongoose.model("User", userSchema)
export  {Activity, User};
