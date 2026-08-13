module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['react-native-gesture-handler/jestSetup'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native.*|@react-navigation|react-native-.*)/)',
  ],
};
