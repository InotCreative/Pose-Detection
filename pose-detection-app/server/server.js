const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' })); // Handle larger JSON payloads
app.use(morgan('dev'));

// Connect to MongoDB (optional, can be disabled if not using database)
const connectDB = async () => {
  try {
    // You can replace this with your MongoDB connection string
    // For local development, you can use MongoDB locally or a cloud service
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/pose-detection';
    
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Comment out if not using MongoDB
// connectDB();

// Routes
const poseRoutes = require('./routes/poseRoutes');
app.use('/api/poses', poseRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});