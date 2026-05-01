-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('SUPPLIER', 'BUYER');

-- CreateTable
CREATE TABLE "Contact" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ContactType" NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "country" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);
