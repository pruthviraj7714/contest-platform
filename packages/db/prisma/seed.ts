import prisma from "..";

const seedDb = async () => {
  await prisma.user.create({
    data: {
      role: "ADMIN",
      email: "test@gmail.com",
    },
  });
  console.log("DB seeded successfully");
  
};

seedDb();
