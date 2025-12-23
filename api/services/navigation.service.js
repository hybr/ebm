const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'navigation',

  actions: {
    /**
     * Get navigation tree
     */
    getTree: {
      params: {
        organizationId: { type: 'string', optional: true }
      },
      async handler(ctx) {
        const { organizationId } = ctx.params;

        // Load base navigation tree
        const baseTree = this.loadNavigationTree();

        // Customize based on organization settings
        if (organizationId) {
          const org = await ctx.call('organizations.get', { id: organizationId });
          const enabledFeatures = org.featureFlags || [];

          // Filter tree based on enabled features
          const filteredTree = this.filterTreeByFeatures(baseTree, enabledFeatures);

          return { tree: filteredTree };
        }

        return { tree: baseTree };
      }
    }
  },

  methods: {
    loadNavigationTree() {
      const treePath = path.join(__dirname, '../data/navigation-tree.json');
      const treeData = fs.readFileSync(treePath, 'utf8');
      return JSON.parse(treeData);
    },

    filterTreeByFeatures(nodes, enabledFeatures) {
      return nodes
        .filter(node => {
          // Filter by feature flag
          if (node.featureKey && !enabledFeatures.includes(node.featureKey)) {
            return false;
          }
          return true;
        })
        .map(node => {
          // Recursively filter children
          if (node.children) {
            return {
              ...node,
              children: this.filterTreeByFeatures(node.children, enabledFeatures)
            };
          }
          return node;
        });
    }
  }
};
