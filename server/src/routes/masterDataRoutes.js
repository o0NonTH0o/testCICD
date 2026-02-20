const express = require('express');
const router = express.Router();
const masterDataController = require('../controllers/masterDataController');
const authMiddleware = require('../middlewares/authMiddleware'); // Import middleware if not already

router.get('/structure', masterDataController.getCampuses);
// Use auth middleware to get user context for filtering stats
router.get('/award-types', authMiddleware, masterDataController.getAwardTypes);
// Temporarily removing auth for dev/demo if needed or ensuring client sends token correctly
router.post('/award-types', masterDataController.createAwardType); 
router.get('/award-types/:id', masterDataController.getAwardTypeById);
router.put('/award-types/:id', masterDataController.updateAwardType);
router.get('/active-period', masterDataController.getActivePeriod);

module.exports = router;
