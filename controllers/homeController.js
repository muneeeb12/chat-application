const path = require('path');

// Show home page
exports.showHomePage = (req, res) => {
  const user = req.user;

  res.render('home', { user }); // Render home.ejs with user data
};


// Show dashboard page
exports.showDashboardPage = (req, res) => {
    // Assuming you're using Passport.js and the user is authenticated
    const user = req.user; // This should contain the user object from the session
    
    if (!user) {
        return res.redirect('/auth/login'); // Redirect to login if the user is not authenticated
    }
    
    res.render('dashboard', { user }); // Render dashboard.ejs with user data
};
