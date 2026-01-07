import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js"; // Import routes after app
import auctionRoutes from './routes/auctionRoutes.js';
import forgotPassRoutes from "./routes/forgot-pass.js";
import resetPassRoutes from "./routes/reset-pass.js";
import Auction from './models/Auction.js';

dotenv.config(); // Load environment variables

const app = express(); // Declare app first

// Middleware
app.use(express.json());
app.use(cors());


// Routes (After declaring app)
app.use("/auth", authRoutes);
app.use('/auction', auctionRoutes);
app.use('/forgot-password', forgotPassRoutes);
app.use('/reset-password', resetPassRoutes);


// Connect to MongoDB
mongoose
.connect(process.env.MONGO_URI)
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const closeExpiredAuctions = async () => {
    try {
      const expiredAuctions = await Auction.find({ isClosed: false, closingTime: { $lt: new Date() } });
  
      for (let auction of expiredAuctions) {
        auction.isClosed = true;
        await auction.save();
        console.log(`Auction ${auction.itemName} is now closed.`);
      }
    } catch (error) {
      console.error('Error closing auctions:', error);
    }
  };
  
  // Run this function every 1 minute
  setInterval(closeExpiredAuctions, 50000);
  