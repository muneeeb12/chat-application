const app = require("../importFiles/importFiles");
const router = app.express.Router();

// Route to show home page
router.get('/', app.homeController.showHomePage);

// Route to show dashboard page
router.get('/dashboard', app.authMiddleware, app.homeController.showDashboardPage);


module.exports = router;
