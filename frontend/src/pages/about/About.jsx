import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CompanyLogo from "../../components/CompanyLogo";
import "./About.css";

function About() {
  const values = [
    {
      icon: "🎯",
      title: "Radical Transparency",
      desc: "Every applicant deserves clarity. We provide real-time status updates, salary disclosures, and verified recruiter contacts.",
    },
    {
      icon: "⚡",
      title: "Direct Connections",
      desc: "We eliminate intermediaries. Candidates connect directly with hiring managers and corporate talent acquisition teams.",
    },
    {
      icon: "🛡️",
      title: "Verified & Secure",
      desc: "Every job listing and employer profile is authenticated. We maintain zero tolerance for spam, fake jobs, or data misuse.",
    },
    {
      icon: "🌱",
      title: "Career Growth",
      desc: "Beyond job boards, we empower long-term professional development with skills matching, portfolio showcases, and insights.",
    },
  ];

  const featuredPartners = ["Google", "Microsoft", "Amazon", "Accenture", "Infosys", "TCS"];

  return (
    <div className="about-page-wrapper">
      <Navbar />

      <div className="about-page">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="about-hero-badge">
            <span>✨</span> Shaping the Future of Global Recruitment
          </div>
          <h1>
            Connecting Ambitious Talent With
            <br />
            <span>World-Class Companies</span>
          </h1>
          <p className="about-hero-sub">
            JobPortal is a next-generation career marketplace bridging the gap between
            passionate professionals and forward-thinking enterprises. We make hiring
            seamless, transparent, and rewarding for everyone.
          </p>

          <div className="about-hero-actions">
            <Link to="/jobs" className="about-primary-btn">
              Explore Available Jobs →
            </Link>
            <Link to="/companies" className="about-secondary-btn">
              Discover Top Companies
            </Link>
          </div>
        </section>

        {/* Impact Numbers Section */}
        <section className="about-stats-container">
          <div className="about-stat-card">
            <h3>10,000+</h3>
            <p>Verified Active Jobs</p>
          </div>
          <div className="about-stat-card">
            <h3>5,000+</h3>
            <p>Global Partner Companies</p>
          </div>
          <div className="about-stat-card">
            <h3>100K+</h3>
            <p>Applications Processed</p>
          </div>
          <div className="about-stat-card">
            <h3>98.4%</h3>
            <p>Recruiter Satisfaction</p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="about-mission-section">
          <div className="mission-card">
            <div className="mission-icon">🚀</div>
            <h2>Our Mission</h2>
            <p>
              To democratize access to career opportunities by empowering candidates with
              real-time visibility into their application lifecycle, while equipping
              employers with powerful, intuitive recruitment tools to discover extraordinary talent.
            </p>
          </div>

          <div className="mission-card">
            <div className="mission-icon">🔭</div>
            <h2>Our Vision</h2>
            <p>
              To be the world’s most trusted career platform—a digital ecosystem where
              ambition meets opportunity, professional potentials are unlocked, and hiring
              is conducted with mutual respect, agility, and absolute integrity.
            </p>
          </div>
        </section>

        {/* Core Values */}
        <section className="about-values-section">
          <div className="section-header">
            <h2>Our Guiding Principles</h2>
            <p>The foundational pillars that guide everything we engineer and deliver.</p>
          </div>

          <div className="values-grid">
            {values.map((v, i) => (
              <div className="value-card" key={i}>
                <div className="value-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Companies We Partner With */}
        <section className="partners-section">
          <div className="section-header">
            <h2>Trusted by Industry Leaders</h2>
            <p>Thousands of companies rely on JobPortal to build their engineering and product teams.</p>
          </div>

          <div className="partners-grid">
            {featuredPartners.map((comp, idx) => (
              <div className="partner-logo-item" key={idx}>
                <CompanyLogo company={comp} size="lg" />
                <span className="partner-name">{comp}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Candidate vs Employer Section */}
        <section className="dual-benefit-section">
          <div className="benefit-card">
            <div className="benefit-tag">FOR JOB SEEKERS</div>
            <h3>Accelerate Your Career Trajectory</h3>
            <ul>
              <li>✓ Instant application status alerts (Applied, Shortlisted, Accepted)</li>
              <li>✓ Direct connection to authenticated employers</li>
              <li>✓ Tailored search by salary, job type, and experience</li>
              <li>✓ Centralized resume and portfolio profile management</li>
            </ul>
            <Link to="/register" className="benefit-link">
              Create Candidate Profile →
            </Link>
          </div>

          <div className="benefit-card highlight">
            <div className="benefit-tag">FOR RECRUITERS & EMPLOYERS</div>
            <h3>Hire Exceptional Talent Faster</h3>
            <ul>
              <li>✓ Publish verified job listings in under two minutes</li>
              <li>✓ Intuitive applicant tracking and status pipeline</li>
              <li>✓ Direct candidate contact and resume review</li>
              <li>✓ Branded company showcase page with open positions</li>
            </ul>
            <Link to="/register" className="benefit-link">
              Start Hiring Today →
            </Link>
          </div>
        </section>

        {/* Call to Action */}
        <section className="about-cta-section">
          <h2>Ready to Take the Next Step in Your Career?</h2>
          <p>Join thousands of successful candidates and forward-thinking companies on JobPortal.</p>
          <div className="cta-btn-group">
            <Link to="/register" className="cta-primary-btn">
              Get Started for Free
            </Link>
            <Link to="/contact" className="cta-secondary-btn">
              Contact Our Team
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default About;
