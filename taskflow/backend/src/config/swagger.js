// ═══════════════════════════════════════════
// Swagger / OpenAPI Configuration
// ═══════════════════════════════════════════

import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'TaskFlow API',
    version: '1.0.0',
    description:
      'A scalable REST API with JWT authentication, role-based access control, and full task management CRUD.',
    contact: {
      name: 'TaskFlow Team',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token obtained from /auth/login or /auth/register',
      },
    },
    schemas: {
      // ── Enums ──
      Role: {
        type: 'string',
        enum: ['USER', 'ADMIN'],
      },
      Status: {
        type: 'string',
        enum: ['PENDING', 'IN_PROGRESS', 'DONE'],
      },

      // ── Request Bodies ──
      RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100, example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', minLength: 8, example: 'SecureP@ss123' },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', example: 'SecureP@ss123' },
        },
      },
      CreateTaskInput: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200, example: 'Design database schema' },
          description: { type: 'string', maxLength: 2000, example: 'Create Prisma models for User and Task' },
          status: { $ref: '#/components/schemas/Status' },
        },
      },
      UpdateTaskInput: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string', maxLength: 2000 },
          status: { $ref: '#/components/schemas/Status' },
        },
      },

      // ── Response Models ──
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { $ref: '#/components/schemas/Role' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: { $ref: '#/components/schemas/Status' },
          userId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      // ── Standard API Response ──
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object', nullable: true },
          errors: { type: 'array', items: { type: 'string' }, nullable: true },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./src/modules/**/*.routes.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
