-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" SERIAL NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "rateToPkr" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'SBP',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_currencyCode_key" ON "ExchangeRate"("currencyCode");
