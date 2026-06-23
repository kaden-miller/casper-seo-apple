import "dotenv/config";
import { resolve } from "path";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const connectionString =
  process.env.DATABASE_URL ?? process.env.DIRECT_URL ?? "";

if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_URL is required for seeding");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const DEMO_ORG_NAME = "SEO Ops Demo Workspace";
const DEMO_CLIENT_NAME = "Acme Lawn Care";
const DEMO_WEBSITE_URL = "https://acmelawncare.example.com";

async function main() {
  let organization = await prisma.organization.findFirst({
    where: { name: DEMO_ORG_NAME },
  });

  if (!organization) {
    organization = await prisma.organization.create({
      data: { name: DEMO_ORG_NAME },
    });
    console.log(`Created organization: ${organization.name}`);
  } else {
    console.log(`Using existing organization: ${organization.name}`);
  }

  let client = await prisma.client.findFirst({
    where: {
      organizationId: organization.id,
      name: DEMO_CLIENT_NAME,
    },
  });

  if (!client) {
    client = await prisma.client.create({
      data: {
        organizationId: organization.id,
        name: DEMO_CLIENT_NAME,
        industry: "Home services",
        businessDescription:
          "Full-service lawn care and landscaping company serving the Wichita metro area.",
        notes: "Demo client for SEO Ops Console development.",
      },
    });
    console.log(`Created client: ${client.name}`);
  } else {
    console.log(`Using existing client: ${client.name}`);
  }

  let website = await prisma.website.findFirst({
    where: {
      clientId: client.id,
      url: DEMO_WEBSITE_URL,
    },
  });

  if (!website) {
    website = await prisma.website.create({
      data: {
        clientId: client.id,
        name: "Acme Lawn Care Website",
        url: DEMO_WEBSITE_URL,
        cmsType: "WordPress",
        primaryLocation: "Wichita, KS",
        serviceAreas: ["Wichita", "Derby", "Andover"],
        targetServices: ["Lawn care", "Landscaping", "Snow removal"],
        notes: "Demo website for development and testing.",
      },
    });
    console.log(`Created website: ${website.name}`);
  } else {
    console.log(`Using existing website: ${website.name}`);
  }

  const existingKeyword = await prisma.keyword.findFirst({
    where: {
      websiteId: website.id,
      keyword: "lawn care wichita",
    },
  });

  if (!existingKeyword) {
    await prisma.keyword.create({
      data: {
        websiteId: website.id,
        keyword: "lawn care wichita",
        location: "Wichita, KS",
        device: "DESKTOP",
        priority: "HIGH",
        notes: "Primary commercial keyword",
      },
    });
    console.log("Created demo keyword");
  }

  const existingCompetitor = await prisma.competitor.findFirst({
    where: {
      websiteId: website.id,
      domain: "greenlawn.example.com",
    },
  });

  if (!existingCompetitor) {
    await prisma.competitor.create({
      data: {
        websiteId: website.id,
        name: "Green Lawn Co",
        domain: "greenlawn.example.com",
        notes: "Main local competitor",
      },
    });
    console.log("Created demo competitor");
  }

  console.log("\nSeed complete.");
  console.log(`  Organization: ${organization.name}`);
  console.log(`  Client:       ${client.name} (${client.id})`);
  console.log(`  Website:      ${website.name} (${website.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
