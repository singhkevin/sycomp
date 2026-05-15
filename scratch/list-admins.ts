import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({
    where: {
      role: "ADMIN",
    },
    select: {
      id: true,
      email: true,
      role: true,
      country: true,
    },
  });

  console.log("Verified Admins:");
  console.log(JSON.stringify(admins, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
