// Define states, priorities (higher interrupts lower), and default speech bubbles
export const mascotStates = {
  idle: { priority: 0 },
  hovered: { priority: 1 },
  walking: { priority: 1 },
  empty: { priority: 2, defaultSpeech: "No memories yet... Let's create your first one.", persistent: true },
  processing: { priority: 3, defaultSpeech: "Analyzing colors...", persistent: true },
  uploading: { priority: 3, defaultSpeech: "Uploading...", persistent: true },
  uploadSuccess: { priority: 4, defaultSpeech: "Memory safely stored!", duration: 6000 },
  error: { priority: 4, defaultSpeech: "Oops... something went wrong.", duration: 6000 },
  greeting: { priority: 5, duration: 6000 },
  celebrating: { priority: 6, duration: 8000 },
  memoryCompanion: { priority: 7, persistent: true }
};
