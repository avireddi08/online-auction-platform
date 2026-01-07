import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash, FaGavel } from "react-icons/fa";

function MyAuctions() {

    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userId, setUserId] = useState(null); // Store logged-in user ID

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("authToken");
                if (!token) {
                    setError("No authentication token found.");
                    setLoading(false);
                    return;
                }
    
                // Get logged-in user data
                const userRes = await axios.get("http://localhost:5001/auth/user", {
                    headers: { Authorization: `Bearer ${token}` },
                });
    
                // Fix: Extract correct field
                setUserId(userRes.data.id || userRes.data._id); // Some APIs return `_id`
    
                // Get user's auctions
                const res = await axios.get("http://localhost:5001/auction/my-auctions", {
                    headers: { Authorization: `Bearer ${token}` },
                });
    
                console.log("Fetched Auctions:", res.data);
                setAuctions(res.data);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to fetch data.");
            } finally {
                setLoading(false);
            }
        };
    
        fetchData();
    }, []);
    
    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your auctions...</p>
        </div>
    );

    if (error) return (
        <div className="error-box">
            <p>❌ {error}</p>
        </div>
    );

    return (
        <div className="my-auctions-page">
            <div className="my-auctions-container">
                <div className="page-header">
                    <h1>My Auctions</h1>
                    <p className="header-subtitle">Manage your active and closed auctions</p>
                </div>

                {auctions.length === 0 ? (
                    <div className="empty-state">
                        <FaGavel className="empty-icon" />
                        <p>You haven't created any auctions yet.</p>
                        <Link to="/post-auction" className="btn-primary">
                            Create Your First Auction
                        </Link>
                    </div>
                ) : (
                    <div className="my-auctions-grid">
                        {auctions.map((auction) => {
                            return (
                                <div key={auction._id} className="my-auction-card">
                                    <div className="card-header">
                                        <h3 className="card-title">{auction.itemName}</h3>
                                        <span className={`status-badge ${auction.isClosed ? "closed" : "live"}`}>
                                            {auction.isClosed ? "🔒 Closed" : "🔴 Live"}
                                        </span>
                                    </div>

                                    <div className="card-body">
                                        <div className="card-price-section">
                                            <div className="price-info">
                                                <span className="label">Starting Bid</span>
                                                <span className="price">₹{auction.startingBid}</span>
                                            </div>
                                            {auction.highestBid > 0 && (
                                                <div className="price-info">
                                                    <span className="label">Current Bid</span>
                                                    <span className="price highlight">₹{auction.highestBid}</span>
                                                </div>
                                            )}
                                        </div>

                                        <p className="card-description">
                                            {auction.description?.substring(0, 80)}
                                            {auction.description?.length > 80 ? "..." : ""}
                                        </p>
                                    </div>

                                    <div className="card-actions">
                                        <Link to={`/auction/${auction._id}`} className="action-btn view-btn">
                                            View
                                        </Link>
                                        {String(auction.createdBy) === String(userId) ? (
                                            <>
                                                <Link to={`/auction/edit/${auction._id}`} className="action-btn edit-btn">
                                                    <FaEdit /> Edit
                                                </Link>
                                                <Link to={`/auction/delete/${auction._id}`} className="action-btn delete-btn">
                                                    <FaTrash /> Delete
                                                </Link>
                                            </>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
    
}

export default MyAuctions;
