module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*).test.ts"],
  moduleNameMapper: {
    // Priority 1: Specific Prisma Alias
    "^@/prisma-client$": "<rootDir>/src/generated/prisma",
    // Priority 2: General src Alias
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          // Ensure this points to your project tsconfig
          jsx: "react-jsx",
        },
      },
    ],
  },
};
