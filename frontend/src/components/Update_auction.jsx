import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import { FaArrowLeft } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";

function UpdateAuction() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [auction, setAuction] = useState(null);
  const [updateData, setUpdateData] = useState({ startingBid: "", closingTime: new Date() });
  const [isOwner, setIsOwner] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return navigate("/signin");

        const userRes = await axios.get("http://localhost:5001/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userId = userRes.data?.id || userRes.data?._id;

        const auctionRes = await axios.get(`http://localhost:5001/auction/auctions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const auctionData = auctionRes.data;

        if (auctionData.createdBy === userId) {
          setIsOwner(true);
          setAuction(auctionData);
          setUpdateData({
            startingBid: auctionData.startingBid,
            closingTime: new Date(auctionData.closingTime),
          });
        } else {
          setError("You are not authorized to update this auction.");
        }
      } catch (err) {
        setError("Failed to load auction data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [id, navigate]);

  const handleUpdate = async () => {
    setError("");
    setMessage("");

    const token = localStorage.getItem("authToken");
    if (!token) return navigate("/signin");

    const newBid = parseFloat(updateData.startingBid);
    const oldBid = parseFloat(auction.startingBid);
    const now = new Date();

    if (isNaN(newBid) || newBid < oldBid) {
      return setError("Starting bid must be a number and not less than current bid.");
    }

    if (!updateData.closingTime || updateData.closingTime <= now) {
      return setError("Closing time must be a future date and time.");
    }

    try {
      const response = await axios.put(
        `http://localhost:5001/auction/auctions/${id}`,
        {
          startingBid: newBid,
          closingTime: updateData.closingTime.toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Auction updated successfully!");
      setTimeout(() => navigate("/my-auctions"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update auction.");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading auction details...</p>
      </div>
    );
  }

  if (error && !isOwner) {
    return (
      <div className="post-auction-page">
        <div className="form-container">
          <div className="error-box">
            <p>❌ {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="post-auction-page">
      <div className="form-container">
         <Link to="/my-auctions" className="btn-back">
          <FaArrowLeft /> Back to My Auctions
        </Link>
        <div className="form-header">
          <h2>Edit Auction</h2>
          <p className="form-subtitle">Update your auction details</p>
        </div>

        {message && (
          <div className="form-message success">
            {message}
          </div>
        )}

        {error && (
          <div className="form-message error">
            {error}
          </div>
        )}

        {isOwner && auction && (
          <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="auction-form">
            <div className="form-group">
              <label htmlFor="startingBid">Starting Bid (₹) *</label>
              <input
                id="startingBid"
                type="number"
                placeholder="Enter starting bid"
                value={updateData.startingBid}
                onChange={(e) =>
                  setUpdateData({ ...updateData, startingBid: e.target.value })
                }
                min={auction.startingBid}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="closingTime">Auction Ends *</label>
              <DatePicker
                selected={updateData.closingTime}
                onChange={(date) => setUpdateData({ ...updateData, closingTime: date })}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                placeholderText="Select date & time"
                className="form-input"
                minDate={new Date()}
              />
            </div>

            <button type="submit" className="btn-submit">
              Update Auction
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default UpdateAuction;
