const mongoose = require('mongoose');

// Generate admin ObjectId
const adminId = new mongoose.Types.ObjectId();

// Mock albums data
const mockAlbums = [
  {
    _id: new mongoose.Types.ObjectId(),
    title: 'Graduation Ceremony 2023',
    description: 'Photos from the graduation ceremony of the class of 2023',
    coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
    photos: [
      {
        _id: new mongoose.Types.ObjectId(),
        url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
        caption: 'Graduation day celebration',
        uploadedAt: new Date(new Date().getTime() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
      },
      {
        _id: new mongoose.Types.ObjectId(),
        url: 'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78',
        caption: 'Graduates throwing caps',
        uploadedAt: new Date(new Date().getTime() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
      },
      {
        _id: new mongoose.Types.ObjectId(),
        url: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b',
        caption: 'Proud graduates with their diplomas',
        uploadedAt: new Date(new Date().getTime() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
      },
      {
        _id: new mongoose.Types.ObjectId(),
        url: 'https://images.unsplash.com/photo-1591987645957-ba96cf01e366',
        caption: 'Speech by the Dean',
        uploadedAt: new Date(new Date().getTime() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
      }
    ],
    createdBy: adminId,
    createdAt: new Date(new Date().getTime() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: 'Career Fair 2023',
    description: 'Photos from our annual career fair event',
    coverImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b',
    photos: [
      {
        _id: new mongoose.Types.ObjectId(),
        url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b',
        caption: 'Company booths at the career fair',
        uploadedAt: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      },
      {
        _id: new mongoose.Types.ObjectId(),
        url: 'https://images.unsplash.com/photo-1560439514-4e9645039924',
        caption: 'Students networking with employers',
        uploadedAt: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      },
      {
        _id: new mongoose.Types.ObjectId(),
        url: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0',
        caption: 'Resume review workshop',
        uploadedAt: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      }
    ],
    createdBy: adminId,
    createdAt: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: 'Campus Life',
    description: 'Photos showcasing daily life at Mediterranean College',
    coverImage: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1',
    photos: [
      {
        _id: new mongoose.Types.ObjectId(),
        url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1',
        caption: 'Students studying in the library',
        uploadedAt: new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
      },
      {
        _id: new mongoose.Types.ObjectId(),
        url: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4',
        caption: 'Campus cafeteria during lunch',
        uploadedAt: new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
      },
      {
        _id: new mongoose.Types.ObjectId(),
        url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
        caption: 'Group project session',
        uploadedAt: new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
      }
    ],
    createdBy: adminId,
    createdAt: new Date(new Date().getTime() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
  }
];

module.exports = mockAlbums; 