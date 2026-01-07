import React, { useEffect, useState } from "react";
import { Camera, Edit3, Mail, Phone, MapPin } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";

const Profile = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";
  const token = localStorage.getItem("authToken");

  // Profile data state
  const [profileData, setProfileData] = useState({
    email: "",
    phone: "",
    location: "",
  });

  useEffect(() => {
    if (!token) {
      navigate("/signin");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5001/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfileData({
          email: res.data.email || "Not available",
          phone: res.data.phone || "Not provided",
          location: res.data.location || "Not specified",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [navigate, token]);

  return (
    <div className="dashboard-container">
      <Link to="/dashboard" className="btn-back" style={{ margin: '20px', display: 'inline-block' }}>
        <FaArrowLeft /> Back to Dashboard
      </Link>

      {/* ✅ Navbar */}
      <header className="navbar">
        <div>
          <h2 className="site-logo">Profile</h2>
        </div>

        <div className="navbar-right">
          <button
            className="logout-btn"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {/* ✅ Profile Section */}
      <div className="profile-section" style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", padding: "20px" }}>
        {/* Cover Image */}
        <div className="profile-cover">
          <button className="profile-cover-btn">
            <Camera size={18} />
          </button>
        </div>

        {/* Avatar + User Info Row */}
        <div className="profile-info-row">
          {/* Avatar */}
          <img
            src="https://via.placeholder.com/150"
            alt="User Avatar"
            className="profile-avatar"
          />

          {/* User Details + Edit Button inline */}
          <div className="profile-details-inline">
            <div>
              <h2 className="profile-name">{username}</h2>
              <p className="profile-username">@{username.toLowerCase()}</p>
            </div>

            <button className="edit-profile-btn white-btn">
              <Edit3 size={16} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* ✅ Contact Information */}
        <div className="profile-contact">
          <h3>Contact Information</h3>
          <ul>
            <li>
              <Mail size={16} /> {profileData.email}
            </li>
            <li>
              <Phone size={16} /> {profileData.phone}
            </li>
            <li>
              <MapPin size={16} /> {profileData.location}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Profile;
