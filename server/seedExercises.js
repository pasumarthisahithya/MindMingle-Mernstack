const MindfulnessExercise = require('./models/MindfulnessExercise');

const exercises = [
  {
    title: "Deep Breathing Exercise",
    description: "Practice deep breathing to relax and reduce stress. This exercise helps calm the nervous system and brings focus to the present moment.",
    category: "breathing",
    duration: 5,
    difficulty: "beginner",
    instructions: [
      { step: 1, text: "Find a comfortable seated position with your back straight." },
      { step: 2, text: "Close your eyes or maintain a soft gaze downward." },
      { step: 3, text: "Breathe in slowly through your nose for 4 counts." },
      { step: 4, text: "Hold your breath for 4 counts." },
      { step: 5, text: "Exhale slowly through your mouth for 6 counts." },
      { step: 6, text: "Repeat this cycle for 5 minutes." }
    ],
    benefits: [
      "Reduces stress and anxiety",
      "Lowers blood pressure",
      "Improves focus and concentration",
      "Promotes relaxation"
    ]
  },
  {
    title: "Guided Meditation",
    description: "Follow a guided meditation session to calm the mind and find inner peace.",
    category: "meditation",
    duration: 10,
    difficulty: "beginner",
    instructions: [
      { step: 1, text: "Sit in a comfortable position with your spine straight." },
      { step: 2, text: "Close your eyes and take three deep breaths." },
      { step: 3, text: "Bring your attention to your breath, noticing each inhale and exhale." },
      { step: 4, text: "When thoughts arise, gently acknowledge them and return to your breath." },
      { step: 5, text: "Visualize a peaceful place that brings you calm." },
      { step: 6, text: "Stay in this meditative state for 10 minutes." }
    ],
    benefits: [
      "Reduces mental clutter",
      "Increases self-awareness",
      "Improves emotional health",
      "Enhances concentration"
    ]
  },
  {
    title: "Body Scan Meditation",
    description: "A progressive relaxation technique that helps release tension throughout the body.",
    category: "body-scan",
    duration: 15,
    difficulty: "intermediate",
    instructions: [
      { step: 1, text: "Lie down on your back in a comfortable position." },
      { step: 2, text: "Close your eyes and take several deep breaths." },
      { step: 3, text: "Starting with your toes, focus your attention on each body part." },
      { step: 4, text: "Notice any sensations, tension, or discomfort without judgment." },
      { step: 5, text: "Breathe into each area and visualize tension releasing." },
      { step: 6, text: "Slowly move up through your body to the top of your head." }
    ],
    benefits: [
      "Releases physical tension",
      "Improves body awareness",
      "Promotes deep relaxation",
      "Reduces chronic pain"
    ]
  },
  {
    title: "Loving-Kindness Meditation",
    description: "Cultivate compassion and positive emotions towards yourself and others.",
    category: "meditation",
    duration: 12,
    difficulty: "intermediate",
    instructions: [
      { step: 1, text: "Sit comfortably and close your eyes." },
      { step: 2, text: "Think of someone you love and wish them well silently." },
      { step: 3, text: "Repeat phrases like 'May you be happy, may you be healthy'." },
      { step: 4, text: "Extend these wishes to yourself." },
      { step: 5, text: "Gradually extend to neutral people, then difficult people." },
      { step: 6, text: "Finally, extend loving-kindness to all beings." }
    ],
    benefits: [
      "Increases positive emotions",
      "Improves social connections",
      "Reduces self-criticism",
      "Enhances empathy"
    ]
  },
  {
    title: "Mindful Walking",
    description: "Practice mindfulness while walking, focusing on each step and breath.",
    category: "mindful-movement",
    duration: 10,
    difficulty: "beginner",
    instructions: [
      { step: 1, text: "Find a quiet place where you can walk back and forth." },
      { step: 2, text: "Stand still and take a few deep breaths." },
      { step: 3, text: "Begin walking slowly, noticing the sensation of each foot touching the ground." },
      { step: 4, text: "Coordinate your breath with your steps." },
      { step: 5, text: "If your mind wanders, gently bring attention back to walking." },
      { step: 6, text: "Continue for 10 minutes, maintaining present awareness." }
    ],
    benefits: [
      "Combines exercise with mindfulness",
      "Improves balance and coordination",
      "Reduces rumination",
      "Increases present-moment awareness"
    ]
  },
  {
    title: "Visualization Exercise",
    description: "Use mental imagery to create a sense of calm and achieve your goals.",
    category: "visualization",
    duration: 8,
    difficulty: "beginner",
    instructions: [
      { step: 1, text: "Sit or lie down comfortably and close your eyes." },
      { step: 2, text: "Take several deep breaths to relax." },
      { step: 3, text: "Imagine a peaceful scene in vivid detail (beach, forest, mountain)." },
      { step: 4, text: "Engage all your senses - what do you see, hear, smell, and feel?" },
      { step: 5, text: "Spend time exploring this peaceful place." },
      { step: 6, text: "When ready, slowly bring your awareness back to the present." }
    ],
    benefits: [
      "Reduces stress quickly",
      "Enhances creativity",
      "Improves mood",
      "Helps achieve goals"
    ]
  }
];

// Function to seed exercises
const seedExercises = async () => {
  try {
    // Clear existing exercises
    await MindfulnessExercise.deleteMany({});
    
    // Insert new exercises
    await MindfulnessExercise.insertMany(exercises);
    
    console.log('Mindfulness exercises seeded successfully');
  } catch (error) {
    console.error('Error seeding exercises:', error);
  }
};

module.exports = seedExercises;