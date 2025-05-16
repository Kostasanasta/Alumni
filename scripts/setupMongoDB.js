const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env file if it exists
if (fs.existsSync(path.join(__dirname, '../.env'))) {
  dotenv.config({ path: path.join(__dirname, '../.env') });
}

// Create .env file if it doesn't exist
if (!fs.existsSync(path.join(__dirname, '../.env'))) {
  const envContent = `NODE_ENV=development
PORT=5006
MONGO_URI=mongodb://localhost:27017/mediterranean-alumni
JWT_SECRET=mediterranean-alumni-secret-${Math.random().toString(36).substring(2, 15)}
JWT_EXPIRE=30d`;

  fs.writeFileSync(path.join(__dirname, '../.env'), envContent);
  console.log('Created .env file with default values');
}

console.log(`
=======================================
Mediterranean Alumni Platform Setup
=======================================

MongoDB Configuration Guide:

Option 1: Setup MongoDB Locally
-------------------------------
1. Install MongoDB Community Edition from https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. The app is already configured to use local MongoDB at: mongodb://localhost:27017/mediterranean-alumni

Option 2: Use MongoDB Atlas (Cloud)
----------------------------------
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create a database user
4. Get your connection string
5. Edit the .env file in the project root and update the MONGO_URI value

After MongoDB is running, you can initialize the database with sample data by running:
$ node scripts/initDb.js

=======================================
`);

// Check if MongoDB is running locally
const { exec } = require('child_process');
exec('mongod --version', (error, stdout, stderr) => {
  if (error) {
    console.log('MongoDB is not installed or not in your PATH.');
    console.log('Please install MongoDB or use MongoDB Atlas (cloud version).');
    console.log('Visit https://www.mongodb.com/try/download/community for installation.\n');
  } else {
    console.log('MongoDB is installed on this system.');
    console.log('Make sure the MongoDB service is running before starting the application.\n');
  }
});

console.log(`Once your MongoDB is configured, you can start the application with:
$ npm run dev

This will start both the backend server and the client application.
`); 