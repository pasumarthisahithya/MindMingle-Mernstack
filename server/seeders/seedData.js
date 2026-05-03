const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require('../models/User');
const Mood = require('../models/Mood');
const MindfulnessExercise = require('../models/MindfulnessExercise');
const Goal = require('../models/Goal');
const PeerSupportMessage = require('../models/PeerSupportMessage');
const Reminder = require('../models/Reminder');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      userType: 'user'
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: hashedPassword,
      userType: 'user'
    },
    {
      name: 'Dr. Sarah Johnson',
      email: 'sarah@example.com',
      password: hashedPassword,
      userType: 'practitioner',
      specialization: 'Clinical Psychology',
      licenseNumber: 'PSY12345'
    },
    {
      name: 'Dr. Michael Chen',
      email: 'michael@example.com',
      password: hashedPassword,
      userType: 'practitioner',
      specialization: 'Cognitive Behavioral Therapy',
      licenseNumber: 'CBT67890'
    },
    {
      name: 'Emily Brown',
      email: 'emily@example.com',
      password: hashedPassword,
      userType: 'user'
    }
  ];

  const insertedUsers = await User.insertMany(users);
  console.log('✓ Users seeded');
  return insertedUsers;
};

const seedMoods = async (users) => {
  const regularUsers = users.filter(u => u.userType === 'user');
  const moods = [];
  
  const moodOptions = ['Very Happy', 'Happy', 'Calm', 'Anxious', 'Sad', 'Stressed', 'Neutral', 'Very Sad'];
  
  for (let user of regularUsers) {
    // Create mood entries for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      moods.push({
        userId: user._id,
        mood: moodOptions[Math.floor(Math.random() * moodOptions.length)],
        intensity: Math.floor(Math.random() * 10) + 1,
        notes: i % 3 === 0 ? 'Feeling good today' : '',
        date: date
      });
    }
  }

  await Mood.insertMany(moods);
  console.log('✓ Moods seeded');
};

const seedExercises = async () => {
  const exercises = [
    {
      title: 'Deep Breathing',
      description: 'A simple breathing exercise to calm your mind and reduce stress.',
      duration: 5,
      category: 'breathing',
      difficulty: 'beginner',
      instructions: [
        { step: 1, text: 'Sit comfortably with your back straight' },
        { step: 2, text: 'Close your eyes and relax your shoulders' },
        { step: 3, text: 'Breathe in slowly through your nose for 4 counts' },
        { step: 4, text: 'Hold your breath for 4 counts' },
        { step: 5, text: 'Exhale slowly through your mouth for 6 counts' },
        { step: 6, text: 'Repeat for 5 minutes' }
      ],
      benefits: ['Reduces stress', 'Calms the mind', 'Lowers blood pressure']
    },
    {
      title: 'Body Scan Meditation',
      description: 'Progressive relaxation technique to release tension from your body.',
      duration: 15,
      category: 'body-scan',
      difficulty: 'beginner',
      instructions: [
        { step: 1, text: 'Lie down in a comfortable position' },
        { step: 2, text: 'Close your eyes and take a few deep breaths' },
        { step: 3, text: 'Starting from your toes, focus on each body part' },
        { step: 4, text: 'Notice any tension and consciously relax that area' },
        { step: 5, text: 'Move slowly up through your legs, torso, arms, and head' },
        { step: 6, text: 'End by taking a few deep breaths' }
      ],
      benefits: ['Releases physical tension', 'Improves body awareness', 'Promotes relaxation']
    },
    {
      title: 'Guided Visualization',
      description: 'Imagine a peaceful place to reduce anxiety and promote relaxation.',
      duration: 10,
      category: 'visualization',
      difficulty: 'beginner',
      instructions: [
        { step: 1, text: 'Find a quiet, comfortable place to sit or lie down' },
        { step: 2, text: 'Close your eyes and take several deep breaths' },
        { step: 3, text: 'Imagine yourself in a peaceful, safe place' },
        { step: 4, text: 'Notice the colors, sounds, and sensations' },
        { step: 5, text: 'Stay in this peaceful place for several minutes' },
        { step: 6, text: 'Slowly bring your awareness back to the present' }
      ],
      benefits: ['Reduces anxiety', 'Enhances creativity', 'Improves mood']
    },
    {
      title: '4-7-8 Breathing',
      description: 'A powerful breathing technique to reduce anxiety and help with sleep.',
      duration: 5,
      category: 'breathing',
      difficulty: 'intermediate',
      instructions: [
        { step: 1, text: 'Sit with your back straight' },
        { step: 2, text: 'Place the tip of your tongue behind your upper front teeth' },
        { step: 3, text: 'Exhale completely through your mouth' },
        { step: 4, text: 'Inhale through your nose for 4 counts' },
        { step: 5, text: 'Hold your breath for 7 counts' },
        { step: 6, text: 'Exhale through your mouth for 8 counts' },
        { step: 7, text: 'Repeat 3-4 times' }
      ],
      benefits: ['Helps with sleep', 'Reduces anxiety', 'Promotes calmness']
    },
    {
      title: 'Mindful Walking',
      description: 'Bring awareness to the simple act of walking to ground yourself.',
      duration: 20,
      category: 'mindful-movement',
      difficulty: 'beginner',
      instructions: [
        { step: 1, text: 'Find a quiet place where you can walk for 10-20 steps' },
        { step: 2, text: 'Walk slowly and deliberately' },
        { step: 3, text: 'Notice the sensation of your feet touching the ground' },
        { step: 4, text: 'Pay attention to your breath as you walk' },
        { step: 5, text: 'If your mind wanders, gently bring it back to walking' },
        { step: 6, text: 'Continue for 20 minutes' }
      ],
      benefits: ['Grounds you in the present', 'Improves focus', 'Gentle exercise']
    },
    {
      title: 'Loving-Kindness Meditation',
      description: 'Cultivate compassion for yourself and others through guided meditation.',
      duration: 15,
      category: 'meditation',
      difficulty: 'intermediate',
      instructions: [
        { step: 1, text: 'Sit comfortably and close your eyes' },
        { step: 2, text: 'Take a few deep breaths to settle' },
        { step: 3, text: 'Silently repeat: "May I be happy, may I be healthy, may I be safe"' },
        { step: 4, text: 'Visualize someone you love and repeat the phrases for them' },
        { step: 5, text: 'Extend these wishes to neutral people, then difficult people' },
        { step: 6, text: 'Finally, extend to all beings everywhere' }
      ],
      benefits: ['Increases compassion', 'Reduces negative emotions', 'Improves relationships']
    }
  ];

  await MindfulnessExercise.insertMany(exercises);
  console.log('✓ Exercises seeded');
};

