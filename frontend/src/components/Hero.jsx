import { useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useAuth } from "../context/AuthContext";
import AuthRequiredModal from "./AuthRequiredModal";
import "./Hero.css";

function Hero() {
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const trendingTags = ["React", "Java", "Python", "Full Stack", "Product Manager", "Remote"];

  return (
    <section className="hero">
      {/* Left Side */}
      <div className="hero-content">
        <div className="hero-announcement-badge">
          <span>✨</span> India's Premier Tech Recruitment Platform
        </div>

        <h1>
          Find Your Dream Job
          <br />
          Build Your <span>Future</span>
        </h1>

        <p>
          Discover curated job opportunities from Fortune 500 enterprises,
          breakthrough startups, and global tech innovators.
        </p>

        <SearchBar />

        {/* Trending Tags */}
        <div className="hero-trending">
          <span className="trending-label">Trending Searches:</span>
          <div className="trending-tags">
            {trendingTags.map((tag, idx) => (
              <Link
                to={isAuthenticated ? `/jobs?keyword=${encodeURIComponent(tag)}` : "#"}
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    setShowAuthModal(true);
                  }
                }}
                className="trending-tag-pill"
                key={idx}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="hero-image-container">
        <div className="hero-image-wrapper">
          <img
            src="/hero-illustration.png"
            alt="Job search illustration"
            className="hero-image"
          />

          {/* Floating Info Cards */}
          <div className="floating-badge badge-top">
            <span className="floating-icon">💼</span>
            <div>
              <strong>10,000+</strong>
              <p>Active Vacancies</p>
            </div>
          </div>

          <div className="floating-badge badge-bottom">
            <span className="floating-icon">⚡</span>
            <div>
              <strong>Instant Updates</strong>
              <p>Live Application Status</p>
            </div>
          </div>
        </div>
      </div>

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        actionContext="search for jobs"
      />
    </section>
  );
}

export default Hero;