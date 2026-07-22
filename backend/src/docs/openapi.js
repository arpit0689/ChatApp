const config = require('../config/env');

const objectId = {
  type: 'string',
  pattern: '^[0-9a-fA-F]{24}$',
  example: '64b7f1a2c3d4e5f678901234',
};

const errorResponse = {
  description: 'Request failed',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Error' },
    },
  },
};

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Real-Time Chat API',
    version: '1.0.0',
    description: 'REST API for users, rooms, and persisted chat messages. Live chat uses Socket.IO.',
  },
  servers: [{ url: '/', description: 'Current server' }],
  tags: [
    { name: 'System' },
    { name: 'Authentication' },
    { name: 'Rooms' },
    { name: 'Messages' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Application health',
        responses: {
          200: {
            description: 'Process is healthy',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Health' } },
            },
          },
        },
      },
    },
    '/health/ready': {
      get: {
        tags: ['System'],
        summary: 'Database readiness',
        responses: {
          200: { description: 'Application is ready' },
          503: { description: 'Database is not connected' },
        },
      },
    },
    '/api/auth/guest': {
      post: {
        tags: ['Authentication'],
        summary: 'Create a guest user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username'],
                properties: { username: { type: 'string', minLength: 2, maxLength: 30 } },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Guest created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UserResponse' } },
            },
          },
          400: errorResponse,
          409: errorResponse,
        },
      },
    },
    '/api/config': {
      get: {
        tags: ['System'],
        summary: 'Get public runtime configuration',
        responses: {
          200: {
            description: 'Public configuration returned',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    statusCode: { type: 'integer', example: 200 },
                    data: {
                      type: 'object',
                      properties: { authEnabled: { type: 'boolean' } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register an account',
        description: 'Creates an account and returns a JWT.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                  username: { type: 'string', minLength: 2, maxLength: 30 },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6, format: 'password' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Account created' },
          400: errorResponse,
          403: errorResponse,
          409: errorResponse,
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log in',
        description: 'Authenticates an account and returns a JWT.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string', format: 'password' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Authenticated' },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
        },
      },
    },
    '/api/rooms': {
      get: {
        tags: ['Rooms'],
        summary: 'List rooms',
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
        ],
        responses: {
          200: {
            description: 'Rooms returned',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/RoomsResponse' } },
            },
          },
          400: errorResponse,
        },
      },
      post: {
        tags: ['Rooms'],
        summary: 'Create a room',
        security: [{ bearerAuth: [] }, {}],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RoomInput' },
            },
          },
        },
        responses: {
          201: { description: 'Room created' },
          400: errorResponse,
          409: errorResponse,
        },
      },
    },
    '/api/rooms/{roomId}': {
      parameters: [{ $ref: '#/components/parameters/RoomId' }],
      get: {
        tags: ['Rooms'],
        summary: 'Get a room',
        responses: {
          200: { description: 'Room returned' },
          400: errorResponse,
          404: errorResponse,
        },
      },
      put: {
        tags: ['Rooms'],
        summary: 'Update a room',
        security: [{ bearerAuth: [] }, {}],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RoomInput' } },
          },
        },
        responses: {
          200: { description: 'Room updated' },
          400: errorResponse,
          404: errorResponse,
        },
      },
      delete: {
        tags: ['Rooms'],
        summary: 'Delete a room',
        security: [{ bearerAuth: [] }, {}],
        responses: {
          200: { description: 'Room deleted' },
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/api/messages': {
      post: {
        tags: ['Messages'],
        summary: 'Create a message',
        description: 'In guest mode include senderId. In authenticated mode send a bearer token.',
        security: [{ bearerAuth: [] }, {}],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content', 'roomId'],
                properties: {
                  content: { type: 'string', maxLength: config.MAX_MESSAGE_LENGTH },
                  roomId: objectId,
                  senderId: objectId,
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Message created' },
          400: errorResponse,
          401: errorResponse,
          404: errorResponse,
        },
      },
    },
    '/api/messages/{roomId}': {
      get: {
        tags: ['Messages'],
        summary: 'List messages in a room',
        parameters: [
          { $ref: '#/components/parameters/RoomId' },
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
        ],
        responses: {
          200: { description: 'Messages returned' },
          400: errorResponse,
        },
      },
    },
    '/api/messages/{roomId}/search': {
      get: {
        tags: ['Messages'],
        summary: 'Search room messages',
        parameters: [
          { $ref: '#/components/parameters/RoomId' },
          { name: 'query', in: 'query', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Matching messages returned' },
          400: errorResponse,
        },
      },
    },
    '/api/messages/{messageId}': {
      parameters: [{ $ref: '#/components/parameters/MessageId' }],
      put: {
        tags: ['Messages'],
        summary: 'Edit a message',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: {
                  content: { type: 'string', maxLength: config.MAX_MESSAGE_LENGTH },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Message updated' },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
        },
      },
      delete: {
        tags: ['Messages'],
        summary: 'Delete a message',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Message deleted' },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    parameters: {
      RoomId: { name: 'roomId', in: 'path', required: true, schema: objectId },
      MessageId: { name: 'messageId', in: 'path', required: true, schema: objectId },
      Page: { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
      Limit: {
        name: 'limit',
        in: 'query',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
      },
    },
    schemas: {
      Health: {
        type: 'object',
        required: ['status', 'timestamp'],
        properties: {
          status: { type: 'string', example: 'ok' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          statusCode: { type: 'integer' },
          message: { type: 'string' },
          errors: { type: 'array', items: { type: 'object' } },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: objectId,
          username: { type: 'string' },
          email: { type: 'string', format: 'email', nullable: true },
        },
      },
      UserResponse: {
        type: 'object',
        properties: {
          statusCode: { type: 'integer', example: 201 },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: { user: { $ref: '#/components/schemas/User' } },
          },
        },
      },
      RoomInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', maxLength: config.MAX_ROOM_NAME_LENGTH },
          description: { type: 'string', maxLength: 500 },
        },
      },
      Room: {
        allOf: [
          { $ref: '#/components/schemas/RoomInput' },
          {
            type: 'object',
            properties: {
              _id: objectId,
              messageCount: { type: 'integer' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        ],
      },
      RoomsResponse: {
        type: 'object',
        properties: {
          statusCode: { type: 'integer', example: 200 },
          data: {
            type: 'object',
            properties: {
              rooms: { type: 'array', items: { $ref: '#/components/schemas/Room' } },
              pagination: { type: 'object' },
            },
          },
        },
      },
    },
  },
};
