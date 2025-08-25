module.exports = {
  projects: [
    {
      displayName: "backend-unit",
      preset: "ts-jest",
      testEnvironment: "node",
      rootDir: "./backend",
      testMatch: ["<rootDir>/src/**/*.spec.ts"],
      moduleFileExtensions: ["js", "json", "ts"],
      transform: {
        "^.+\\.(t|j)s$": "ts-jest",
      },
      collectCoverageFrom: ["**/*.(t|j)s"],
      coverageDirectory: "../coverage",
    },
    {
      displayName: "backend-e2e",
      preset: "ts-jest",
      testEnvironment: "node",
      rootDir: "./backend",
      testMatch: ["<rootDir>/test/**/*.e2e-spec.ts"],
      moduleFileExtensions: ["js", "json", "ts"],
      transform: {
        "^.+\\.(t|j)s$": "ts-jest",
      },
    },
  ],
};
