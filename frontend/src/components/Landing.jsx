import { useNavigate } from 'react-router-dom';
import { FaGavel, FaArrowRight } from 'react-icons/fa';

function Landing() {
  const navigate = useNavigate();

  return (
    <section className="landing-container">
      <div className="landing-content">
        <div className="landing-hero">
          <h1 className="landing-title">
            <FaGavel className="landing-icon" />
            Bid. Win. Repeat.
          </h1>
          <p className="landing-subtitle">
            Your Ultimate Auction Experience
          </p>
          <p className="landing-description">
            Discover a world of exciting auctions, incredible deals, and a passionate community of bidders and sellers.
          </p>
          <button 
            onClick={() => {
              const token = localStorage.getItem("authToken");
              if (token) {
                navigate("/dashboard");
              } else {
                navigate("/signin");
              }
            }}
            className="landing-cta-btn"
          >
            Get Started <FaArrowRight />
          </button>
        </div>

        <div className="landing-features">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Browse</h3>
            <p>Explore thousands of unique items</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Bid</h3>
            <p>Competitive bidding in real-time</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Win</h3>
            <p>Secure your desired items</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast & Secure</h3>
            <p>Quick transactions with trusted sellers</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Landing;
