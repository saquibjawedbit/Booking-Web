import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import connectDB from "./config/db.config.js";
import authRoute from "./routes/auth.routes.js";
import adventureRoute from "./routes/adventure.routes.js";
import tickerRoute from "./routes/ticket.routes.js";
import userRoute from "./routes/user.routes.js";
import termRouter from "./routes/terms.routes.js";
import declarationRouter from "./routes/declaration.routes.js";
import documentRouter from "./routes/document.routes.js";
import messageRoute from "./routes/message.routes.js";
import sessionRouter from "./routes/session.routes.js";
import locationRouter from "./routes/location.routes.js";
import instructorRouter from "./routes/instructor.routes.js";
import itemRouter from "./routes/item.routes.js";
import hotelRouter from "./routes/hotel.routes.js";
import categoryRoute from "./routes/category.routes.js";
import adminRouter from "./routes/admin.routes.js";
import cartRouter from "./routes/cart.routes.js";
import landingRouter from "./routes/landing.routes.js";
import itemBookingRouter from "./routes/itemBooking.routes.js";
import hotelBookingRouter from "./routes/hotelBooking.routes.js";
import sessionBookingRouter from "./routes/sessionBooking.routes.js";
import eventBookingRouter from "./routes/eventBooking.routes.js";
import friendRouter from "./routes/friend.routes.js";
import websiteSettingsRouter from "./routes/websiteSettings.routes.js";
import translationRouter from "./routes/translation.routes.js";
import { initCloudinary } from "./utils/cloudinary.js";
import { ensureDefaultTerms } from "./controllers/terms.controller.js";
import { ensureDefaultDeclaration } from "./controllers/declaration.controller.js";
import initSocketIO from "./socket/socket.js";
import { createServer } from "http";
import { Server } from "socket.io";
import redis from "./config/redis.config.js";
const app = express();
// Create HTTP server using Express app
const server = createServer(app);
// Initialize Socket.IO with the HTTP server
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
initSocketIO(io);
// Routes
app.use("/api/auth", authRoute);
app.use("/api/adventure", adventureRoute);
app.use("/api/user", userRoute);
app.use("/api/tickets", tickerRoute);
app.use("/api/terms", termRouter);
app.use("/api/declaration", declarationRouter);
app.use("/api/document", documentRouter);
app.use("/api/messages", messageRoute);
app.use("/api/session", sessionRouter);
app.use("/api/location", locationRouter);
app.use("/api/items", itemRouter);
app.use("/api/category", categoryRoute);
app.use("/api/instructor", instructorRouter);
app.use("/api/hotel", hotelRouter);
app.use("/api/admin", adminRouter);
app.use("/api/cart", cartRouter);
app.use("/api/friends", friendRouter);
app.use("/api/itemBooking", itemBookingRouter);
app.use("/api/events", landingRouter);
app.use("/api/event-bookings", eventBookingRouter);
app.use("/api/website-settings", websiteSettingsRouter);
app.use("/api/hotelBooking", hotelBookingRouter);
app.use("/api/sessionBooking", sessionBookingRouter);
app.use("/api/translation", translationRouter);
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
  initCloudinary();
  ensureDefaultTerms();
  ensureDefaultDeclaration();
});
