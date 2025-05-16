const mongoose = require('mongoose');

// Generate ObjectIds for event attendees
const user1Id = new mongoose.Types.ObjectId();
const user2Id = new mongoose.Types.ObjectId();
const adminId = new mongoose.Types.ObjectId();

// Mock events data
const mockEvents = [
  {
    _id: new mongoose.Types.ObjectId(),
    title: 'Career Day 2023',
    description: 'Annual career day with companies from all over Greece. Bring your resume and be ready for on-site interviews!',
    date: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days in the future
    time: '10:00',
    location: 'Main Campus, Athens',
    category: 'career',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
    registrationEnabled: true,
    registrationDeadline: new Date(new Date().getTime() + 25 * 24 * 60 * 60 * 1000), // 25 days in the future
    attendees: [
      {
        user: user1Id,
        registeredAt: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      }
    ],
    createdBy: adminId,
    createdAt: new Date(new Date().getTime() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: 'Alumni Networking Night',
    description: 'Join us for an evening of networking with fellow alumni from all departments. Refreshments will be served.',
    date: new Date(new Date().getTime() + 45 * 24 * 60 * 60 * 1000), // 45 days in the future
    time: '19:00',
    location: 'Gallery Hall, Thessaloniki Campus',
    category: 'networking',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622',
    registrationEnabled: true,
    registrationDeadline: new Date(new Date().getTime() + 40 * 24 * 60 * 60 * 1000), // 40 days in the future
    attendees: [
      {
        user: user1Id,
        registeredAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        user: user2Id,
        registeredAt: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      }
    ],
    createdBy: adminId,
    createdAt: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: 'Workshop: Digital Marketing Trends',
    description: 'Learn about the latest trends in digital marketing from industry experts in this practical workshop.',
    date: new Date(new Date().getTime() + 20 * 24 * 60 * 60 * 1000), // 20 days in the future
    time: '14:00',
    location: 'Digital Lab, Athens Campus',
    category: 'workshop',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
    registrationEnabled: true,
    registrationDeadline: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days in the future
    attendees: [],
    createdBy: adminId,
    createdAt: new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: 'Summer Party 2023',
    description: 'Our annual summer celebration with food, music, and games! Open to all alumni and their families.',
    date: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days in the past (past event)
    time: '16:00',
    location: 'Beach Club, Athens Riviera',
    category: 'social',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6a3',
    registrationEnabled: false,
    attendees: [
      {
        user: user1Id,
        registeredAt: new Date(new Date().getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      },
      {
        user: user2Id,
        registeredAt: new Date(new Date().getTime() - 55 * 24 * 60 * 60 * 1000), // 55 days ago
      }
    ],
    createdBy: adminId,
    createdAt: new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
  }
];

module.exports = mockEvents; 