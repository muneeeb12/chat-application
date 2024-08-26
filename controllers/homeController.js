const path = require('path');

// Show home page
exports.showHomePage = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/home.html'));
};

// Show dashboard page
exports.showDashboardPage = (req, res) => {
  res.render('dashboard', { user: req.user });
};
