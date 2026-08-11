import SearchBar from "./SearchBar";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero">

      {/* Left Side */}
      <div className="hero-content">

        <h1>
          Find Your Dream Job
          <br />
          Build Your <span>Future</span>
        </h1>

        <p>
          Discover thousands of job opportunities
          <br />
          from top companies around the world.
        </p>

        <SearchBar />

      </div>

      {/* Right Side */}
      <div className="hero-image-container">
        <img
          src="/job-illustration.png"
          alt="Job search illustration"
          className="hero-image"
        />
      </div>

    </section>
  );
}

export default Hero;