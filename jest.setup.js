// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Mock crypto.getRandomValues for testing
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr) => {
      // Use a simple deterministic "random" for testing
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * (2 ** 32));
      }
      return arr;
    },
  },
});
