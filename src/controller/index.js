import * as model from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const sceret = process.env.JWT_SECRET || 'secretKey'
// User Registration
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

// User Login
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
      const userId = req.user._id;
  
      const user = await model.User.findById(userId).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const activities = await model.Activity.find({ userId }).select("name");
  
      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          activities
        }
      });
    } catch (error) {
      console.error("Error fetching user details with activities:", error);
      res.status(500).json({ message: error.message });
    }
  };
  
  export const getUserActivitiesByDay = async (req, res) => {
    try {
      const userId = req.user._id;
      const day = req.query.day ? parseInt(req.query.day) : null;
  
      const query = day !== null ? { userId, scheduledDays: day } : { userId };
      const activities = await model.Activity.find(query);
      const totalCount = activities.length;
  
      if (day === null) {
        return res.json({ totalCount, activities });
      }
  
      let completedCount = 0;
      let pendingCount = 0;
  
      const response = activities.map((activity) => {
        const isCompleted = activity.completed.get(String(day)) || false;
        isCompleted ? completedCount++ : pendingCount++;
  
        return {
          id: activity._id,
          name: activity.name,
          category: activity.category,
          frequencyType: activity.frequencyType,
          frequencyCount: activity.frequencyCount,
          duration: activity.duration,
          day,
          completed: isCompleted,
        };
      });
  
      return res.json({
        totalCount,
        completedCount,
        pendingCount,
        activities: response,
      });
    } catch (err) {
      console.error("Error fetching activities:", err);
      res.status(500).json({ message: err.message });
    }
  };
  
  
  
  // Mark activity as completed for a user on a given day
  export const markActivityComplete = async (req, res) => {
    try {
      const userId = req.user._id;
      const { activityId, day } = req.body;
  
      if (!activityId || day === undefined) {
        return res.status(400).json({ message: "Activity ID and day are required." });
      }
  
      const activity = await model.Activity.findOne({ _id: activityId, userId });
      if (!activity) return res.status(404).json({ message: "Activity not found" });
  
      activity.completed.set(String(day), true);
      await activity.save();
  
      res.json({ message: `Activity for day ${day} marked as complete`});
    } catch (err) {
      console.error("Error marking activity complete:", err);
      res.status(500).json({ message: err.message });
    }
  };
  
  
  // Add new activity for a user
  export const addActivityForUser = async (req, res) => {
    try {
      const userId = req.user._id;
      const { name, category, frequencyType, frequencyCount, duration, scheduledDays } = req.body;
  
      const user = await model.User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const completedMap = new Map(
        (scheduledDays || []).map((day) => [String(day), false])
      );
  
      const newActivity = new model.Activity({
        userId,
        name,
        category,
        frequencyType,     
        frequencyCount,   
        duration,          
        scheduledDays,     
        completed: completedMap,
      });
  
      await newActivity.save();
  
      res.status(201).json(newActivity);
    } catch (err) {
      console.error("Error adding activity:", err);
      res.status(400).json({ message: err.message });
    }
  };
  
  export const getActivitiesByCategory = async (req, res) => {
    try {
      const { category } = req.query;
  
      if (!category) {
        return res.status(400).json({ message: "Category parameter is required." });
      }
  
      const activities = await model.Activity.find({ category });
  
      if (activities.length === 0) {
        return res.status(404).json({ message: "No activities found for this category." });
      }
  
      res.status(200).json({ activities });
    } catch (error) {
      console.error("Error fetching activities by category:", error);
      res.status(500).json({ message: error.message });
    }
  };
  