export const sessionMiddleware = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
};

// Role-Based Authorization Middleware
export const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.session.user || !roles.includes(req.session.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
