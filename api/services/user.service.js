const DbMixin = require('../mixins/db.mixin');
const bcrypt = require('bcryptjs');

module.exports = {
  name: 'users',

  mixins: [DbMixin('users')],

  settings: {
    fields: ['id', 'email', 'firstName', 'lastName', 'avatar', 'organizations', 'preferences']
  },

  actions: {
    /**
     * Get current user (authenticated)
     */
    me: {
      auth: true,
      async handler(ctx) {
        const userId = ctx.meta.user.id;
        const user = await this.adapter.findById(userId);

        return this.transformUser(user);
      }
    },

    /**
     * Find user by email
     */
    findByEmail: {
      params: {
        email: { type: 'email' }
      },
      async handler(ctx) {
        const { email } = ctx.params;
        return await this.adapter.findOne({ email });
      }
    },

    /**
     * Get user by ID
     */
    get: {
      params: {
        id: { type: 'string' }
      },
      async handler(ctx) {
        const { id } = ctx.params;
        return await this.adapter.findById(id);
      }
    },

    /**
     * Update refresh token
     */
    updateRefreshToken: {
      params: {
        userId: { type: 'string' },
        refreshToken: { type: 'string', optional: true }
      },
      async handler(ctx) {
        const { userId, refreshToken } = ctx.params;

        return await this.adapter.updateById(userId, {
          $set: { refreshToken }
        });
      }
    },

    /**
     * Get user organizations
     */
    getOrganizations: {
      auth: true,
      async handler(ctx) {
        const userId = ctx.meta.user.id;
        const user = await this.adapter.findById(userId);

        return user.organizations || [];
      }
    },

    /**
     * Create demo user (for testing)
     */
    createDemo: {
      async handler(ctx) {
        const hashedPassword = await bcrypt.hash('password123', 10);

        const demoUser = {
          id: 'user-1',
          email: 'demo@example.com',
          password: hashedPassword,
          firstName: 'Demo',
          lastName: 'User',
          avatar: null,
          organizations: [
            {
              organizationId: 'org-1',
              organizationName: 'Demo Organization',
              role: 'admin',
              joinedAt: new Date()
            },
            {
              organizationId: 'org-2',
              organizationName: 'Second Org',
              role: 'member',
              joinedAt: new Date()
            }
          ],
          preferences: {
            theme: 'light',
            language: 'en',
            notifications: true
          }
        };

        return await this.adapter.insert(demoUser);
      }
    }
  },

  methods: {
    transformUser(user) {
      if (!user) return null;

      const { password, refreshToken, ...sanitized } = user;
      return sanitized;
    }
  },

  async started() {
    // Create demo user on startup
    const exists = await this.adapter.findById('user-1');
    if (!exists) {
      await this.actions.createDemo();
      this.logger.info('Demo user created: demo@example.com / password123');
    }
  }
};
