const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Profile = require('../models/Profile');
const School = require('../models/School');
const Event = require('../models/Event');
const Album = require('../models/Album');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mediterranean-alumni';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB Connected');
    return true;
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

// Initialize admin user
const createAdminUser = async () => {
  try {
    let admin = await User.findOne({ email: 'admin@mediterranean.edu' });
    
    if (!admin) {
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      admin = new User({
        name: 'Admin User',
        email: 'admin@mediterranean.edu',
        password: hashedPassword,
        role: 'admin'
      });
      
      await admin.save();
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }
    
    return admin;
  } catch (err) {
    console.error('Error creating admin user:', err.message);
    throw err;
  }
};

// Initialize schools
const createSchools = async () => {
  try {
    const schoolCount = await School.countDocuments();
    
    if (schoolCount === 0) {
      const schools = [
        {
          name: 'School of Business',
          description: 'The School of Business at Mediterranean College',
          image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf'
        },
        {
          name: 'School of Computing',
          description: 'The School of Computing at Mediterranean College',
          image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97'
        },
        {
          name: 'School of Psychology',
          description: 'The School of Psychology at Mediterranean College',
          image: 'https://images.unsplash.com/photo-1576669801775-ff43c5ab079d'
        },
        {
          name: 'School of Engineering',
          description: 'The School of Engineering at Mediterranean College',
          image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12'
        }
      ];
      
      await School.insertMany(schools);
      console.log('Schools created');
    } else {
      console.log('Schools already exist');
    }
    
    return await School.find();
  } catch (err) {
    console.error('Error creating schools:', err.message);
    throw err;
  }
};

// Initialize sample alumni users
const createAlumniUsers = async (schools) => {
  try {
    const alumniCount = await User.countDocuments({ role: 'registeredAlumni' });
    
    if (alumniCount === 0) {
      const salt = await bcrypt.genSalt(10);
      
      // Create a few sample alumni
      const alumni = [
        {
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: await bcrypt.hash('password123', salt),
          role: 'registeredAlumni'
        },
        {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          password: await bcrypt.hash('password123', salt),
          role: 'registeredAlumni'
        },
        {
          name: 'George Papadopoulos',
          email: 'george.p@example.com',
          password: await bcrypt.hash('password123', salt),
          role: 'registeredAlumni'
        }
      ];
      
      const createdAlumni = await User.insertMany(alumni);
      console.log('Alumni users created');
      
      // Create profiles for alumni
      const profiles = [
        {
          user: createdAlumni[0]._id,
          school: schools[0]._id, // Business School
          graduationYear: 2019,
          degree: 'MBA in Business Administration',
          currentPosition: 'Marketing Manager',
          company: 'Global Solutions Inc.',
          location: 'Athens, Greece',
          skills: ['Marketing', 'Management', 'Finance', 'Sales'],
          status: 'approved'
        },
        {
          user: createdAlumni[1]._id,
          school: schools[1]._id, // Computing School
          graduationYear: 2020,
          degree: 'BSc in Computer Science',
          currentPosition: 'Senior Developer',
          company: 'Tech Innovations SA',
          location: 'Thessaloniki, Greece',
          skills: ['JavaScript', 'Python', 'React', 'Node.js'],
          status: 'approved'
        },
        {
          user: createdAlumni[2]._id,
          school: schools[2]._id, // Psychology School
          graduationYear: 2018,
          degree: 'BSc in Psychology',
          currentPosition: 'Clinical Psychologist',
          company: 'Athens Medical Center',
          location: 'Athens, Greece',
          skills: ['Clinical Psychology', 'Counseling', 'Research', 'Therapy'],
          status: 'approved'
        }
      ];
      
      await Profile.insertMany(profiles);
      console.log('Alumni profiles created');
    } else {
      console.log('Alumni users already exist');
    }
  } catch (err) {
    console.error('Error creating alumni users:', err.message);
    throw err;
  }
};

