module.exports = {
    testEnvironment: "node",
    verbose: true,
    setupFilesAfterEnv: ["<rootDir>/src/tests/user.test.js"],
    collectCoverage: true,
    coverageDirectory: "coverage"
};