function ApplicationStatusBadge({ status = "Applied" }) {
  const styles = {
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      letterSpacing: "0.3px",
      textTransform: "capitalize",
    },
  };

  const getStatusConfig = () => {
    switch (status.toLowerCase()) {
      case "accepted":
        return {
          bg: "#eafaf1",
          color: "#27ae60",
          border: "1px solid #c7f0d8",
          icon: "✓",
        };
      case "shortlisted":
        return {
          bg: "#fbf1f6",
          color: "#6b2f52",
          border: "1px solid #ebd4e4",
          icon: "★",
        };
      case "rejected":
        return {
          bg: "#fef0f0",
          color: "#e74c3c",
          border: "1px solid #fadbd8",
          icon: "✕",
        };
      case "applied":
      default:
        return {
          bg: "#ebf5fb",
          color: "#2980b9",
          border: "1px solid #d4e6f1",
          icon: "●",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      style={{
        ...styles.badge,
        backgroundColor: config.bg,
        color: config.color,
        border: config.border,
      }}
    >
      <span>{config.icon}</span>
      <span>{status}</span>
    </span>
  );
}

export default ApplicationStatusBadge;
