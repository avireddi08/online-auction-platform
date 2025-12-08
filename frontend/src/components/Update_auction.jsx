import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="form-container">
      <h2>Update Auction</h2>
      {message && <p className="success">{message}</p>}

      {isOwner && auction && (
        <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
          <label>Starting Bid ($):</label>
          <input
            type="number"
            value={updateData.startingBid}
            onChange={(e) =>
              setUpdateData({ ...updateData, startingBid: e.target.value })
            }
            min={auction.startingBid}
            required
          />

          <label>Closing Time:</label>
          <DatePicker
            selected={updateData.closingTime}
            onChange={(date) => setUpdateData({ ...updateData, closingTime: date })}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="yyyy-MM-dd HH:mm"
            className="custom-datepicker-input"
            minDate={new Date()}
          />

          <div style={{ textAlign: "right", marginTop: "10px" }}>
            <button type="submit">Update Auction</button>
          </div>
        </form>
      )}
    </div>
  );
}

export default UpdateAuction;
