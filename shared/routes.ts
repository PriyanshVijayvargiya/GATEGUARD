
import { z } from 'zod';
import { insertUserSchema, insertVehicleSchema, insertPassSchema, insertGateLogSchema, vehicles, temporaryPasses, gateLogs, users } from './schema';

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
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: z.object({ username: z.string(), password: z.string() }), // username maps to phone
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout',
      responses: {
        200: z.void(),
      },
    },
    user: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  vehicles: {
    listMy: {
      method: 'GET' as const,
      path: '/api/vehicles/my',
      responses: {
        200: z.array(z.custom<typeof vehicles.$inferSelect>()),
      },
    },
    listAll: {
      method: 'GET' as const,
      path: '/api/vehicles/all', // Admin only
      responses: {
        200: z.array(z.custom<typeof vehicles.$inferSelect & { user: typeof users.$inferSelect }>()),
        403: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/vehicles/add',
      input: insertVehicleSchema,
      responses: {
        201: z.custom<typeof vehicles.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/vehicles/:id/status', // Admin only
      input: z.object({ status: z.enum(["approved", "rejected", "blocked", "pending"]) }),
      responses: {
        200: z.custom<typeof vehicles.$inferSelect>(),
        403: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  passes: {
    listMy: {
      method: 'GET' as const,
      path: '/api/passes/my',
      responses: {
        200: z.array(z.custom<typeof temporaryPasses.$inferSelect>()),
      },
    },
    listAll: {
      method: 'GET' as const,
      path: '/api/passes/all', // Admin only
      responses: {
        200: z.array(z.custom<typeof temporaryPasses.$inferSelect & { user: typeof users.$inferSelect }>()),
        403: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/passes/create',
      input: insertPassSchema,
      responses: {
        201: z.custom<typeof temporaryPasses.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  logs: {
    listMy: {
      method: 'GET' as const,
      path: '/api/logs/my',
      responses: {
        200: z.array(z.custom<typeof gateLogs.$inferSelect>()),
      },
    },
    listAll: {
      method: 'GET' as const,
      path: '/api/logs/all', // Admin only
      input: z.object({
        search: z.string().optional(),
        date: z.string().optional()
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof gateLogs.$inferSelect>()),
        403: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/logs/create', // Edge device
      input: insertGateLogSchema,
      responses: {
        201: z.custom<typeof gateLogs.$inferSelect>(),
      },
    },
  },
  gate: {
    verify: {
      method: 'POST' as const,
      path: '/api/gate/verify', // Edge device
      input: z.object({ plateNumber: z.string() }),
      responses: {
        200: z.object({ allowed: z.boolean(), reason: z.string() }),
      },
    },
  },
};

// ============================================
// HELPER
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
// WEBSOCKET EVENTS
// ============================================
export const ws = {
  receive: {
    gateEvent: z.object({
      type: z.enum(['entry', 'exit', 'denied']),
      plateNumber: z.string(),
      timestamp: z.string(),
      reason: z.string(),
      image: z.string().optional()
    }),
  },
};
