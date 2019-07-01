module.exports = {
  setupFiles: ['jest-date-mock'],
  // projects: [
  //   '<rootDir>/packages/*',
  // ],
  // roots: [
  //   '<rootDir>/src',
  // ],
  // testEnvironment: 'node',
  testPathIgnorePatterns: [
    '<rootDir>/packages/.*(node_modules|src).*$',
  ],
  transform: {
    // '^.+\\.jsx?$': 'babel-jest',
  },
  // transformIgnorePatterns: [
  //   '<rootDir>.*(node_modules).*$',
  // ],
  // collectCoverage: true,
  // collectCoverageFrom: [
  //   'packages/**/*.{js}',
  //   '!**/node_modules/**',
  //   '!**/dist/**',
  // ],
  snapshotResolver: './packages/teg-core/dist/util/testing/snapshotResolver.js',
}
