const ApiGateway = require('moleculer-web');
const jwt = require('jsonwebtoken');

module.exports = {
  name: 'api',

  mixins: [ApiGateway],

  settings: {
    port: process.env.PORT || 3000,

    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true
    },

    routes: [
      {
        path: '/api',

        whitelist: ['**'],

        authorization: true,

        autoAliases: true,

        aliases: {
          // Auth endpoints
          'POST /auth/login': 'auth.login',
          'POST /auth/refresh': 'auth.refresh',
          'POST /auth/logout': 'auth.logout',

          // User endpoints
          'GET /users/me': 'users.me',
          'GET /users/organizations': 'users.getOrganizations',

          // Organization endpoints
          'POST /organizations/batch': 'organizations.batch',
          'GET /organizations/:id/feature-flags': 'organizations.getFeatureFlags',

          // Feature flags
          'GET /feature-flags': 'feature-flags.list',
          'POST /feature-flags/check': 'feature-flags.isEnabled',

          // Navigation
          'GET /navigation': 'navigation.getTree'
        },

        bodyParsers: {
          json: {
            strict: false,
            limit: '1MB'
          },
          urlencoded: {
            extended: true,
            limit: '1MB'
          }
        },

        mappingPolicy: 'all',

        logging: true
      }
    ],

    log4XXResponses: false,
    logRequestParams: null,
    logResponseData: null
  },

  methods: {
    /**
     * Authorize request
     */
    async authorize(ctx, route, req) {
      const authHeader = req.headers['authorization'];

      if (!authHeader) {
        return null;
      }

      const token = authHeader.replace('Bearer ', '');

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
        const user = await ctx.call('users.get', { id: decoded.userId });

        return user;
      } catch (err) {
        return null;
      }
    }
  }
};
