export const sessionMiddleware = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const sessionAge = Date.now() - req.session.cookie._expires;
  const maxSessionTime = 3 * 24 * 60 * 60 * 1000;

  if (sessionAge > maxSessionTime) {
    req.session.destroy();
    return res
      .status(401)
      .json({ message: "Session expired. Please log in again." });
  }

  next();
};
