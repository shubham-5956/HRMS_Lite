import { db } from "./db";
import {
  employees,
  attendance,
  type Employee,
  type InsertEmployee,
  type Attendance,
  type InsertAttendance,
  type DashboardSummaryResponse
} from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  deleteEmployee(id: number): Promise<void>;
  
  getAttendance(date?: string, employeeId?: number): Promise<(Attendance & { employee: Employee })[]>;
  createAttendance(record: InsertAttendance): Promise<Attendance>;
  
  getDashboardSummary(): Promise<DashboardSummaryResponse>;
}

export class DatabaseStorage implements IStorage {
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [created] = await db.insert(employees).values(employee).returning();
    return created;
  }

  async deleteEmployee(id: number): Promise<void> {
    await db.delete(employees).where(eq(employees.id, id));
  }

  async getAttendance(date?: string, employeeId?: number): Promise<(Attendance & { employee: Employee })[]> {
    let query = db.select({
      id: attendance.id,
      employeeId: attendance.employeeId,
      date: attendance.date,
      status: attendance.status,
      employee: employees
    }).from(attendance).innerJoin(employees, eq(attendance.employeeId, employees.id));
    
    const conditions = [];
    if (date) {
      conditions.push(eq(attendance.date, date));
    }
    if (employeeId) {
      conditions.push(eq(attendance.employeeId, employeeId));
    }
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }
    
    return await query;
  }

  async createAttendance(record: InsertAttendance): Promise<Attendance> {
    const [created] = await db.insert(attendance).values(record).returning();
    return created;
  }

  async getDashboardSummary(): Promise<DashboardSummaryResponse> {
    const [employeeCount] = await db.select({ count: sql`count(*)`.mapWith(Number) }).from(employees);
    
    const today = new Date().toISOString().split('T')[0];
    
    const [presentCount] = await db.select({ count: sql`count(*)`.mapWith(Number) })
      .from(attendance)
      .where(and(eq(attendance.date, today), eq(attendance.status, 'Present')));
      
    const [absentCount] = await db.select({ count: sql`count(*)`.mapWith(Number) })
      .from(attendance)
      .where(and(eq(attendance.date, today), eq(attendance.status, 'Absent')));

    return {
      totalEmployees: employeeCount.count,
      presentToday: presentCount.count,
      absentToday: absentCount.count
    };
  }
}

export const storage = new DatabaseStorage();
