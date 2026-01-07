import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt, FaPlus, FaGavel, FaClock } from "react-icons/fa"; // ✅ Icons

function Dashboard() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUsername = localStorage.getItem("username");

    if (!token) {
      navigate("/signin");
      return;
    }

    setUsername(storedUsername || "User");

    const fetchAuctions = async () => {
      try {
        const res = await axios.get("http://localhost:5001/auction/auctions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuctions(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Error fetching auctions. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    navigate("/signin");
  };

  // Filter auctions based on search and status
  const filteredAuctions = auctions.filter((auction) => {
    const matchesSearch = auction.itemName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "live" && !auction.isClosed) ||
      (filterStatus === "closed" && auction.isClosed);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-container">
      {/* ✅ Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1>Welcome, {username}! 👋</h1>
          <p>Explore amazing auction items from sellers worldwide</p>
        </div>
      </div>

      <div className="dashboard-main">
        {/* ✅ Search & Filter Bar */}
        <div className="search-filter-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search auctions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
              onClick={() => setFilterStatus("all")}
            >
              All Items ({auctions.length})
            </button>
            <button
              className={`filter-btn ${filterStatus === "live" ? "active" : ""}`}
              onClick={() => setFilterStatus("live")}
            >
              <FaClock /> Live ({auctions.filter((a) => !a.isClosed).length})
            </button>
            <button
              className={`filter-btn ${filterStatus === "closed" ? "active" : ""}`}
              onClick={() => setFilterStatus("closed")}
            >
              Closed ({auctions.filter((a) => a.isClosed).length})
            </button>
          </div>
        </div>

        {/* ✅ Content Section */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading auctions...</p>
          </div>
        ) : error ? (
          <div className="error-box">
            <p>❌ {error}</p>
          </div>
        ) : filteredAuctions.length > 0 ? (
          <div className="auctions-grid">
            {filteredAuctions.map((auction) => (
              <Link
                key={auction._id}
                to={`/auction/${auction._id}`}
                className="auction-card"
              >
                <div className="card-header">
                  <h3 className="card-title">{auction.itemName}</h3>
                  <span
                    className={`status-badge ${
                      auction.isClosed ? "closed" : "live"
                    }`}
                  >
                    {auction.isClosed ? "🔒 Closed" : "🔴 Live"}
                  </span>
                </div>

                <div className="card-body">
                  <div className="card-price-section">
                    <div className="price-info">
                      <span className="label">Starting Bid</span>
                      <span className="price">₹{auction.startingBid}</span>
                    </div>
                    {auction.highestBid && auction.highestBid > 0 && (
                      <div className="price-info">
                        <span className="label">Current Bid</span>
                        <span className="price highlight">
                          ₹{auction.highestBid}
                        </span>
                      </div>
                    )}
                  </div>

                  {auction.highestBidder && (
                    <div className="card-bidder-info">
                      <span className="label">Highest Bidder:</span>
                      <span className="bidder-name">
                        {typeof auction.highestBidder === 'object' 
                          ? auction.highestBidder.username 
                          : auction.highestBidder}
                      </span>
                    </div>
                  )}

                  {auction.endTime && (
                    <div className="card-time-info">
                      <span className="label">Time Remaining:</span>
                      <span className="time-remaining">
                        {new Date(auction.endTime) > new Date() 
                          ? `${Math.ceil((new Date(auction.endTime) - new Date()) / (1000 * 60 * 60))}h left`
                          : "Ended"}
                      </span>
                    </div>
                  )}

                  <p className="card-description">
                    {auction.description?.substring(0, 80)}
                    {auction.description?.length > 80 ? "..." : ""}
                  </p>

                  <div className="card-footer">
                    <span className="bids">
                      {auction.bids?.length || 0} {auction.bids?.length === 1 ? "Bid" : "Bids"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FaGavel className="empty-icon" />
            <p>No auctions found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
