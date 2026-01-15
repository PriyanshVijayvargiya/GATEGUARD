
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(), // Used as username for login
  flatNumber: text("flat_number"),
  password: text("password").notNull(),
  role: text("role", { enum: ["resident", "admin"] }).default("resident").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Foreign key to users
  plateNumber: text("plate_number").notNull(), // Normalized uppercase
  name: text("name"), // e.g., "White Honda City"
  status: text("status", { enum: ["pending", "approved", "rejected", "blocked"] }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const temporaryPasses = pgTable("temporary_passes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Created by
  visitorName: text("visitor_name").notNull(),
  plateNumber: text("plate_number").notNull(),
  validFrom: timestamp("valid_from").notNull(),
  validTill: timestamp("valid_till").notNull(),
  status: text("status", { enum: ["active", "expired", "revoked"] }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gateLogs = pgTable("gate_logs", {
  id: serial("id").primaryKey(),
  plateNumber: text("plate_number").notNull(),
  type: text("type", { enum: ["entry", "exit"] }).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  source: text("source"), // camera_id or lane
  confidence: integer("confidence"),
  status: text("status", { enum: ["approved_vehicle", "temp_pass", "denied", "not_found"] }).notNull(),
  matchedUserId: integer("matched_user_id"), // Optional link to user if found
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ many }) => ({
  vehicles: many(vehicles),
  passes: many(temporaryPasses),
}));

export const vehiclesRelations = relations(vehicles, ({ one }) => ({
  user: one(users, {
    fields: [vehicles.userId],
    references: [users.id],
  }),
}));

export const temporaryPassesRelations = relations(temporaryPasses, ({ one }) => ({
  user: one(users, {
    fields: [temporaryPasses.userId],
    references: [users.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, createdAt: true, status: true, userId: true });
export const insertPassSchema = createInsertSchema(temporaryPasses).omit({ id: true, createdAt: true, status: true, userId: true });
export const insertGateLogSchema = createInsertSchema(gateLogs).omit({ id: true, timestamp: true });

// === EXPLICIT API CONTRACT TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type TemporaryPass = typeof temporaryPasses.$inferSelect;
export type InsertPass = z.infer<typeof insertPassSchema>;

export type GateLog = typeof gateLogs.$inferSelect;
export type InsertGateLog = z.infer<typeof insertGateLogSchema>;

// Request types
export type CreateVehicleRequest = InsertVehicle;
export type UpdateVehicleStatusRequest = { status: "approved" | "rejected" | "blocked" | "pending" };

export type CreatePassRequest = InsertPass;
export type VerifyGateRequest = { plateNumber: string };

// Response types
export type VehicleResponse = Vehicle & { user?: User };
export type PassResponse = TemporaryPass & { user?: User };
export type VerifyGateResponse = { allowed: boolean; reason: string; userId?: number; vehicleId?: number; passId?: number };

