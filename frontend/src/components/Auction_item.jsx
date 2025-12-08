import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaClock, FaGavel, FaUser } from "react-icons/fa";

function AuctionItem() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await axios.get("http://localhost:5001/auction/auctions");
        setAuctions(res.data);
      } catch (err) {
        setError("Error fetching auctions.");
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchAuctionDetails = async () => {
        try {
          const res = await axios.get(`http://localhost:5001/auction/auctions/${id}`);
          setSelectedAuction(res.data);
        } catch (err) {
          setError("Error fetching auction details.");
        }
      };

      fetchAuctionDetails();

      // Refresh auction details every 5 seconds for real-time updates
      const interval = setInterval(fetchAuctionDetails, 5000);
      return () => clearInterval(interval);
    } else {
      setSelectedAuction(null);
    }
  }, [id]);

  const placeBid = async () => {
    setError("");
    setMessage("");

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("You must be logged in to place a bid.");
      return;
    }

    const bidValue = parseFloat(bidAmount);
    const minBid = selectedAuction?.highestBid ? selectedAuction.highestBid + 1 : selectedAuction?.startingBid || 1;

    if (isNaN(bidValue) || bidValue < minBid) {
      setError(`Bid must be greater than $${minBid}.`);
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:5001/auction/auctions/${id}/bid`,
        { bidAmount: bidValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Bid placed successfully!");
      setSelectedAuction((prev) => ({
        ...prev,
        highestBid: bidValue,
        highestBidder: res.data.highestBidder || prev.highestBidder, // Update highest bidder
      }));
      setBidAmount(""); // Reset bid input after successful bid
    } catch (err) {
      setError(err.response?.data?.message || "Error placing bid.");
    }
  };

  const goBackToList = () => {
    navigate("/dashboard"); // Navigate back to auction list
    setSelectedAuction(null); // Reset selected auction
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading auction details...</p>
      </div>
    );
  }

  if (error && !selectedAuction) {
    return (
      <div className="auction-item-page">
        <div className="error-box">
          <p>❌ {error}</p>
          <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auction-item-page">
      {!selectedAuction ? (
        <div className="auction-list-container">
          <h2>Browse Auctions</h2>
          <div className="auction-list">
            {auctions.map((auction) => (
              <Link key={auction._id} to={`/auction/${auction._id}`} className="auction-list-item">
                <span className="item-name">{auction.itemName}</span>
                <span className="item-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="auction-detail-container">
          <button onClick={goBackToList} className="btn-back">
            <FaArrowLeft /> Back to Auctions
          </button>

          <div className="auction-detail-wrapper">
            {/* Main Auction Info */}
            <div className="auction-main">
              <div className="auction-header">
                <h1>{selectedAuction.itemName}</h1>
                <span className={`auction-status ${selectedAuction.isClosed ? "closed" : "live"}`}>
                  {selectedAuction.isClosed ? "🔒 Closed" : "🔴 Live"}
                </span>
              </div>

              <div className="auction-description-box">
                <h3>Description</h3>
                <p>{selectedAuction.description}</p>
              </div>

              <div className="auction-details-grid">
                <div className="detail-card">
                  <div className="detail-label">Starting Bid</div>
                  <div className="detail-value">₹{selectedAuction.startingBid}</div>
                </div>

                <div className="detail-card">
                  <div className="detail-label">Current Bid</div>
                  <div className="detail-value highlight">
                    ₹{selectedAuction.highestBid || selectedAuction.startingBid}
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-label">Highest Bidder</div>
                  <div className="detail-value">
                    <FaUser style={{ marginRight: "5px" }} />
                    {selectedAuction.highestBidder?.username || selectedAuction.highestBidder || "No bids yet"}
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-label">Time Remaining</div>
                  <div className="detail-value">
                    <FaClock style={{ marginRight: "5px" }} />
                    {selectedAuction.closingTime
                      ? new Date(selectedAuction.closingTime) > new Date()
                        ? `${Math.ceil(
                            (new Date(selectedAuction.closingTime) - new Date()) / (1000 * 60 * 60)
                          )}h left`
                        : "Ended"
                      : "N/A"}
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-label">Total Bids</div>
                  <div className="detail-value">
                    <FaGavel style={{ marginRight: "5px" }} />
                    {selectedAuction.bids?.length || 0}
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-label">Closing Date</div>
                  <div className="detail-value">
                    {selectedAuction.closingTime
                      ? new Date(selectedAuction.closingTime).toLocaleString()
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* Bidding Section */}
            {!selectedAuction.isClosed && (
              <div className="bidding-section">
                <div className="bidding-box">
                  <h2>Place Your Bid</h2>
                  <p className="bid-info">
                    Minimum bid: ₹{selectedAuction.highestBid ? selectedAuction.highestBid + 1 : selectedAuction.startingBid}
                  </p>

                  {error && <div className="error-message">{error}</div>}
                  {message && <div className="success-message">{message}</div>}

                  <div className="bid-input-group">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min={selectedAuction.highestBid ? selectedAuction.highestBid + 1 : selectedAuction.startingBid}
                      placeholder="Enter your bid amount"
                      className="bid-input"
                    />
                    <button onClick={placeBid} className="btn-bid">
                      Place Bid
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedAuction.isClosed && (
              <div className="bidding-section">
                <div className="auction-closed-box">
                  <h2>This Auction Has Ended</h2>
                  <p>
                    {selectedAuction.highestBidder
                      ? `Winner: ${selectedAuction.highestBidder?.username || selectedAuction.highestBidder} with ₹${selectedAuction.highestBid}`
                      : "No bids were placed on this item."}
                  </p>
                  <Link to="/dashboard" className="btn-primary">Back to Auctions</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
  
}

export default AuctionItem;
