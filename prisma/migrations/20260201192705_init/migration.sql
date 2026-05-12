-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'USER');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('PRICE', 'DROUGHT', 'FLOOD', 'INFRASTRUCTURE', 'HEALTH', 'SECURITY', 'WEATHER');

-- CreateEnum
CREATE TYPE "AlertLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InfrastructureType" AS ENUM ('EDUCATION', 'HEALTH', 'WATER', 'ROAD', 'SPORTS', 'ADMIN', 'MARKET', 'ENERGY');

-- CreateEnum
CREATE TYPE "InfrastructureStatus" AS ENUM ('OPERATIONAL', 'MAINTENANCE', 'OUT_OF_SERVICE', 'PLANNED');

-- CreateEnum
CREATE TYPE "CropType" AS ENUM ('CEREAL', 'TUBER', 'VEGETABLE', 'FRUIT', 'LEGUME');

-- CreateEnum
CREATE TYPE "CropStatus" AS ENUM ('PLANTED', 'GROWING', 'HARVESTING', 'PREPARING');

-- CreateEnum
CREATE TYPE "HealthStatus" AS ENUM ('GOOD', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "InfoStatus" AS ENUM ('PUBLISHED', 'DRAFT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GeoZoneType" AS ENUM ('ADMINISTRATIVE', 'RISK_AREA', 'AGRICULTURAL', 'WATER_RESOURCE', 'NATURAL', 'URBAN');

-- CreateTable
CREATE TABLE "PostgisExtension" (
    "name" TEXT NOT NULL,
    "defaultVersion" TEXT NOT NULL DEFAULT '3.3',
    "installed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PostgisExtension_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "level" "AlertLevel" NOT NULL,
    "location" TEXT,
    "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "authorId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "geometry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_prices" (
    "id" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'FCFA',
    "trend" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "availability" TEXT NOT NULL,
    "quality" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "market_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infrastructures" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InfrastructureType" NOT NULL,
    "status" "InfrastructureStatus" NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT,
    "capacity" TEXT,
    "users" INTEGER,
    "lastMaintenance" TIMESTAMP(3),
    "nextMaintenance" TIMESTAMP(3),
    "responsible" TEXT NOT NULL,
    "budget" TEXT,
    "description" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "geometry" TEXT,
    "images" INTEGER NOT NULL DEFAULT 0,
    "documents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "infrastructures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CropType" NOT NULL,
    "area" TEXT NOT NULL,
    "areaHa" DOUBLE PRECISION NOT NULL,
    "farmers" INTEGER NOT NULL,
    "currentSeason" TEXT NOT NULL,
    "expectedYield" TEXT NOT NULL,
    "status" "CropStatus" NOT NULL,
    "healthStatus" "HealthStatus" NOT NULL,
    "lastUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextAction" TEXT NOT NULL,
    "irrigation" BOOLEAN NOT NULL DEFAULT false,
    "fertilizer" TEXT NOT NULL,
    "challenges" TEXT NOT NULL,
    "opportunities" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "geometry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communal_infos" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "InfoStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "author" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "attachments" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "communal_infos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "budget" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),
    "impact" TEXT NOT NULL,
    "manager" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "geometry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_stats" (
    "id" TEXT NOT NULL,
    "population" INTEGER NOT NULL DEFAULT 12450,
    "households" INTEGER NOT NULL DEFAULT 2100,
    "projects" INTEGER NOT NULL DEFAULT 24,
    "activeProjects" INTEGER NOT NULL DEFAULT 16,
    "completedProjects" INTEGER NOT NULL DEFAULT 6,
    "infrastructures" INTEGER NOT NULL DEFAULT 47,
    "operationalInfra" INTEGER NOT NULL DEFAULT 43,
    "totalArea" TEXT NOT NULL DEFAULT '276',
    "density" TEXT NOT NULL DEFAULT '45',
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "boundsNorth" DOUBLE PRECISION,
    "boundsSouth" DOUBLE PRECISION,
    "boundsEast" DOUBLE PRECISION,
    "boundsWest" DOUBLE PRECISION,

    CONSTRAINT "dashboard_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geo_zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "GeoZoneType" NOT NULL,
    "description" TEXT,
    "geometry" TEXT NOT NULL,
    "properties" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "geo_zones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
