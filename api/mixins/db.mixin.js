// Simple in-memory database mixin for development
// In production, replace with MongoDB adapter

module.exports = function(collection) {
  const data = new Map();
  let idCounter = 1;

  const adapter = {
    async find(query = {}) {
      const items = Array.from(data.values());

      if (query.query) {
        // Simple query filtering
        return items.filter(item => {
          return Object.entries(query.query).every(([key, value]) => {
            if (value.$in) {
              return value.$in.includes(item[key]);
            }
            return item[key] === value;
          });
        });
      }

      return items;
    },

    async findOne(query) {
      const items = await adapter.find({ query });
      return items[0] || null;
    },

    async findById(id) {
      return data.get(id) || null;
    },

    async insert(entity) {
      const id = entity.id || String(idCounter++);
      const newEntity = { ...entity, id };
      data.set(id, newEntity);
      return newEntity;
    },

    async updateById(id, update) {
      const entity = data.get(id);
      if (!entity) return null;

      const updated = { ...entity };

      if (update.$set) {
        Object.assign(updated, update.$set);
      } else {
        Object.assign(updated, update);
      }

      data.set(id, updated);
      return updated;
    },

    async updateMany(query, update) {
      const items = await adapter.find({ query });
      const promises = items.map(item =>
        adapter.updateById(item.id, update)
      );
      return Promise.all(promises);
    },

    async removeById(id) {
      data.delete(id);
      return { success: true };
    },

    async clear() {
      data.clear();
      return { success: true };
    },

    async count() {
      return data.size;
    }
  };

  return {
    created() {
      // Assign adapter to service instance
      this.adapter = adapter;
    }
  };
};
