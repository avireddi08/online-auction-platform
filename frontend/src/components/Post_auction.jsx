import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

function PostAuction() {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [closingTime, setClosingTime] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) navigate('/signin');
  }, [navigate]);

  const handlePostAuction = async (e) => {
    e.preventDefault();
    setMessage('');

    const token = localStorage.getItem('authToken');
    if (!token) {
      setMessage('You must be signed in to post an auction.');
      navigate('/signin');
      return;
    }

    if (!itemName.trim() || !description.trim()) {
      setMessage('Item name and description are required.');
      return;
    }

    const bidValue = parseFloat(startingBid);
    if (isNaN(bidValue) || bidValue <= 0) {
      setMessage('Starting bid must be a positive number.');
      return;
    }

    if (!closingTime || new Date(closingTime) <= new Date()) {
      setMessage('Closing time must be in the future.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        'http://localhost:5001/auction/auctions',
        {
          itemName,
          description,
          startingBid: bidValue,
          closingTime: closingTime.toISOString()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Auction item posted successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to post auction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-auction-page">
      <div className="form-container">
        <Link to="/dashboard" className="btn-back">
          <FaArrowLeft /> Back to Dashboard
        </Link>

        <div className="form-header">
          <h2>Post New Auction</h2>
          <p className="form-subtitle">List your item and start receiving bids</p>
        </div>
        
        {message && (
          <div className={`form-message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handlePostAuction} className="auction-form">
          <div className="form-group">
            <label htmlFor="itemName">Item Name *</label>
            <input
              id="itemName"
              type="text"
              placeholder="Enter the name of the item"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              placeholder="Provide detailed description of your item"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="form-textarea"
              rows="5"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startingBid">Starting Bid (₹) *</label>
              <input
                id="startingBid"
                type="number"
                placeholder="e.g., 100"
                value={startingBid}
                onChange={(e) => setStartingBid(e.target.value)}
                min="1"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="closingTime">Auction Ends *</label>
              <DatePicker
                selected={closingTime}
                onChange={(date) => setClosingTime(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                placeholderText="Select date & time"
                className="form-input"
                minDate={new Date()}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Posting...
              </>
            ) : (
              'Post Auction'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostAuction;
