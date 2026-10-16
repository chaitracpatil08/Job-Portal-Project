import React from "react";
import { Link } from "react-router-dom";
import "./JobPortalLogo.css";

function JobPortalLogo({
  size = "md", // "sm", "md", "lg", "xl"
  showText = true,
  showTagline = true,
  linkTo = "/",
  inline = false,
  className = "",
}) {
  const sizeMap = {
    sm: { box: 34, radius: 8, font: 17, tagline: 8 },
    md: { box: 42, radius: 10, font: 21, tagline: 9 },
    lg: { box: 54, radius: 13, font: 25, tagline: 11 },
    xl: { box: 64, radius: 16, font: 28, tagline: 12 },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const gradientId = `logoGrad-${size}`;

  const content = (
    <div
      className={`jobportal-brand-logo size-${size} ${inline ? "inline" : ""} ${className}`}
    >
      <div
        className="jobportal-logo-icon"
        style={{
          width: `${currentSize.box}px`,
          height: `${currentSize.box}px`,
          borderRadius: `${currentSize.radius}px`,
        }}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "100%" }}
        >
          <rect
            width="40"
            height="40"
            rx={currentSize.radius}
            fill={`url(#${gradientId})`}
          />
          {/* Briefcase & Portal Arrow Motif */}
          <path
            d="M14 16V13C14 11.8954 14.8954 11 16 11H24C25.1046 11 26 11.8954 26 13V16"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <rect
            x="9"
            y="16"
            width="22"
            height="15"
            rx="4"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            fill="rgba(255,255,255,0.12)"
          />
          <path
            d="M9 21.5C13.5 24 17 24.5 20 24.5C23 24.5 26.5 24 31 21.5"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="20" cy="23.5" r="2.2" fill="#FFD166" />
          <defs>
            <linearGradient
              id={gradientId}
              x1="0"
              y1="0"
              x2="40"
              y2="40"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#6b2f52" />
              <stop offset="0.55" stopColor="#873c68" />
              <stop offset="1" stopColor="#a3487d" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="jobportal-text-block">
          <span
            className="jobportal-brand-name"
            style={{ fontSize: `${currentSize.font}px` }}
          >
            JOB<span className="jobportal-brand-accent">PORTAL</span>
          </span>
          {showTagline && (
            <span
              className="jobportal-brand-tagline"
              style={{ fontSize: `${currentSize.tagline}px` }}
            >
              CAREER HUB
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} style={{ textDecoration: "none", color: "inherit" }}>
        {content}
      </Link>
    );
  }

  return content;
}

export default JobPortalLogo;
