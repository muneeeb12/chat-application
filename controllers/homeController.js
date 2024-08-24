const path = require('path');

// Show home page
exports.showHomePage = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/home.html'));
};
