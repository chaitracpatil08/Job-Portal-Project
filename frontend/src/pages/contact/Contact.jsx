import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { contactAPI } from "../../services/api";
import "./Contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    inquiryType: "Candidate Support",
    subject: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [activeFaq, setActiveFaq] = useState(0);

  const contactChannels = [
    {
      icon: "✉️",
      title: "Email Support",
      detail: "support@jobportal.com",
      sub: "Typical response within 2-4 hours",
    },
    {
      icon: "💼",
      title: "Employer Partnerships",
      detail: "hire@jobportal.com",
      sub: "Custom hiring plans & enterprise accounts",
    },
    {
      icon: "📞",
      title: "Toll-Free Helpline",
      detail: "+91 80 4123 4567",
      sub: "Mon - Sat, 9:00 AM to 7:00 PM IST",
    },
    {
      icon: "📍",
      title: "Technology Center",
      detail: "MG Road, Bangalore 560001",
      sub: "Regional Hub: Hitec City, Hyderabad",
    },
  ];

  const faqs = [
    {
      question: "How do I apply for jobs on JobPortal?",
      answer:
        "Simply create a free candidate account, explore our Jobs directory, apply filters for role and experience, and click 'Apply Now' on any listing. You can provide your resume link and a customized cover note.",
    },
    {
      question: "How can employers post job openings?",
      answer:
        "Register as an Employer, navigate to your Employer Portal, and click '+ Post a Job'. Fill in the role details, requirements, and salary package. Your listing goes live immediately to thousands of active candidates.",
    },
    {
      question: "Is JobPortal completely free for candidates?",
      answer:
        "Yes! Searching for jobs, applying to top companies, tracking application statuses, and building a profile are 100% free for candidates with zero hidden charges.",
    },
    {
      question: "How does real-time application tracking work?",
      answer:
        "Whenever an employer views, shortlists, accepts, or updates your application status, you receive an immediate notification in your Candidate Dashboard and your application status badge updates dynamically.",
    },
    {
      question: "Are company listings and salaries verified?",
      answer:
        "All employer accounts and postings undergo automated verification to guarantee authenticity and safeguard candidate privacy.",
    },
  ];

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (submitError) setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await contactAPI.submitContactMessage(formData);
      if (res.success) {
        setSubmitted(true);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          inquiryType: "Candidate Support",
          subject: "",
          message: "",
        });
        setTimeout(() => setSubmitted(false), 6000);
      } else {
        setSubmitError(res.message || "Failed to submit message. Please try again.");
      }
    } catch (err) {
      console.error("Contact form error:", err);
      setSubmitError(err.message || "Could not send inquiry. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <div className="contact-page-wrapper">
      <Navbar />

      <div className="contact-page">
        {/* Contact Hero */}
        <section className="contact-hero">
          <div className="contact-hero-badge">
            <span>💬</span> 24/7 Dedicated Support & Inquiries
          </div>
          <h1>
            We’re Here to Help You
            <br />
            <span>Succeed in Your Journey</span>
          </h1>
          <p className="contact-hero-sub">
            Have a question about a job application, enterprise recruitment partnerships,
            or platform features? Drop us a message and our team will get back to you promptly.
          </p>
        </section>

        {/* Contact Info Cards Grid */}
        <section className="contact-channels-container">
          {contactChannels.map((c, i) => (
            <div className="channel-card" key={i}>
              <div className="channel-icon">{c.icon}</div>
              <h3>{c.title}</h3>
              <p className="channel-detail">{c.detail}</p>
              <p className="channel-sub">{c.sub}</p>
            </div>
          ))}
        </section>

        {/* Form and FAQ Section */}
        <div className="contact-main-grid">
          {/* Left: Interactive Form */}
          <div className="contact-form-card">
            <h2>Send Us a Message</h2>
            <p className="form-subtitle">Fill in the details below and we will respond within 24 hours.</p>

            {submitted && (
              <div className="contact-success-banner">
                <span>✓</span>
                <div>
                  <strong>Thank you! Message received.</strong>
                  <p>Our team will reach out to you shortly at the provided email.</p>
                </div>
              </div>
            )}

            {submitError && (
              <div
                style={{
                  backgroundColor: "#fff1f0",
                  border: "1px solid #ffa39e",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  color: "#cf1322",
                  marginBottom: "16px",
                  fontSize: "13.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>⚠️</span>
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="contact-form-row">
                <div className="contact-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="contact-field">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="contact-form-row">
                <div className="contact-field">
                  <label>Phone Number (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="contact-field">
                  <label>Inquiry Category</label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                  >
                    <option value="Candidate Support">Candidate Support</option>
                    <option value="Employer Partnership">Employer Partnership</option>
                    <option value="Job Listing Verification">Job Listing Verification</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="General Feedback">General Feedback</option>
                  </select>
                </div>
              </div>

              <div className="contact-field">
                <label>Subject *</label>
                <input
                  type="text"
                  name="subject"
                  placeholder="What can we help you with?"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="contact-field">
                <label>Message *</label>
                <textarea
                  name="message"
                  rows="4"
                  placeholder="Please provide specifics about your question or request..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="contact-submit-btn" disabled={submitting}>
                {submitting ? "Sending Message..." : "Send Message →"}
              </button>
            </form>
          </div>

          {/* Right: FAQ Accordion */}
          <div className="contact-faq-card">
            <h2>Frequently Asked Questions</h2>
            <p className="form-subtitle">Instant answers to commonly asked questions.</p>

            <div className="faq-list">
              {faqs.map((faq, idx) => (
                <div
                  className={`faq-item ${activeFaq === idx ? "expanded" : ""}`}
                  key={idx}
                >
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => toggleFaq(idx)}
                  >
                    <span>{faq.question}</span>
                    <span className="faq-chevron">{activeFaq === idx ? "−" : "+"}</span>
                  </button>

                  {activeFaq === idx && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="faq-help-box">
              <h4>Can’t find what you’re looking for?</h4>
              <p>Our customer happiness team is online 6 days a week to guide you.</p>
              <a href="mailto:support@jobportal.com" className="faq-direct-mail">
                Write to support@jobportal.com →
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Contact;
