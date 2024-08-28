const User = require("../models/UserModel");

// Show home page
exports.showHomePage = (req, res) => {
  const user = req.user;
  res.render('home', { user });
};

// Show dashboard page
exports.showDashboardPage = (req, res) => {
  const user = req.user;
  if (!user) {
    return res.redirect('/auth/login');
  }
  res.render('dashboard', { user });
};
// Test route
exports.test = (req, res) => {
  res.render('test');
};
