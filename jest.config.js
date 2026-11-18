module.exports = {
    testEnvironment: "node",
    verbose: true,

    testMatch: [
        "<rootDir>/src/tests/user.test.js",
        "<rootDir>/src/tests/card.test.js"
    ],

    collectCoverage: true,
    coverageDirectory: "coverage"
};