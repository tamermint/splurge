-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SplurgeGoalType" AS ENUM ('ASSET', 'EXPERIENCE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER'
);

-- CreateTable
CREATE TABLE "Bills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "scheduleType" TEXT NOT NULL,
    "payRail" TEXT NOT NULL,
    "payType" TEXT NOT NULL,
    "deferredUntil" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Inflow" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "label" TEXT NOT NULL,
    "payScheduleId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PaySchedule" (
    "id" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PaySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SplurgeGoal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "goalType" "SplurgeGoalType" NOT NULL,
    "targetAmount" INTEGER NOT NULL,
    "currentProgress" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL,
    "isAutoFunded" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Bills_id_key" ON "Bills"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Bills_userId_key" ON "Bills"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Inflow_id_key" ON "Inflow"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PaySchedule_userId_key" ON "PaySchedule"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SplurgeGoal_id_key" ON "SplurgeGoal"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SplurgeGoal_userId_key" ON "SplurgeGoal"("userId");

-- AddForeignKey
ALTER TABLE "Bills" ADD CONSTRAINT "Bills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inflow" ADD CONSTRAINT "Inflow_payScheduleId_fkey" FOREIGN KEY ("payScheduleId") REFERENCES "PaySchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaySchedule" ADD CONSTRAINT "PaySchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SplurgeGoal" ADD CONSTRAINT "SplurgeGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
