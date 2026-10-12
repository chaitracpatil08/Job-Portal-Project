const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Normalize roles (candidate and jobseeker are synonymous in this portal)
    const normalizedUserRole = req.user.role === "candidate" ? "jobseeker" : req.user.role;
    const normalizedAllowed = allowedRoles.map((role) =>
      role === "candidate" ? "jobseeker" : role
    );

    if (!normalizedAllowed.includes(normalizedUserRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
