import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaExclamationTriangle, FaArrowLeft, FaTrash } from "react-icons/fa";

function DeleteAuction() {
  
  const { id } = useParams();
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [auctionData, setAuctionData] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchUserAndAuction = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/signin");
          return;
        }

        console.log("Fetching User Details...");
        const userRes = await axios.get("http://localhost:5001/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Logged-in User:", userRes.data);
        const loggedInUserId = userRes.data?.id || userRes.data?._id;
        setUserId(loggedInUserId);

        console.log("Fetching Auction Details...");
        const auctionRes = await axios.get(`http://localhost:5001/auction/auctions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAuctionData(auctionRes.data);

        if (loggedInUserId && loggedInUserId === auctionRes.data.createdBy) {
          setIsOwner(true);
        } else {
          setError("You are not authorized to delete this auction.");
        }
      } catch (err) {
        console.error("Error fetching user/auction:", err);
        setError("Error verifying ownership.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndAuction();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this auction? This action cannot be undone.")) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/signin");
        return;
      }

      console.log("Deleting Auction:", id);
      const response = await axios.delete(`http://localhost:5001/auction/auctions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Delete Response:", response.data);
      navigate("/my-auctions", { replace: true });
    } catch (err) {
      console.error("Error deleting auction:", err);
      setError(err.response?.data?.message || "Failed to delete auction.");
      setDeleting(false);
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

  return (
    <div className="delete-auction-page">
      <div className="delete-container">
        <Link to="/my-auctions" className="btn-back">
          <FaArrowLeft /> Back to My Auctions
        </Link>

        {error && (
          <div className="error-box">
            <p>❌ {error}</p>
          </div>
        )}

        {isOwner && auctionData ? (
          <div className="delete-confirmation-box">
            <div className="warning-icon">
              <FaExclamationTriangle />
            </div>

            <h1>Delete Auction</h1>
            <p className="warning-text">
              This action cannot be undone. Permanently delete this auction and all associated data.
            </p>

            <div className="auction-details-preview">
              <div className="preview-item">
                <span className="label">Auction Item:</span>
                <span className="value">{auctionData.itemName}</span>
              </div>
              <div className="preview-item">
                <span className="label">Status:</span>
                <span className={`status-badge ${auctionData.isClosed ? "closed" : "live"}`}>
                  {auctionData.isClosed ? "Closed" : "Live"}
                </span>
              </div>
              {auctionData.highestBid && (
                <div className="preview-item">
                  <span className="label">Highest Bid:</span>
                  <span className="value">₹{auctionData.highestBid}</span>
                </div>
              )}
              <div className="preview-item">
                <span className="label">Total Bids:</span>
                <span className="value">{auctionData.bids?.length || 0}</span>
              </div>
            </div>

            <div className="action-buttons">
              <Link to="/my-auctions" className="btn-cancel">
                Cancel
              </Link>
              <button onClick={handleDelete} disabled={deleting} className="btn-delete-confirm">
                {deleting ? (
                  <>
                    <span className="spinner-small"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash /> Delete Auction
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="unauthorized-box">
            <h2>Unauthorized</h2>
            <p>You do not have permission to delete this auction.</p>
            <Link to="/my-auctions" className="btn-primary">
              Back to My Auctions
            </Link>
          </div>
        )}
      </div>
    </div>
  );
  
}

export default DeleteAuction;
