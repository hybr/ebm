const DbMixin = require('../mixins/db.mixin');

module.exports = {
  name: 'organizations',

  mixins: [DbMixin('organizations')],

  settings: {
    fields: ['id', 'name', 'logo', 'description', 'settings', 'featureFlags']
  },

  actions: {
    /**
     * Get organizations by batch IDs
     */
    batch: {
      auth: true,
      params: {
        ids: { type: 'array', items: 'string' }
      },
      async handler(ctx) {
        const { ids } = ctx.params;

        const organizations = await this.adapter.find({
          query: { id: { $in: ids } }
        });

        return organizations;
      }
    },

    /**
     * Get organization by ID
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
     * Get organization feature flags
     */
    getFeatureFlags: {
      auth: true,
      params: {
        organizationId: { type: 'string' }
      },
      async handler(ctx) {
        const { organizationId } = ctx.params;

        const org = await this.adapter.findById(organizationId);

        if (!org) {
          throw new Error('Organization not found');
        }

        return org.featureFlags || [];
      }
    },

    /**
     * Update organization settings
     */
    updateSettings: {
      auth: true,
      params: {
        organizationId: { type: 'string' },
        settings: { type: 'object' }
      },
      async handler(ctx) {
        const { organizationId, settings } = ctx.params;

        // Verify user is org admin
        const userRole = await this.getUserRole(ctx.meta.user.id, organizationId);

        if (userRole !== 'admin') {
          throw new Error('Unauthorized: Admin access required');
        }

        return await this.adapter.updateById(organizationId, {
          $set: { settings }
        });
      }
    },

    /**
     * Create demo organizations (for testing)
     */
    createDemo: {
      async handler(ctx) {
        const demoOrgs = [
          {
            id: 'org-1',
            name: 'Demo Organization',
            logo: null,
            description: 'A demo organization for testing',
            settings: {
              allowPublicJobs: true,
              allowMarketplace: true,
              customBranding: {
                primaryColor: '#3880ff',
                secondaryColor: '#0cd1e8'
              }
            },
            featureFlags: [
              'market',
              'job',
              'visit',
              'work',
              'work_dashboard',
              'work_processes',
              'work_tasks',
              'work_analytics'
            ]
          },
          {
            id: 'org-2',
            name: 'Second Org',
            logo: null,
            description: 'Another demo organization',
            settings: {
              allowPublicJobs: false,
              allowMarketplace: true
            },
            featureFlags: [
              'market',
              'visit',
              'work',
              'work_dashboard'
            ]
          }
        ];

        const promises = demoOrgs.map(org => this.adapter.insert(org));
        return await Promise.all(promises);
      }
    }
  },

  methods: {
    async getUserRole(userId, organizationId) {
      const user = await this.broker.call('users.get', { id: userId });
      const userOrg = user.organizations.find(o => o.organizationId === organizationId);
      return userOrg?.role || null;
    }
  },

  async started() {
    // Create demo organizations on startup
    const exists = await this.adapter.findById('org-1');
    if (!exists) {
      await this.actions.createDemo();
      this.logger.info('Demo organizations created');
    }
  }
};
