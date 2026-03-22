module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  collectCoverageFrom: [
    'tests/**/*.ts',
    '!tests/mocks/**',
    '!tests/**/*.test.ts'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  moduleNameMapper: {
    '^cc$': '<rootDir>/tests/mocks/cocos.ts'
  }
};
