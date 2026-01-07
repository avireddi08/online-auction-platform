import express from "express";
import mongoose from "mongoose";
import Auction from "../models/Auction.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js"; // Authentication middleware

const router = express.Router();

// Place a Bid on an Auction
router.post("/auctions/:id/bid", authMiddleware, async (req, res) => {
  try {
    const { bidAmount } = req.body;
    const userId = req.user.id;
    const auctionId = req.params.id.trim();

    const auction = await Auction.findById(auctionId);
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    // Check if auction is closed
    if (auction.isClosed || new Date() >= new Date(auction.closingTime)) {
      return res.status(400).json({ message: "Auction is closed. No more bids allowed." });
    }

    // Ensure the bid is higher than the current highest bid
    if (bidAmount <= auction.highestBid) {
      return res.status(400).json({ message: "Your bid must be higher than the current highest bid." });
    }

    // Ensure user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update auction
    auction.highestBid = bidAmount;
    auction.highestBidder = userId;
    auction.bids.push({ user: userId, amount: bidAmount });

    await auction.save();

    res.json({
      message: "Bid placed successfully!",
      auction: {
        itemName: auction.itemName,
        highestBid: auction.highestBid,
        highestBidder: user.username,
        closingTime: auction.closingTime,
      },
    });
  } catch (error) {
    console.error("Error placing bid:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Create an Auction
router.post("/auctions", authMiddleware, async (req, res) => {
  try {
    const { itemName, description, startingBid, closingTime } = req.body;
    if (!itemName || !description || !startingBid || !closingTime) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newAuction = new Auction({
      itemName,
      description,
      startingBid,
      closingTime,
      createdBy: req.user.id, // Ensure it uses createdBy, not owner
    });

    await newAuction.save();
    res.status(201).json({ message: "Auction created successfully!", auction: newAuction });
  } catch (error) {
    console.error("Error posting auction:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get All Auctions (Automatically Close Expired Auctions)
router.get("/auctions", async (req, res) => {
  try {
    const now = new Date();

    // Close expired auctions
    await Auction.updateMany(
      { closingTime: { $lte: now }, isClosed: false },
      { $set: { isClosed: true } }
    );

    const auctions = await Auction.find()
      .populate("highestBidder", "username")
      .populate("bids.user", "username")
      .select("itemName description startingBid highestBid highestBidder closingTime isClosed bids");

    res.json(auctions);
  } catch (error) {
    console.error("Error fetching auctions:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get a Single Auction by ID
router.get("/auctions/:id", async (req, res) => {
  try {
    const auctionId = req.params.id.trim();
    if (!mongoose.Types.ObjectId.isValid(auctionId)) {
      return res.status(400).json({ message: "Invalid auction ID format" });
    }

    const auction = await Auction.findById(auctionId)
      .populate("highestBidder", "username")
      .populate("bids.user", "username");

    if (!auction) return res.status(404).json({ message: "Auction not found" });

    // Close expired auction
    if (new Date() >= new Date(auction.closingTime) && !auction.isClosed) {
      auction.isClosed = true;
      await auction.save();
    }

    res.json(auction);
  } catch (error) {
    console.error("Error fetching auction:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Update an Auction (Only by the Owner)
router.put("/auctions/:id", authMiddleware, async (req, res) => {
  try {
    const auctionId = req.params.id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(auctionId)) {
      return res.status(400).json({ message: "Invalid auction ID format" });
    }

    // Fetch Auction
    const auction = await Auction.findById(auctionId);
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    console.log("Auction Owner:", auction.createdBy.toString());
    console.log("Logged-in User:", req.user.id);

    // Check if the logged-in user is the creator
    if (auction.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to update this auction" });
    }

    // Prevent updates on closed auctions
    if (auction.isClosed) {
      return res.status(400).json({ message: "Cannot update a closed auction" });
    }

    // Update fields only if provided
    const { itemName, description, startingBid, closingTime } = req.body;
    if (itemName) auction.itemName = itemName;
    if (description) auction.description = description;
    if (startingBid) auction.startingBid = startingBid;
    if (closingTime) auction.closingTime = closingTime;

    await auction.save();
    res.json({ message: "Auction updated successfully!", auction });
  } catch (error) {
    console.error("Error updating auction:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Delete an Auction (Only by the Owner)
router.delete("/auctions/:id", authMiddleware, async (req, res) => {
  try {
    const auctionId = req.params.id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(auctionId)) {
      return res.status(400).json({ message: "Invalid auction ID format" });
    }

    // Fetch Auction
    const auction = await Auction.findById(auctionId);
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    console.log("Auction Owner:", auction.createdBy.toString());
    console.log("Logged-in User:", req.user.id);

    // Check if the logged-in user is the creator
    if (auction.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete this auction" });
    }

    // Prevent deletion of closed auctions (optional)
    if (auction.isClosed) {
      return res.status(400).json({ message: "Cannot delete a closed auction" });
    }

    // Delete the auction
    await auction.deleteOne();
    console.log("Auction Deleted Successfully");

    res.json({ message: "Auction deleted successfully!" });
  } catch (error) {
    console.error("Error deleting auction:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get Auctions created by user who is logged in
router.get("/my-auctions", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Close expired auctions
    await Auction.updateMany(
      { createdBy: userId, closingTime: { $lte: now }, isClosed: false },
      { $set: { isClosed: true } }
    );

    const myAuctions = await Auction.find({ createdBy: userId })
      .populate("highestBidder", "username")
      .populate("bids.user", "username")
      .select("itemName description startingBid highestBid highestBidder closingTime isClosed bids createdBy category");

    res.json(myAuctions);
  } catch (err) {
    console.error("Error fetching user auctions:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
