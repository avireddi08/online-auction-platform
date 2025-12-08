import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema({

    itemName: { type: String, required: true, trim: true },
    
    description: { type: String, required: true, trim: true },
    
    startingBid: { 
      type: Number, 
      required: true, 
      min: [1, "Starting bid must be at least 1"]},
    
      closingTime: { 
      type: Date, 
      required: true,
      validate: {
        validator: function (value) {
          return value > new Date();},
        message: "Closing time must be in the future."}},
    
      createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true },

      highestBid: { type: Number, default: 0 },
    
      highestBidder: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      default: null },
    
      isClosed: { type: Boolean, default: false },
    
      bids: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ]},

  { timestamps: true }
  
);

const Auction = mongoose.model('Auction', auctionSchema);
export default Auction;
