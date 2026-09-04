import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    headline: "",
    education: "",
    skills: "",
    experience: "",
    bio: "",
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });

    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Temporary save
    localStorage.setItem("candidateProfile", JSON.stringify(profile));

    setSaved(true);
  };

  return (
    <div className="profile-page">

      {/* Header */}
      <div className="profile-top">
        <div>
          <button
            className="back-btn"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>

          <h1>My Profile</h1>

          <p>
            Keep your profile updated to improve your chances of getting hired.
          </p>
        </div>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>

        {/* Personal Information */}
        <div className="profile-card">

          <div className="card-heading">
            <div className="profile-avatar">
              👤
            </div>

            <div>
              <h2>Personal Information</h2>
              <p>Tell recruiters about yourself.</p>
            </div>
          </div>

          <div className="form-grid">

            <div className="profile-field">
              <label>Full Name</label>

              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={profile.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label>Email Address</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={profile.email}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label>Phone Number</label>

              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={profile.phone}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label>Location</label>

              <input
                type="text"
                name="location"
                placeholder="City, State"
                value={profile.location}
                onChange={handleChange}
              />
            </div>

          </div>
        </div>

        {/* Professional Information */}
        <div className="profile-card">

          <div className="card-heading">
            <div className="profile-avatar">
              💼
            </div>

            <div>
              <h2>Professional Information</h2>
              <p>Show recruiters what you can offer.</p>
            </div>
          </div>

          <div className="profile-field">
            <label>Professional Headline</label>

            <input
              type="text"
              name="headline"
              placeholder="Example: BCA Student | Full Stack Developer"
              value={profile.headline}
              onChange={handleChange}
            />
          </div>

          <div className="profile-field">
            <label>Education</label>

            <input
              type="text"
              name="education"
              placeholder="Example: BCA - XYZ College"
              value={profile.education}
              onChange={handleChange}
            />
          </div>

          <div className="profile-field">
            <label>Skills</label>

            <input
              type="text"
              name="skills"
              placeholder="Example: Java, React, Node.js, MongoDB"
              value={profile.skills}
              onChange={handleChange}
            />
          </div>

          <div className="profile-field">
            <label>Experience</label>

            <textarea
              name="experience"
              placeholder="Describe your internship, projects or work experience."
              value={profile.experience}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="profile-field">
            <label>About Me</label>

            <textarea
              name="bio"
              placeholder="Write a short description about yourself."
              value={profile.bio}
              onChange={handleChange}
              rows="5"
            />
          </div>

        </div>

        {/* Save */}
        <div className="profile-actions">

          {saved && (
            <span className="save-message">
              ✓ Profile saved successfully
            </span>
          )}

          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-btn"
          >
            Save Profile
          </button>

        </div>

      </form>

    </div>
  );
}

export default Profile;