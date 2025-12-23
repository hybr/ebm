const DbMixin = require('../mixins/db.mixin');

module.exports = {
  name: 'feature-flags',

  mixins: [DbMixin('feature-flags')],

  actions: {
    /**
     * Get feature flags for organization or global
     */
    list: {
      params: {
        organizationId: { type: 'string', optional: true }
      },
      async handler(ctx) {
        const { organizationId } = ctx.params;

        // Get global flags
        let flags = await this.adapter.find({
          query: { scope: 'global' }
        });

        // Get organization-specific flags
        if (organizationId) {
          const org = await ctx.call('organizations.get', { id: organizationId });

          if (org && org.featureFlags) {
            // Enable flags that are in the org's featureFlags array
            flags = flags.map(flag => ({
              ...flag,
              enabled: org.featureFlags.includes(flag.key)
            }));
          }
        }

        return {
          flags,
          lastUpdated: new Date()
        };
      }
    },

    /**
     * Check if feature is enabled
     */
    isEnabled: {
      params: {
        featureKey: { type: 'string' },
        organizationId: { type: 'string', optional: true }
      },
      async handler(ctx) {
        const { featureKey, organizationId } = ctx.params;

        // Check organization-specific flag first
        if (organizationId) {
          const org = await ctx.call('organizations.get', { id: organizationId });

          if (org && org.featureFlags) {
            return org.featureFlags.includes(featureKey);
          }
        }

        // Fallback to global flag
        const globalFlag = await this.adapter.findOne({
          query: {
            key: featureKey,
            scope: 'global'
          }
        });

        return globalFlag?.enabled ?? false;
      }
    },

    /**
     * Update feature flag
     */
    update: {
      auth: true,
      params: {
        featureKey: { type: 'string' },
        enabled: { type: 'boolean' },
        organizationId: { type: 'string', optional: true }
      },
      async handler(ctx) {
        const { featureKey, enabled, organizationId } = ctx.params;

        // Verify admin access
        if (organizationId) {
          const user = await ctx.call('users.get', { id: ctx.meta.user.id });
          const userOrg = user.organizations.find(o => o.organizationId === organizationId);

          if (userOrg?.role !== 'admin') {
            throw new Error('Unauthorized: Admin access required');
          }

          // Update org feature flags
          const org = await ctx.call('organizations.get', { id: organizationId });
          const featureFlags = org.featureFlags || [];

          if (enabled && !featureFlags.includes(featureKey)) {
            featureFlags.push(featureKey);
          } else if (!enabled && featureFlags.includes(featureKey)) {
            const index = featureFlags.indexOf(featureKey);
            featureFlags.splice(index, 1);
          }

          return await ctx.call('organizations.updateSettings', {
            organizationId,
            settings: { ...org.settings, featureFlags }
          });
        }

        const query = { key: featureKey, scope: 'global' };

        return await this.adapter.updateMany(query, {
          $set: { enabled }
        });
      }
    },

    /**
     * Create global feature flags (for testing)
     */
    createDemo: {
      async handler(ctx) {
        const globalFlags = [
          {
            key: 'market',
            name: 'Marketplace',
            description: 'Enable marketplace features',
            enabled: true,
            scope: 'global',
            metadata: { module: 'home' }
          },
          {
            key: 'job',
            name: 'Job Board',
            description: 'Enable job board features',
            enabled: true,
            scope: 'global',
            metadata: { module: 'home' }
          },
          {
            key: 'visit',
            name: 'Visit',
            description: 'Enable visit features',
            enabled: true,
            scope: 'global',
            metadata: { module: 'home' }
          },
          {
            key: 'work',
            name: 'Work',
            description: 'Enable work module',
            enabled: true,
            scope: 'global',
            metadata: { module: 'work' }
          },
          {
            key: 'work_dashboard',
            name: 'Work Dashboard',
            description: 'Enable work dashboard',
            enabled: true,
            scope: 'global',
            metadata: { module: 'work', requiredRole: 'member' }
          },
          {
            key: 'work_processes',
            name: 'Work Processes',
            description: 'Enable work processes',
            enabled: true,
            scope: 'global',
            metadata: { module: 'work' }
          },
          {
            key: 'work_tasks',
            name: 'Work Tasks',
            description: 'Enable work tasks',
            enabled: true,
            scope: 'global',
            metadata: { module: 'work' }
          },
          {
            key: 'work_analytics',
            name: 'Work Analytics',
            description: 'Enable work analytics',
            enabled: true,
            scope: 'global',
            metadata: { module: 'work' }
          }
        ];

        const promises = globalFlags.map(flag => this.adapter.insert(flag));
        return await Promise.all(promises);
      }
    }
  },

  async started() {
    // Create global feature flags on startup
    const count = await this.adapter.count();
    if (count === 0) {
      await this.actions.createDemo();
      this.logger.info('Global feature flags created');
    }
  }
};
