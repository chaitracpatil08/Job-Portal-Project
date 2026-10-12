import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthRequiredModal from "./AuthRequiredModal";
import "./SearchBar.css";

function SearchBar({ initialKeyword = "", initialLocation = "", onSearch }) {
  const { isAuthenticated } = useAuth();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [location, setLocation] = useState(initialLocation);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (onSearch) {
      onSearch({ keyword, location });
    } else {
      const params = new URLSearchParams();
      if (keyword.trim()) params.append("keyword", keyword.trim());
      if (location.trim()) params.append("location", location.trim());
      navigate(`/jobs?${params.toString()}`);
    }
  };

  return (
    <>
      <form className="search-bar" onSubmit={handleSearch}>
        <div className="search-input">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Job title, keyword..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="location-input">
          <span className="location-icon">⌖</span>
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <button type="submit" className="search-button">
          <span>⌕ </span>
          Search Jobs
        </button>
      </form>

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        actionContext="search for jobs"
      />
    </>
  );
}

export default SearchBar;