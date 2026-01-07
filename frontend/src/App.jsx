import React, { useState, useEffect } from "react";
import { Route, Routes, Link, useNavigate, useLocation } from "react-router-dom";
import Signup from "./components/Sign_up.jsx";
import Signin from "./components/Sign_in.jsx";
import Dashboard from "./components/Dashboard.jsx";
import AuctionItem from "./components/Auction_item.jsx";
import PostAuction from "./components/Post_auction.jsx";
import Landing from "./components/Landing.jsx";
import UpdateAuction from "./components/Update_auction.jsx";
import DeleteAuction from "./components/Delete_auction.jsx";
import MyAuctions from "./components/My_auctions.jsx";
import Profile from "./components/Profile.jsx";

import { ToastContainer, toast } from "react-toastify";
import ForgotPassword from "./components/ForgotPassword.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import { FaMoon, FaSun, FaBars, FaTimes } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Carousel State
  const images = [
    "images/i1.png",
    "images/i2.png",
    "images/i3.png",
    "images/i4.png",
    "images/i5.png",
    "images/i6.png",
    "images/i7.png",
    "images/i8.png"
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Check authentication status when component mounts
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
    
    // Load dark mode preference
    const savedTheme = localStorage.getItem("darkMode");
    setDarkMode(savedTheme === "enabled");
    setLoading(false);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode ? "enabled" : "disabled");
  };

  const handleLoginSuccess = (token, username) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("username", username);
    setIsAuthenticated(true);
    toast.success(`Welcome, ${username}!`);
    navigate("/dashboard", { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    toast.info("Logged out successfully !!");
    navigate("/signin");
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className={`app ${darkMode ? "dark-mode" : "light-mode"}`}>
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <button 
              className="menu-icon" 
              onClick={() => setShowMenu(!showMenu)}
              title="Toggle Menu"
            >
              {showMenu ? <FaTimes /> : <FaBars />}
            </button>
            <h1 className="logo">AuctionHub</h1>
          </div>

          <div className="header-right">
            <button 
              className="theme-toggle-btn" 
              onClick={toggleDarkMode}
              title={`Switch to ${darkMode ? 'Light' : 'Dark'} Mode`}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            <div className="auth-container">
              {!isAuthenticated ? (
                <>
                  <Link to="/signup" className="auth-btn signup-btn">Sign Up</Link>
                  <Link to="/signin" className="auth-btn signin-btn">Sign In</Link>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {showMenu && (
        <nav className="sidebar">
          <Link to="/" className="nav-link" onClick={() => setShowMenu(false)}>Home</Link>
          <Link to={isAuthenticated ? "/dashboard" : "/signin"} className="nav-link" onClick={() => setShowMenu(false)}>Dashboard</Link>
          <Link to={isAuthenticated ? "/post-auction" : "/signin"} className="nav-link" onClick={() => setShowMenu(false)}>Post Auction</Link>
          <Link to={isAuthenticated ? "/my-auctions" : "/signin"} className="nav-link" onClick={() => setShowMenu(false)}>My Auctions</Link>
          {isAuthenticated && (
            <Link
              to="/signin"
              className="nav-link logout-link"
              onClick={() => {
                handleLogout();
                setShowMenu(false);
              }}
            >
              Logout
            </Link>
          )}
        </nav>
      )}

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Signin onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/auction/:id" element={<AuctionItem />} />
          <Route path="/post-auction" element={isAuthenticated ? <PostAuction /> : <Signin onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/auction/edit/:id" element={isAuthenticated ? <UpdateAuction /> : <Signin onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/auction/delete/:id" element={isAuthenticated ? <DeleteAuction /> : <Signin onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/my-auctions" element={isAuthenticated ? <MyAuctions /> : <Signin onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>

        {/* ✅ Carousel Section - Only on Landing */}
        {location.pathname === "/" && (
          <section className="carousel-section">
            <h2 className="carousel-title">Featured Auctions</h2>
            <section className="carousel">
              <button className="carousel-btn prev" onClick={handlePrev}>❮</button>
              <img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} className="carousel-image" />
              <button className="carousel-btn next" onClick={handleNext}>❯</button>
            </section>
          </section>
        )}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About AuctionHub</h3>
            <p>Your premier destination for online auctions and bidding.</p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/post-auction">Post Auction</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contact</h3>
            <p>Email: info@auctionhub.com</p>
            <p>Phone: +91-1234567899</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p> &copy; {new Date().getFullYear()} AuctionHub | All rights reserved.</p>
        </div>
      </footer>

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}

export default App;