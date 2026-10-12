import React from "react";
import "./CompanyLogo.css";

// Official vector logos for verified companies
function CompanyLogo({ company = "", size = "md", className = "" }) {
  const normalized = company.trim().toLowerCase();

  const getLogoContent = () => {
    // 1. Google
    if (normalized.includes("google")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="Google Logo">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>
      );
    }

    // 2. Microsoft
    if (normalized.includes("microsoft")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="Microsoft Logo">
          <rect x="3" y="3" width="19" height="19" fill="#F25022" rx="2" />
          <rect x="26" y="3" width="19" height="19" fill="#7FBA00" rx="2" />
          <rect x="3" y="26" width="19" height="19" fill="#00A4EF" rx="2" />
          <rect x="26" y="26" width="19" height="19" fill="#FFB900" rx="2" />
        </svg>
      );
    }

    // 3. Amazon
    if (normalized.includes("amazon")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="Amazon Logo">
          <path
            fill="#232F3E"
            d="M27.2 24.1c0 2.9-.6 4.9-1.9 6.1-1.3 1.2-3.1 1.8-5.3 1.8-2 0-3.5-.5-4.6-1.6-1.1-1.1-1.6-2.7-1.6-4.9 0-2.3.6-4 1.9-5.2 1.3-1.2 3.1-1.8 5.4-1.8 2 0 3.6.5 4.7 1.6 1 1 1.4 2.3 1.4 4zm4.8.2c0-3.5-.9-6.3-2.8-8.2-1.9-1.9-4.7-2.9-8.4-2.9-3.2 0-5.8.7-7.8 2.1-2 1.4-3.1 3.2-3.3 5.4l4.3.5c.2-1.2.9-2.2 2-2.9 1.1-.7 2.7-1.1 4.7-1.1 2.2 0 3.8.5 4.9 1.5 1.1 1 1.7 2.4 1.7 4.3v1.8c-1.3-.3-2.8-.5-4.4-.5-3.8 0-6.8.9-8.8 2.6-2 1.7-3.1 4.1-3.1 7.1 0 2.7.9 4.9 2.8 6.5 1.9 1.6 4.4 2.4 7.4 2.4 2.8 0 5-.7 6.6-2v1.6h4.8v-20.7z"
          />
          <path
            fill="#FF9900"
            d="M38.8 38.2c-5.4 3.9-12.9 6-20.4 6-9.8 0-18.7-3.6-25.4-9.8-.5-.5-.1-1.1.5-.8 6.9 4 15.3 6.4 24.4 6.4 6.8 0 13.9-1.7 20.3-5.2.8-.4 1.5.5.6 1.4z"
          />
          <path
            fill="#FF9900"
            d="M40.9 35.8c-.7-.9-4.5-.4-6.3-.2-.5 0-.6-.5-.1-.8 3-2.1 8.1-1.5 8.7-.7.6.8-.2 6-3.1 8.3-.4.3-.8.2-.6-.3.6-1.5 2.1-5.4 1.4-6.3z"
          />
        </svg>
      );
    }

    // 4. Accenture
    if (normalized.includes("accenture")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="Accenture Logo">
          <circle cx="24" cy="24" r="22" fill="#FAF4FA" stroke="#A100FF" strokeWidth="2" />
          <path
            fill="#A100FF"
            d="M17 14l15 10-15 10 3.5 2.5L38 24 20.5 11.5z"
          />
        </svg>
      );
    }

    // 5. Infosys
    if (normalized.includes("infosys")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="Infosys Logo">
          <rect width="48" height="48" rx="10" fill="#007CC3" />
          <text
            x="24"
            y="32"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
            fontSize="26"
            fill="#FFFFFF"
            textAnchor="middle"
            fontStyle="italic"
          >
            infy
          </text>
        </svg>
      );
    }

    // 6. TCS (Tata Consultancy Services)
    if (normalized.includes("tcs") || normalized.includes("tata consultancy")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="TCS Logo">
          <rect width="48" height="48" rx="10" fill="#002D62" />
          <text
            x="24"
            y="30"
            fontFamily="Impact, Arial Black, sans-serif"
            fontWeight="900"
            fontSize="20"
            fill="#FFFFFF"
            letterSpacing="1"
            textAnchor="middle"
          >
            TCS
          </text>
          <line x1="12" y1="35" x2="36" y2="35" stroke="#E31837" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    }

    // 7. Tata Group
    if (normalized === "tata" || normalized.includes("tata group")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="Tata Logo">
          <rect width="48" height="48" rx="10" fill="#003B70" />
          <text
            x="24"
            y="30"
            fontFamily="Impact, Arial Black, sans-serif"
            fontWeight="900"
            fontSize="18"
            fill="#FFFFFF"
            letterSpacing="2"
            textAnchor="middle"
          >
            TATA
          </text>
          <circle cx="24" cy="38" r="2.5" fill="#00A3E0" />
        </svg>
      );
    }

    // 8. Mindtree
    if (normalized.includes("mindtree")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="Mindtree Logo">
          <rect width="48" height="48" rx="10" fill="#EB1C24" />
          <text x="24" y="30" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="22" fill="#FFFFFF" textAnchor="middle">
            M
          </text>
          <path d="M12 36 Q 24 32 36 36" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    }

    // 9. Cognizant
    if (normalized.includes("cognizant")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="Cognizant Logo">
          <rect width="48" height="48" rx="10" fill="#0033A0" />
          <circle cx="24" cy="24" r="14" stroke="#00B2E2" strokeWidth="3" fill="none" />
          <circle cx="24" cy="24" r="6" fill="#FFFFFF" />
        </svg>
      );
    }

    // 10. Capgemini
    if (normalized.includes("capgemini")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="Capgemini Logo">
          <rect width="48" height="48" rx="10" fill="#0070AD" />
          <path d="M24 10 C 16 16 16 28 24 38 C 32 28 32 16 24 10 Z" fill="#13B5EA" />
          <circle cx="24" cy="20" r="4" fill="#FFFFFF" />
        </svg>
      );
    }

    // 11. IBM
    if (normalized.includes("ibm")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="IBM Logo">
          <rect width="48" height="48" rx="10" fill="#054ADA" />
          <text x="24" y="32" fontFamily="Courier New, monospace" fontWeight="900" fontSize="22" fill="#FFFFFF" letterSpacing="2" textAnchor="middle">
            IBM
          </text>
        </svg>
      );
    }

    // 12. Oracle
    if (normalized.includes("oracle")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="Oracle Logo">
          <rect width="48" height="48" rx="10" fill="#F80000" />
          <rect x="12" y="14" width="24" height="20" rx="10" fill="none" stroke="#FFFFFF" strokeWidth="4" />
        </svg>
      );
    }

    // 13. HCLTech
    if (normalized.includes("hcl")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="HCLTech Logo">
          <rect width="48" height="48" rx="10" fill="#0B409C" />
          <text x="24" y="31" fontFamily="Impact, Arial Black, sans-serif" fontWeight="900" fontSize="17" fill="#FFFFFF" letterSpacing="1" textAnchor="middle">
            HCL
          </text>
          <line x1="12" y1="36" x2="36" y2="36" stroke="#00B0FF" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    }

    // 14. Tech Mahindra
    if (normalized.includes("tech mahindra") || normalized.includes("mahindra")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="Tech Mahindra Logo">
          <rect width="48" height="48" rx="10" fill="#E31837" />
          <text x="24" y="27" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="13" fill="#FFFFFF" textAnchor="middle">
            TECH
          </text>
          <text x="24" y="39" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="10" fill="#FFFFFF" letterSpacing="1" textAnchor="middle">
            M
          </text>
        </svg>
      );
    }

    // 15. LTIMindtree
    if (normalized.includes("ltimindtree")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="LTIMindtree Logo">
          <rect width="48" height="48" rx="10" fill="#00355F" />
          <text x="24" y="30" fontFamily="Arial Black, sans-serif" fontWeight="bold" fontSize="14" fill="#00A3E0" textAnchor="middle">
            LTIM
          </text>
        </svg>
      );
    }

    // 16. Deloitte
    if (normalized.includes("deloitte")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="Deloitte Logo">
          <rect width="48" height="48" rx="10" fill="#000000" />
          <text x="22" y="31" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="24" fill="#FFFFFF" textAnchor="middle">
            D
          </text>
          <circle cx="35" cy="30" r="3.5" fill="#86BC25" />
        </svg>
      );
    }

    // 17. NVIDIA
    if (normalized.includes("nvidia")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="NVIDIA Logo">
          <rect width="48" height="48" rx="10" fill="#000000" />
          <path d="M12 28 C 12 18 20 14 26 14 C 32 14 36 18 36 28 C 30 20 22 22 18 28 Z" fill="#76B900" />
          <circle cx="24" cy="30" r="4" fill="#76B900" />
        </svg>
      );
    }

    // 18. Flipkart
    if (normalized.includes("flipkart")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="Flipkart Logo">
          <rect width="48" height="48" rx="10" fill="#2874F0" />
          <text x="24" y="32" fontFamily="Arial Black, Impact, sans-serif" fontWeight="900" fontSize="26" fontStyle="italic" fill="#FFE500" textAnchor="middle">
            f
          </text>
        </svg>
      );
    }

    // 19. Adobe
    if (normalized.includes("adobe")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="Adobe Logo">
          <rect width="48" height="48" rx="10" fill="#FA0F00" />
          <polygon points="12,38 18,38 24,24 18,10" fill="#FFFFFF" />
          <polygon points="36,38 30,38 24,24 30,10" fill="#FFFFFF" />
          <polygon points="21,30 27,30 24,22" fill="#FFFFFF" />
        </svg>
      );
    }

    // 20. Cisco
    if (normalized.includes("cisco")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="Cisco Logo">
          <rect width="48" height="48" rx="10" fill="#049FD9" />
          <line x1="12" y1="28" x2="12" y2="20" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="18" y1="32" x2="18" y2="16" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="24" y1="34" x2="24" y2="14" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="30" y1="32" x2="30" y2="16" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="36" y1="28" x2="36" y2="20" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    }

    // 21. Intel
    if (normalized.includes("intel")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="Intel Logo">
          <rect width="48" height="48" rx="10" fill="#0068B5" />
          <text x="24" y="30" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="18" fill="#FFFFFF" letterSpacing="1" textAnchor="middle">
            intel
          </text>
          <circle cx="21" cy="18" r="2" fill="#00C7FD" />
        </svg>
      );
    }

    // 22. SAP
    if (normalized.includes("sap")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="SAP Logo">
          <rect width="48" height="48" rx="10" fill="#008FD3" />
          <text x="24" y="32" fontFamily="Impact, Arial Black, sans-serif" fontWeight="900" fontSize="19" fill="#FFFFFF" letterSpacing="1" textAnchor="middle">
            SAP
          </text>
        </svg>
      );
    }

    // 23. Salesforce
    if (normalized.includes("salesforce")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="Salesforce Logo">
          <rect width="48" height="48" rx="10" fill="#00A1E0" />
          <path d="M19 18 C 17 14 23 12 26 14 C 29 11 35 13 35 18 C 39 19 39 26 34 27 C 33 30 27 30 25 28 C 22 31 16 29 16 25 C 13 24 13 19 19 18 Z" fill="#FFFFFF" />
        </svg>
      );
    }

    // 24. Zoho
    if (normalized.includes("zoho")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="Zoho Logo">
          <rect width="48" height="48" rx="10" fill="#FFFFFF" stroke="#E6E6E6" strokeWidth="1" />
          <rect x="10" y="10" width="12" height="12" rx="3" fill="#E42528" />
          <rect x="26" y="10" width="12" height="12" rx="3" fill="#226BB3" />
          <rect x="10" y="26" width="12" height="12" rx="3" fill="#2DA84A" />
          <rect x="26" y="26" width="12" height="12" rx="3" fill="#F8B126" />
        </svg>
      );
    }

    // 25. Samsung
    if (normalized.includes("samsung")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="Samsung Logo">
          <rect width="48" height="48" rx="10" fill="#1428A0" />
          <ellipse cx="24" cy="24" rx="20" ry="10" fill="none" stroke="#FFFFFF" strokeWidth="2" transform="rotate(-15 24 24)" />
          <text x="24" y="28" fontFamily="Impact, Arial Black, sans-serif" fontWeight="bold" fontSize="9" fill="#FFFFFF" letterSpacing="1" textAnchor="middle">
            SAMSUNG
          </text>
        </svg>
      );
    }

    // Additional: Apple
    if (normalized.includes("apple")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="Apple Logo">
          <path
            fill="#333333"
            d="M32.8 24.3c0-5 4.1-7.4 4.3-7.5-2.3-3.4-6-3.8-7.3-3.9-3.1-.3-6.1 1.8-7.7 1.8-1.6 0-4.1-1.8-6.7-1.7-3.4.1-6.6 2-8.4 5.1-3.6 6.3-.9 15.6 2.6 20.7 1.7 2.5 3.8 5.2 6.5 5.1 2.6-.1 3.6-1.7 6.7-1.7s4 1.7 6.7 1.6c2.8-.1 4.5-2.5 6.2-4.9 2-2.9 2.8-5.7 2.8-5.8-.1-.1-5.7-2.2-5.7-8.8zm-5-14.7c1.4-1.7 2.3-4.1 2.1-6.6-2 .1-4.4 1.3-5.8 3-1.2 1.4-2.3 3.9-2 6.3 2.2.2 4.4-1 5.7-2.7z"
          />
        </svg>
      );
    }

    // Additional: Meta / Facebook
    if (normalized.includes("meta") || normalized.includes("facebook")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="Meta Logo">
          <path
            fill="#0668E1"
            d="M24 18c-3.2 0-6.1 1.7-7.8 4.3-2.1 3.3-3.6 7.7-6 7.7-1.5 0-2.2-1.2-2.2-3 0-4.2 2.9-9 7.4-9 2.4 0 4.5.9 5.8 2.5L24 24l2.8-3.5c1.3-1.6 3.4-2.5 5.8-2.5 4.5 0 7.4 4.8 7.4 9 0 1.8-.7 3-2.2 3-2.4 0-3.9-4.4-6-7.7-1.7-2.6-4.6-4.3-7.8-4.3z"
          />
        </svg>
      );
    }

    // Additional: Netflix
    if (normalized.includes("netflix")) {
      return (
        <svg viewBox="0 0 48 48" className="company-svg-logo" aria-label="Netflix Logo">
          <rect width="48" height="48" rx="10" fill="#141414" />
          <path fill="#E50914" d="M14 8h5.5v32H14z" />
          <path fill="#B81D24" d="M28.5 8H34v32h-5.5z" />
          <path fill="#E50914" d="M14 8l14.8 32H34L19.5 8z" />
        </svg>
      );
    }

    // Fallback: Elegant branded initials badge
    const initial = company.trim() ? company.trim()[0].toUpperCase() : "💼";
    return <span className="company-fallback-initial">{initial}</span>;
  };

  return (
    <div className={`company-logo-container size-${size} ${className}`} title={company}>
      {getLogoContent()}
    </div>
  );
}

export default CompanyLogo;
