import "./SearchBar.css";
function SearchBar() {
  return (
    <div className="search-bar">

      <div className="search-input">
        <span className="search-icon">⌕</span>
        <input
          type="text"
          placeholder="Job title, keyword..."
        />
      </div>

      <div className="location-input">
        <span className="location-icon">⌖</span>
        <input
          type="text"
          placeholder="Location"
        />
      </div>

      <button className="search-button">
        <span>⌕</span>
        Search Jobs
      </button>

    </div>
  );
}

export default SearchBar;