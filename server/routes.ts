import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.dashboard.summary.path, async (req, res) => {
    try {
      const summary = await storage.getDashboardSummary();
      res.json(summary);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch dashboard summary" });
    }
  });

  app.get(api.employees.list.path, async (req, res) => {
    try {
      const allEmployees = await storage.getEmployees();
      res.json(allEmployees);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post(api.employees.create.path, async (req, res) => {
    try {
      const input = api.employees.create.input.parse(req.body);
      const employee = await storage.createEmployee(input);
      res.status(201).json(employee);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      // Check for unique violation on employee ID
      if (err instanceof Error && err.message.includes('unique constraint')) {
        return res.status(400).json({ message: "Employee ID already exists" });
      }
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.delete(api.employees.delete.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteEmployee(id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  app.get(api.attendance.list.path, async (req, res) => {
    try {
      const date = req.query.date as string | undefined;
      const employeeId = req.query.employeeId ? Number(req.query.employeeId) : undefined;
      
      const records = await storage.getAttendance(date, employeeId);
      res.json(records);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch attendance records" });
    }
  });

  app.post(api.attendance.create.path, async (req, res) => {
    try {
      // Coerce employeeId
      const inputSchema = api.attendance.create.input.extend({
        employeeId: z.coerce.number(),
      });
      const input = inputSchema.parse(req.body);
      const record = await storage.createAttendance(input);
      res.status(201).json(record);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      // Check for unique constraint violation (duplicate attendance for the day)
      if (err instanceof Error && (err.message.includes('unique_attendance') || err.message.includes('unique constraint'))) {
         return res.status(409).json({ message: "Attendance already marked for this date" });
      }
      res.status(500).json({ message: "Failed to create attendance record" });
    }
  });

  // Seed data function to ensure app has data on first load
  async function seedDatabase() {
    try {
      const existingEmployees = await storage.getEmployees();
      if (existingEmployees.length === 0) {
        const emp1 = await storage.createEmployee({
          employeeId: "EMP001",
          fullName: "Shubham Kumar Agarwal",
          email: "shubham@gmail.com",
          department: "Engineering"
        });
        
        const emp2 = await storage.createEmployee({
          employeeId: "EMP002",
          fullName: "Alpha",
          email: "Alpha@example.com",
          department: "Human Resources"
        });

        const emp3 = await storage.createEmployee({
          employeeId: "EMP003",
          fullName: "Gamma",
          email: "gamma@example.com",
          department: "Marketing"
        });

        const today = new Date().toISOString().split('T')[0];
        
        await storage.createAttendance({
          employeeId: emp1.id,
          date: today,
          status: 'Present'
        });

        await storage.createAttendance({
          employeeId: emp2.id,
          date: today,
          status: 'Absent'
        });
      }
    } catch (e) {
      console.error("Failed to seed database", e);
    }
  }

  // Call the seed function
  seedDatabase();

  return httpServer;
}
