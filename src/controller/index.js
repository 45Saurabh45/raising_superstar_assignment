import * as model from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const sceret = process.env.JWT_SECRET || 'secretKey'
// **User Registration**
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields required" });

    const userExists = await model.User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await model.User.create({ name, email, password: hashedPassword });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// **model.User Login**
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await model.User.findOne({ email: email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, sceret, { expiresIn: "1h" });
    res.status(200).json({message: "Login Successfull ", token});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//fetch user details
export const getUserDetails = async (req, res) => {
    try {
      const user = await model.User.findById(req.user._id).select("-password"); // Exclude password
      if (!user) return res.status(404).json({ message: "model.User not found" });
  
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  export const getUserActivitiesByDay = async (req, res) => {
    try {
      const userId  = req.user._id;
      console.log(userId)
      const day = parseInt(req.query.day);
      if(!day){
        const activities = await model.Activity.find({userId: userId});
        return res.json(activities);
      }
      const activities = await model.Activity.find({ userId, days: day });
      return res.json(activities);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  // Mark activity as completed for a user on a given day
  export const markActivityComplete = async (req, res) => {
    try {
      const userId = req.user._id;
      const {activityId, day } = req.body;
      const activity = await model.Activity.findOne({ _id: activityId, userId });
      if (!activity) return res.status(404).json({ message: "Activity not found" });
  
      activity.completed.set(day, true);
      await activity.save();
  
      res.json({ message: "Activity marked complete", activity });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  // Add new activity for a user
  export const addActivityForUser = async (req, res) => {
    try {
      const userId = req.user._id;
      const {name, category, frequency, duration, days } = req.body;
      const user = await model.User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      const completedMap = new Map(days.map(day => [String(day), false]));
      const newActivity = new model.Activity({
        userId,
        name,
        category,
        frequency,
        duration,
        days,
        completed: completedMap
      });
      await newActivity.save();
  
      res.status(201).json(newActivity);
    } catch (err) {
        console.log(err)
      res.status(400).json({ message: err.message });
    }
  };  
