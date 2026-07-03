import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: "node",
  moduleNameMapper: {
    // 1. Mock the server-only marker
    "^server-only$": "<rootDir>/src/__mocks__/emptyMock.ts",
    // 2. Explicitly map your custom Prisma client path
    "^@/prisma-client$": "<rootDir>/src/generated/prisma",
  },
  testPathIgnorePatterns: ["<rootDir>/src/__tests__/integration/"],
};

export default createJestConfig(customJestConfig);
