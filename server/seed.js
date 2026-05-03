const dotenv = require('dotenv');
const connectDB = require('./config/database');
const seedExercises = require('./seedExercises');

dotenv.config();

const seed = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Seeding mindfulness exercises...');
    await seedExercises();
    
    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seed();