/**
 * Generic Firestore Controller Factory
 * Creates RESTful CRUD controllers with validation and error handling
 */

export const createFirestoreController = (crudInstance, validator, uniqueFields = []) => {
  return {
    // GET all items
    getAll: async (req, res) => {
      try {
        const options = {};
        
        // Parse query parameters for filtering
        if (req.query.featured !== undefined) {
          options.where = [['featured', '==', req.query.featured === 'true']];
        }
        
        if (req.query.category) {
          options.where = options.where || [];
          options.where.push(['category', '==', req.query.category]);
        }
        
        if (req.query.status) {
          options.where = options.where || [];
          options.where.push(['status', '==', req.query.status]);
        }
        
        // Sorting
        if (req.query.sortBy) {
          options.orderBy = {
            field: req.query.sortBy,
            direction: req.query.sortDir || 'desc'
          };
        }
        
        // Limit
        if (req.query.limit) {
          options.limit = parseInt(req.query.limit);
        }
        
        const items = await crudInstance.getAll(options);
        res.json({
          success: true,
          count: items.length,
          data: items
        });
      } catch (error) {
        console.error('Get all error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch items',
          message: error.message
        });
      }
    },

    // GET single item by ID
    getById: async (req, res) => {
      try {
        const { id } = req.params;
        const item = await crudInstance.getById(id);
        
        if (!item) {
          return res.status(404).json({
            success: false,
            error: 'Item not found'
          });
        }
        
        res.json({
          success: true,
          data: item
        });
      } catch (error) {
        console.error('Get by ID error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch item',
          message: error.message
        });
      }
    },

    // POST create new item
    create: async (req, res) => {
      try {
        // Validate data
        if (validator) {
          const validation = validator(req.body);
          if (!validation.valid) {
            return res.status(400).json({
              success: false,
              error: 'Validation failed',
              errors: validation.errors
            });
          }
        }
        
        // Create item with duplicate checking
        const item = await crudInstance.create(req.body, uniqueFields);
        
        res.status(201).json({
          success: true,
          message: 'Item created successfully',
          data: item
        });
      } catch (error) {
        console.error('Create error:', error);
        
        if (error.message.includes('already exists')) {
          return res.status(409).json({
            success: false,
            error: 'Duplicate entry',
            message: error.message
          });
        }
        
        res.status(500).json({
          success: false,
          error: 'Failed to create item',
          message: error.message
        });
      }
    },

    // PUT update item
    update: async (req, res) => {
      try {
        const { id } = req.params;
        
        // Validate data
        if (validator) {
          const validation = validator(req.body);
          if (!validation.valid) {
            return res.status(400).json({
              success: false,
              error: 'Validation failed',
              errors: validation.errors
            });
          }
        }
        
        // Update with duplicate checking
        const item = await crudInstance.update(id, req.body, uniqueFields);
        
        res.json({
          success: true,
          message: 'Item updated successfully',
          data: item
        });
      } catch (error) {
        console.error('Update error:', error);
        
        if (error.message === 'Document not found') {
          return res.status(404).json({
            success: false,
            error: 'Item not found'
          });
        }
        
        if (error.message.includes('already exists')) {
          return res.status(409).json({
            success: false,
            error: 'Duplicate entry',
            message: error.message
          });
        }
        
        res.status(500).json({
          success: false,
          error: 'Failed to update item',
          message: error.message
        });
      }
    },

    // DELETE item
    delete: async (req, res) => {
      try {
        const { id } = req.params;
        await crudInstance.delete(id);
        
        res.json({
          success: true,
          message: 'Item deleted successfully'
        });
      } catch (error) {
        console.error('Delete error:', error);
        
        if (error.message === 'Document not found') {
          return res.status(404).json({
            success: false,
            error: 'Item not found'
          });
        }
        
        res.status(500).json({
          success: false,
          error: 'Failed to delete item',
          message: error.message
        });
      }
    },

    // GET count
    count: async (req, res) => {
      try {
        const filters = {};
        
        if (req.query.category) {
          filters.where = [['category', '==', req.query.category]];
        }
        
        const count = await crudInstance.count(filters);
        
        res.json({
          success: true,
          count
        });
      } catch (error) {
        console.error('Count error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to count items',
          message: error.message
        });
      }
    },

    // GET search
    search: async (req, res) => {
      try {
        const { field = 'name', query } = req.query;
        
        if (!query) {
          return res.status(400).json({
            success: false,
            error: 'Search query is required'
          });
        }
        
        const items = await crudInstance.search(field, query);
        
        res.json({
          success: true,
          count: items.length,
          data: items
        });
      } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
          success: false,
          error: 'Search failed',
          message: error.message
        });
      }
    },

    // POST batch create
    batchCreate: async (req, res) => {
      try {
        const { items } = req.body;
        
        if (!Array.isArray(items) || items.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Items array is required'
          });
        }
        
        // Validate all items
        if (validator) {
          for (const item of items) {
            const validation = validator(item);
            if (!validation.valid) {
              return res.status(400).json({
                success: false,
                error: 'Validation failed for batch items',
                errors: validation.errors
              });
            }
          }
        }
        
        const created = await crudInstance.batchCreate(items, uniqueFields);
        
        res.status(201).json({
          success: true,
          message: `${created.length} items created successfully`,
          data: created
        });
      } catch (error) {
        console.error('Batch create error:', error);
        
        if (error.message.includes('Duplicate')) {
          return res.status(409).json({
            success: false,
            error: 'Duplicate entry in batch',
            message: error.message
          });
        }
        
        res.status(500).json({
          success: false,
          error: 'Batch create failed',
          message: error.message
        });
      }
    }
  };
};
