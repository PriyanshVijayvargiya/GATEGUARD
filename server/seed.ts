
import { storage } from "./storage";
import { hashPassword } from "./auth";

async function seed() {
  const existingUsers = await storage.getAllUsers();
  if (existingUsers.length > 0) return;

  const adminPassword = await hashPassword("admin123");
  await storage.createUser({
    name: "System Admin",
    phone: "9999999999",
    flatNumber: "Admin Office",
    password: adminPassword,
    role: "admin"
  });

  const userPassword = await hashPassword("user123");
  const resident = await storage.createUser({
    name: "John Doe",
    phone: "9876543210",
    flatNumber: "A-101",
    password: userPassword,
    role: "resident"
  });

  const resident2 = await storage.createUser({
    name: "Jane Smith",
    phone: "9123456780",
    flatNumber: "B-205",
    password: userPassword,
    role: "resident"
  });

  // Seed Vehicles
  await storage.createVehicle({
    userId: resident.id,
    plateNumber: "MP09AB1234",
    name: "White Honda City",
    status: "approved"
  });

  await storage.createVehicle({
    userId: resident.id,
    plateNumber: "MP09XY9876",
    name: "Black Pulsar",
    status: "pending"
  });

  await storage.createVehicle({
    userId: resident2.id,
    plateNumber: "DL01CZ5555",
    name: "Red Swift",
    status: "blocked"
  });

  // Seed Passes
  await storage.createPass({
    userId: resident.id,
    visitorName: "Delivery Guy",
    plateNumber: "MP09ZZ1111",
    validFrom: new Date(),
    validTill: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    status: "active"
  });

  console.log("Database seeded!");
}

seed().catch(console.error);
