import { z } from 'zod';
import { insertEmployeeSchema, insertAttendanceSchema, employees, attendance } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  employees: {
    list: {
      method: 'GET' as const,
      path: '/api/employees' as const,
      responses: {
        200: z.array(z.custom<typeof employees.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/employees' as const,
      input: insertEmployeeSchema.extend({
        email: z.string().email("Invalid email address"),
      }),
      responses: {
        201: z.custom<typeof employees.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/employees/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  attendance: {
    list: {
      method: 'GET' as const,
      path: '/api/attendance' as const,
      input: z.object({
        date: z.string().optional(), // YYYY-MM-DD
        employeeId: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof attendance.$inferSelect & { employee: typeof employees.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/attendance' as const,
      input: insertAttendanceSchema,
      responses: {
        201: z.custom<typeof attendance.$inferSelect>(),
        400: errorSchemas.validation,
        409: z.object({ message: z.string() }), // Conflict (already marked)
      },
    },
  },
  dashboard: {
    summary: {
      method: 'GET' as const,
      path: '/api/dashboard/summary' as const,
      responses: {
        200: z.object({
          totalEmployees: z.number(),
          presentToday: z.number(),
          absentToday: z.number(),
        }),
      },
    },
  }
};

// ============================================
// REQUIRED: buildUrl helper
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE HELPERS
// ============================================
export type EmployeeInput = z.infer<typeof api.employees.create.input>;
export type EmployeeResponse = z.infer<typeof api.employees.create.responses[201]>;
export type AttendanceInput = z.infer<typeof api.attendance.create.input>;
export type AttendanceResponse = z.infer<typeof api.attendance.create.responses[201]>;
