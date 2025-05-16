const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Function to create env file if it doesn't exist
const createEnvFileIfNotExists = () => {
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    const envContent = `NODE_ENV=development
PORT=5006
MONGO_URI=mongodb://localhost:27017/mediterranean-alumni
JWT_SECRET=mediterranean-alumni-secret-${Math.random().toString(36).substring(2, 15)}
JWT_EXPIRE=30d`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('Created .env file with default values');
  }
};

const connectDB = async () => {
  try {
    // Make sure env file exists
    createEnvFileIfNotExists();
    
    // Get MongoDB URI from env or use default
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mediterranean-alumni';
    
    // Try to connect to MongoDB
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    console.log('Server will continue running without database connection');
    
    // Provide helpful information about setting up MongoDB
    if (err.message.includes('ECONNREFUSED')) {
      console.log('\nTo fix this issue:');
      console.log('1. Make sure MongoDB is installed and running locally');
      console.log('2. OR use MongoDB Atlas (cloud) by updating MONGO_URI in your .env file');
      console.log('3. Run npm run dev to start the application');
      console.log('\nNote: App will use mock data instead of database\n');
    }
    
    return false;
  }
};

module.exports = connectDB; 