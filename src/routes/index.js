import express from "express";
import * as controller from "../controller/index.js"
import { authenticateUser, apiLimiter } from "../middleware/index.js";
const router = express.Router();

//user routes
router.post("/register", apiLimiter, controller.registerUser);
router.post("/login", apiLimiter, controller.loginUser);
router.get("/getUser", authenticateUser, controller.getUserDetails);

//activity routes
router.get("/getUserActivity", authenticateUser, controller.getUserActivitiesByDay);
router.post("/addActivity", authenticateUser, controller.addActivityForUser);
router.post("/completeActivity", authenticateUser, controller.markActivityComplete);



export default router
