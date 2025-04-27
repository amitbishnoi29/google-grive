const express = require("express");
const router = express.Router();
const passport = require("passport");

// Google OAuth routes
router.get("/google", (req, res, next) => {
  console.log("\n🔵 Google Auth Request:");
  console.log("Time:", new Date().toISOString());
  console.log("IP:", req.ip);
  console.log("User Agent:", req.get("user-agent"));
  console.log("Requested Scopes:", [
    "profile",
    "email",
    "https://www.googleapis.com/auth/drive",
  ]);

  passport.authenticate("google", {
    scope: ["profile", "email", "https://www.googleapis.com/auth/drive"],
  })(req, res, next);
});

router.get(
  "/google/callback",
  (req, res, next) => {
    console.log("\n🟢 Google Auth Callback:");
    console.log("Time:", new Date().toISOString());
    console.log("IP:", req.ip);
    console.log("Query Params:", req.query);

    passport.authenticate("google", { failureRedirect: "/login" })(
      req,
      res,
      next
    );
  },
  (req, res) => {
    console.log("✅ Authentication Successful");
    console.log("User ID:", req.user.id);
    console.log("User Email:", req.user.email);

    // Generate JWT token
    // const token = generateToken(req.user);

    // Set token in cookie
    // setTokenCookie(res, token);

    // Redirect to frontend with success message
    res.redirect('/');
    // console.log("Redirecting to:", process.env.CLIENT_URL || "http://localhost:3000");
    // res.redirect(process.env.CLIENT_URL || "http://localhost:3000");
  }
);

// Get current user
router.get("/current", (req, res) => {
  console.log("\n🟡 Current User Request:", req.user);
  console.log("Time:", new Date().toISOString());
  console.log("IP:", req.ip);
  console.log("Session ID:", req.sessionID);
  if (req.isAuthenticated()) {
    console.log("✅ User Authenticated");
    console.log("User ID:", req.user.id);
    console.log("User Email:", req.user.email);

    res.json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      displayName: req.user.displayName,
      profilePicture: req.user.profilePicture,
    });
  } else {
    console.log("❌ User Not Authenticated");
    res.status(401).json({ message: "Not authenticated" });
  }
});

// Logout
router.get("/logout", (req, res) => {
  console.log("\n🔴 Logout Request:");
  console.log("Time:", new Date().toISOString());
  console.log("IP:", req.ip);
  console.log("User ID:", req.user?.id);

  // Logout from Passport
  req.logout((err) => {
    if (err) {
      console.error("❌ Logout Error:", err);
      return res.status(500).json({ message: "Error logging out" });
    }

    console.log("✅ Logout Successful");
    res.status(200).json({ message: "Logged out successfully" });
  });
});

module.exports = router;
