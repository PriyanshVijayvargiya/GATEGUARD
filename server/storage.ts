
import { db } from "./db";
import {
  users, vehicles, temporaryPasses, gateLogs,
  type User, type InsertUser,
  type Vehicle, type InsertVehicle,
  type TemporaryPass, type InsertPass,
  type GateLog, type InsertGateLog
} from "@shared/schema";
import { eq, desc, and, or, sql } from "drizzle-orm";

import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Vehicles
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehiclesByUserId(userId: number): Promise<Vehicle[]>;
  getAllVehicles(): Promise<(Vehicle & { user: User })[]>;
  updateVehicleStatus(id: number, status: "approved" | "rejected" | "blocked" | "pending"): Promise<Vehicle>;
  getVehicleByPlate(plateNumber: string): Promise<Vehicle | undefined>;

  // Passes
  createPass(pass: InsertPass): Promise<TemporaryPass>;
  getPassesByUserId(userId: number): Promise<TemporaryPass[]>;
  getAllPasses(): Promise<(TemporaryPass & { user: User })[]>;
  getActivePassByPlate(plateNumber: string): Promise<TemporaryPass | undefined>;

  // Logs
  createGateLog(log: InsertGateLog): Promise<GateLog>;
  getLogsByUserId(userId: number): Promise<GateLog[]>;
  getAllLogs(limit?: number): Promise<GateLog[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Vehicles
  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db.insert(vehicles).values(insertVehicle).returning();
    return vehicle;
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }

  async getVehiclesByUserId(userId: number): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.userId, userId));
  }

  async getAllVehicles(): Promise<(Vehicle & { user: User })[]> {
    const rows = await db
      .select({
        vehicle: vehicles,
        user: users,
      })
      .from(vehicles)
      .leftJoin(users, eq(vehicles.userId, users.id))
      .orderBy(desc(vehicles.createdAt));
    
    return rows.map(row => ({
      ...row.vehicle,
      user: row.user!
    }));
  }

  async updateVehicleStatus(id: number, status: "approved" | "rejected" | "blocked" | "pending"): Promise<Vehicle> {
    const [vehicle] = await db.update(vehicles)
      .set({ status })
      .where(eq(vehicles.id, id))
      .returning();
    return vehicle;
  }

  async getVehicleByPlate(plateNumber: string): Promise<Vehicle | undefined> {
    // Case insensitive matching or normalized upstream? We assume normalized upstream.
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.plateNumber, plateNumber));
    return vehicle;
  }

  // Passes
  async createPass(insertPass: InsertPass): Promise<TemporaryPass> {
    const [pass] = await db.insert(temporaryPasses).values(insertPass).returning();
    return pass;
  }

  async getPassesByUserId(userId: number): Promise<TemporaryPass[]> {
    return await db.select().from(temporaryPasses).where(eq(temporaryPasses.userId, userId));
  }

  async getAllPasses(): Promise<(TemporaryPass & { user: User })[]> {
    const rows = await db
      .select({
        pass: temporaryPasses,
        user: users,
      })
      .from(temporaryPasses)
      .leftJoin(users, eq(temporaryPasses.userId, users.id))
      .orderBy(desc(temporaryPasses.createdAt));

    return rows.map(row => ({
      ...row.pass,
      user: row.user!
    }));
  }

  async getActivePassByPlate(plateNumber: string): Promise<TemporaryPass | undefined> {
    const now = new Date();
    const [pass] = await db.select().from(temporaryPasses).where(
      and(
        eq(temporaryPasses.plateNumber, plateNumber),
        eq(temporaryPasses.status, "active"),
        sql`${temporaryPasses.validFrom} <= ${now}`,
        sql`${temporaryPasses.validTill} >= ${now}`
      )
    );
    return pass;
  }

  // Logs
  async createGateLog(insertLog: InsertGateLog): Promise<GateLog> {
    const [log] = await db.insert(gateLogs).values(insertLog).returning();
    return log;
  }

  async getLogsByUserId(userId: number): Promise<GateLog[]> {
    // Logs where the matched user ID is the user
    // OR logs for vehicles owned by the user (slightly more complex query, doing simple matchedUserId for now)
    // Actually better to fetch vehicles for user first, then logs for those plates? 
    // Let's rely on matchedUserId being populated correctly during creation/verification logic.
    return await db.select().from(gateLogs)
      .where(eq(gateLogs.matchedUserId, userId))
      .orderBy(desc(gateLogs.timestamp));
  }

  async getAllLogs(limit = 100): Promise<GateLog[]> {
    return await db.select().from(gateLogs)
      .orderBy(desc(gateLogs.timestamp))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
