const express = require('express');
const router = express.Router();
const poseController = require('../controllers/poseController');

// GET all poses with pagination
router.get('/', poseController.getPoses);

// POST create a new pose
router.post('/', poseController.createPose);

// GET pose statistics
router.get('/stats', poseController.getPoseStats);

module.exports = router;