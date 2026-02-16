const express = require('express');
const router = express.Router();
const masterDataController = require('../controllers/masterDataController');

router.get('/structure', masterDataController.getCampuses);
router.get('/award-types', masterDataController.getAwardTypes);
router.get('/active-period', masterDataController.getActivePeriod);

module.exports = router;
