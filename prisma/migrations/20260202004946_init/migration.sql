-- CreateTable
CREATE TABLE "weather" (
    "id" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "rainfall" DOUBLE PRECISION NOT NULL,
    "forecast" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weather_pkey" PRIMARY KEY ("id")
);
