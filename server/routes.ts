
import type { Express } from "express";
import type { Server } from "http";
import passport from "passport";
import { setupAuth, hashPassword } from "./auth";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { WebSocket, WebSocketServer } from 'ws';

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth (Passport)
  setupAuth(app);

  // Initialize WebSocket Server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Broadcast helper
  const broadcast = (message: any) => {
    const data = JSON.stringify(message);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };

  // Middleware to ensure authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    next();
  };

  // === AUTH ROUTES ===

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      
      const existingUser = await storage.getUserByPhone(input.phone);
      if (existingUser) {
        return res.status(400).json({ message: "User with this phone number already exists" });
      }

      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({
        ...input,
        password: hashedPassword
      });
      
      req.login(user, (err: any) => {
        if (err) return res.status(500).json({ message: "Login failed after registration" });
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.sendStatus(200);
    });
  });

  app.get(api.auth.user.path, (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // === VEHICLE ROUTES ===

  app.get(api.vehicles.listMy.path, requireAuth, async (req, res) => {
    const vehicles = await storage.getVehiclesByUserId(req.user!.id);
    res.json(vehicles);
  });

  app.get(api.vehicles.listAll.path, requireAdmin, async (req, res) => {
    const vehicles = await storage.getAllVehicles();
    res.json(vehicles);
  });

  app.post(api.vehicles.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.vehicles.create.input.parse(req.body);
      // Normalize plate
      input.plateNumber = input.plateNumber.toUpperCase().replace(/\s/g, '');
      
      const vehicle = await storage.createVehicle({
        ...input,
        userId: req.user!.id,
        status: "pending"
      });
      res.status(201).json(vehicle);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.vehicles.updateStatus.path, requireAdmin, async (req, res) => {
    try {
      const { status } = api.vehicles.updateStatus.input.parse(req.body);
      const vehicleId = parseInt(req.params.id);
      
      const updated = await storage.updateVehicleStatus(vehicleId, status);
      if (!updated) return res.status(404).json({ message: "Vehicle not found" });
      
      res.json(updated);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // === PASS ROUTES ===

  app.get(api.passes.listMy.path, requireAuth, async (req, res) => {
    const passes = await storage.getPassesByUserId(req.user!.id);
    res.json(passes);
  });

  app.get(api.passes.listAll.path, requireAdmin, async (req, res) => {
    const passes = await storage.getAllPasses();
    res.json(passes);
  });

  app.post(api.passes.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.passes.create.input.parse(req.body);
      // Normalize plate
      input.plateNumber = input.plateNumber.toUpperCase().replace(/\s/g, '');

      const pass = await storage.createPass({
        ...input,
        userId: req.user!.id,
        status: "active"
      });
      res.status(201).json(pass);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === LOGS ROUTES ===

  app.get(api.logs.listMy.path, requireAuth, async (req, res) => {
    const logs = await storage.getLogsByUserId(req.user!.id);
    res.json(logs);
  });

  app.get(api.logs.listAll.path, requireAdmin, async (req, res) => {
    const logs = await storage.getAllLogs();
    res.json(logs);
  });

  // Used by Edge Device
  app.post(api.logs.create.path, async (req, res) => {
    try {
      const input = api.logs.create.input.parse(req.body);
      const log = await storage.createGateLog(input);
      
      // Realtime notification to Admin
      broadcast({
        type: 'gateEvent',
        data: log
      });

      res.status(201).json(log);
    } catch (err) {
      res.status(400).json({ message: "Invalid log format" });
    }
  });

  // === GATE VERIFICATION (EDGE DEVICE) ===

  app.post(api.gate.verify.path, async (req, res) => {
    try {
      const { plateNumber } = api.gate.verify.input.parse(req.body);
      const normalizedPlate = plateNumber.toUpperCase().replace(/\s/g, '');

      let allowed = false;
      let reason = "not_found";
      let matchedUserId = undefined;

      // 1. Check Registered Vehicles
      const vehicle = await storage.getVehicleByPlate(normalizedPlate);
      if (vehicle && vehicle.status === "approved") {
        allowed = true;
        reason = "approved_vehicle";
        matchedUserId = vehicle.userId;
      } else if (vehicle && vehicle.status === "blocked") {
        allowed = false;
        reason = "blocked";
        matchedUserId = vehicle.userId;
      }

      // 2. Check Temporary Passes (if not already allowed)
      if (!allowed && reason !== "blocked") {
        const pass = await storage.getActivePassByPlate(normalizedPlate);
        if (pass) {
          allowed = true;
          reason = "temp_pass";
          matchedUserId = pass.userId;
        }
      }

      // Auto-log the attempt? The requirements say edge device sends logs separately.
      // But we can create a log here too if we want backend-side verification logging.
      // Let's stick to just verifying.

      res.json({ allowed, reason, userId: matchedUserId });
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  return httpServer;
}