// Initialize sample events
const createEvents = async (adminId) => {
  try {
    const eventCount = await Event.countDocuments();
    
    if (eventCount === 0) {
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);
      
      const lastMonth = new Date(today);
      lastMonth.setMonth(today.getMonth() - 1);
      
      const events = [
        {
          title: 'Career Day 2023',
          description: 'Annual career day with companies from all over Greece. Bring your resume and be ready for on-site interviews!',
          date: nextMonth,
          time: '10:00',
          location: 'Main Campus, Athens',
          category: 'career',
          image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
          registrationEnabled: true,
          registrationDeadline: new Date(nextMonth.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days before the event
          createdBy: adminId
        },
        {
          title: 'Alumni Networking Night',
          description: 'Join us for an evening of networking with fellow alumni from all departments. Refreshments will be served.',
          date: new Date(nextMonth.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days after next month
          time: '19:00',
          location: 'Gallery Hall, Thessaloniki Campus',
          category: 'networking',
          image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622',
          registrationEnabled: true,
          registrationDeadline: new Date(nextMonth.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days after next month
          createdBy: adminId
        },
        {
          title: 'Workshop: Digital Marketing Trends',
          description: 'Learn about the latest trends in digital marketing from industry experts in this practical workshop.',
          date: new Date(nextMonth.getTime() + 20 * 24 * 60 * 60 * 1000), // 20 days after next month
          time: '14:00',
          location: 'Digital Lab, Athens Campus',
          category: 'workshop',
          image: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
          registrationEnabled: true,
          registrationDeadline: new Date(nextMonth.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days after next month
          createdBy: adminId
        },
        {
          title: 'Summer Party 2023',
          description: 'Our annual summer celebration with food, music, and games! Open to all alumni and their families.',
          date: lastMonth, // Past event
          time: '16:00',
          location: 'Beach Club, Athens Riviera',
          category: 'social',
          image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6a3',
          registrationEnabled: false,
          createdBy: adminId
        }
      ];
      
      await Event.insertMany(events);
      console.log('Events created');
    } else {
      console.log('Events already exist');
    }
  } catch (err) {
    console.error('Error creating events:', err.message);
    throw err;
  }
};

// Initialize photo albums
const createAlbums = async (adminId) => {
  try {
    const albumCount = await Album.countDocuments();
    
    if (albumCount === 0) {
      const albums = [
        {
          title: 'Graduation Ceremony 2023',
          description: 'Photos from the graduation ceremony of the class of 2023',
          coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
          photos: [
            {
              url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
              caption: 'Graduation day celebration'
            },
            {
              url: 'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78',
              caption: 'Graduates throwing caps'
            },
            {
              url: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b',
              caption: 'Proud graduates with their diplomas'
            },
            {
              url: 'https://images.unsplash.com/photo-1591987645957-ba96cf01e366',
              caption: 'Speech by the Dean'
            }
          ],
          createdBy: adminId
        },
        {
          title: 'Career Fair 2023',
          description: 'Photos from our annual career fair event',
          coverImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b',
          photos: [
            {
              url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b',
              caption: 'Company booths at the career fair'
            },
            {
              url: 'https://images.unsplash.com/photo-1560439514-4e9645039924',
              caption: 'Students networking with employers'
            },
            {
              url: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0',
              caption: 'Resume review workshop'
            }
          ],
          createdBy: adminId
        }
      ];
      
      await Album.insertMany(albums);
      console.log('Albums created');
    } else {
      console.log('Albums already exist');
    }
  } catch (err) {
    console.error('Error creating albums:', err.message);
    throw err;
  }
};

// Main function to initialize the database
const initializeDatabase = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    // Create admin user
    const admin = await createAdminUser();
    
    // Create schools
    const schools = await createSchools();
    
    // Create alumni users and profiles
    await createAlumniUsers(schools);
    
    // Create events
    await createEvents(admin._id);
    
    // Create photo albums
    await createAlbums(admin._id);
    
    console.log('Database initialization complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
};

// Run the initialization function
initializeDatabase(); 