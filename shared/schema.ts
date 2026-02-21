import { pgTable, text, serial, integer, date, varchar, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  employeeId: varchar("employee_id").notNull().unique(), // Custom ID provided by user
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  department: text("department").notNull(),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id, { onDelete: 'cascade' }),
  date: date("date").notNull(),
  status: varchar("status", { enum: ['Present', 'Absent'] }).notNull(),
}, (table) => {
  return {
    uniqueAttendance: unique().on(table.employeeId, table.date), // Prevent duplicate attendance for the same day
  };
});

// === RELATIONS ===
export const employeesRelations = relations(employees, ({ many }) => ({
  attendance: many(attendance),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  employee: one(employees, {
    fields: [attendance.employeeId],
    references: [employees.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true });
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===

// Base types
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

// Request types
export type CreateEmployeeRequest = InsertEmployee;
export type CreateAttendanceRequest = InsertAttendance;

// Response types
export type EmployeeResponse = Employee;
export type EmployeesListResponse = Employee[];

export type AttendanceWithEmployee = Attendance & {
  employee?: Employee;
};

export type AttendanceListResponse = AttendanceWithEmployee[];

// Dashboard Summary Response
export interface DashboardSummaryResponse {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
}
