const app = require("../importFiles/importFiles.js");
const router = app.express.Router();

// Registration routes
router.get('/register', app.authController.showRegisterPage);
router.post('/register', app.registerValidationRules(),app.validate, app.authController.registerUser);

// Local login routes
router.get('/login', app.authController.showLoginPage);
router.post('/login', app.authController.loginUser);

// Google OAuth routes
router.get('/google', app.authController.googleLogin);
router.get('/google/callback', app.authController.googleCallback);

// Password setup routes
router.get('/set-password/:id', app.authController.showSetPasswordPage);
router.post('/set-password/:id', app.authController.setPassword);

// Logout route
router.get('/logout', app.authController.logoutUser);

module.exports = router;