const seedGoals = async (users) => {
  const regularUsers = users.filter(u => u.userType === 'user');
  const goals = [];
  
  const positiveMoods = ['Very Happy', 'Happy', 'Calm'];
  const frequencies = ['Daily', 'Weekly', 'Monthly'];
  
  for (let user of regularUsers) {
    if (Math.random() > 0.3) { // 70% of users have goals
      goals.push({
        user: user._id,
        title: 'Improve my mood and mental wellness',
        description: 'Work on achieving a more positive and balanced emotional state through regular practice',
        targetMood: positiveMoods[Math.floor(Math.random() * positiveMoods.length)],
        targetFrequency: frequencies[Math.floor(Math.random() * frequencies.length)],
        isActive: true,
        progress: Math.floor(Math.random() * 50) // Random progress 0-50%
      });
    }
  }

  await Goal.insertMany(goals);
  console.log('✓ Goals seeded');
};

const seedPeerSupport = async (users) => {
  const regularUsers = users.filter(u => u.userType === 'user');
  const messages = [];
  
  const sampleMessages = [
    'Hey everyone, just wanted to share that I had a great day today!',
    'Feeling a bit overwhelmed lately. Anyone have tips for managing stress?',
    'The breathing exercises really helped me today. Highly recommend!',
    'Remember to be kind to yourself. You\'re doing better than you think.',
    'Does anyone else struggle with anxiety in social situations?',
    'Just completed my first week of mood tracking. Feeling optimistic!',
    'Thanks to everyone in this community for the support. It means a lot.',
    'Having a rough day, but I know it will get better.'
  ];

  for (let i = 0; i < 15; i++) {
    const randomUser = regularUsers[Math.floor(Math.random() * regularUsers.length)];
    const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
    
    messages.push({
      userId: randomUser._id,
      username: randomUser.name,
      message: randomMessage,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Within last 7 days
    });
  }

  await PeerSupportMessage.insertMany(messages);
  console.log('✓ Peer support messages seeded');
};

const seedReminders = async (users) => {
  const regularUsers = users.filter(u => u.userType === 'user');
  const exercises = await MindfulnessExercise.find().limit(5);
  const reminders = [];
  
  const frequencies = ['Daily', 'Weekly', 'Custom'];
  const times = ['8:00 AM', '10:00 AM', '12:00 PM', '3:00 PM', '6:00 PM', '8:00 PM'];
  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  for (let user of regularUsers) {
    const numReminders = Math.floor(Math.random() * 3) + 1; // 1-3 reminders per user
    
    for (let i = 0; i < numReminders; i++) {
      const exercise = exercises[Math.floor(Math.random() * exercises.length)];
      const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];
      
      const reminder = {
        userId: user._id,
        exerciseId: exercise._id,
        exerciseTitle: exercise.title,
        frequency: frequency,
        time: times[Math.floor(Math.random() * times.length)],
        isActive: Math.random() > 0.2 // 80% enabled
      };

      // Add days for weekly/custom frequency
      if (frequency === 'Weekly' || frequency === 'Custom') {
        const numDays = Math.floor(Math.random() * 3) + 1; // 1-3 days
        const selectedDays = [];
        for (let j = 0; j < numDays; j++) {
          const randomDay = daysList[Math.floor(Math.random() * daysList.length)];
          if (!selectedDays.includes(randomDay)) {
            selectedDays.push(randomDay);
          }
        }
        reminder.days = selectedDays;
      }
      
      reminders.push(reminder);
    }
  }

  await Reminder.insertMany(reminders);
  console.log('✓ Reminders seeded');
};

const clearDatabase = async () => {
  await User.deleteMany({});
  await Mood.deleteMany({});
  await MindfulnessExercise.deleteMany({});
  await Goal.deleteMany({});
  await PeerSupportMessage.deleteMany({});
  await Reminder.deleteMany({});
  console.log('✓ Database cleared');
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('\n🌱 Starting database seeding...\n');
    
    await clearDatabase();
    
    const users = await seedUsers();
    await seedMoods(users);
    await seedExercises();
    await seedGoals(users);
    await seedPeerSupport(users);
    await seedReminders(users);
    
    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('Sample login credentials:');
    console.log('User: john@example.com / password123');
    console.log('User: jane@example.com / password123');
    console.log('Practitioner: sarah@example.com / password123');
    console.log('Practitioner: michael@example.com / password123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();