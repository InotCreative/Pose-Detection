const Pose = require('../models/poseModel');

// Get all poses (with pagination)
exports.getPoses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const poses = await Pose.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Pose.countDocuments();

    res.status(200).json({
      poses,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error fetching poses:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new pose record
exports.createPose = async (req, res) => {
  try {
    const { timestamp, model, poses } = req.body;

    // Optional: Add some validation here

    const newPose = new Pose({
      timestamp,
      model,
      poses,
      // You could add user ID here if you implement authentication
      userId: 'anonymous'
    });

    const savedPose = await newPose.save();
    res.status(201).json(savedPose);
  } catch (error) {
    console.error('Error creating pose:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get pose statistics
exports.getPoseStats = async (req, res) => {
  try {
    // Get count of poses by model
    const modelStats = await Pose.aggregate([
      {
        $group: {
          _id: '$model',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get count of poses by day for the last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const dailyStats = await Pose.aggregate([
      {
        $match: {
          createdAt: { $gte: oneWeekAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1
        }
      }
    ]);

    res.status(200).json({
      modelStats,
      dailyStats
    });
  } catch (error) {
    console.error('Error fetching pose stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
};