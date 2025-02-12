import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import clodinary from "cloudinary";
import cors from "cors";
import http from "http";  
import { Server } from "socket.io";  

import authRoute from "./routes/auth.route.js";
import connectDB from "./db/connectDb.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import notificationRoute from "./routes/notification.route.js";

dotenv.config();
const app = express();


clodinary.config({
  cloud_name: process.env.CLODINARY_CLOUD_NAME,
  api_key: process.env.CLODINARY_API_KEY,
  api_secret: process.env.CLODINARY_API_SECRET_KEY,
});


app.use(cors({
  origin: "http://localhost:3000",  
  credentials: true
}));


app.use(express.json({
  limit: "5mb"
}));
app.use(cookieParser());
app.use(express.urlencoded({
  extended: true
}));


app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/notification", notificationRoute);


const server = http.createServer(app);


const io = new Server(server);


io.on("connection", (socket) => {
  console.log("A new client connected");

  
  socket.emit("welcome", "Welcome to the Socket.io server!");

  
  socket.on("message", (data) => {
    console.log("Received message from client:", data);
  });

  
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});
