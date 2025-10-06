import mongoose from 'mongoose';
import Grid from 'gridfs-stream';

class Database {
  constructor() {
    this.connection = null;
    this.gfs = null;
  }

  async connect() {
    try {
      const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/my-portfolio';
      
      this.connection = await mongoose.connect(connectionString);

      console.log('✅ Connected to MongoDB:', connectionString);

      // Initialize GridFS
      const db = mongoose.connection.db;
      this.gfs = Grid(db, mongoose.mongo);
      this.gfs.collection('uploads'); // Collection name for file storage

      console.log('✅ GridFS initialized for file storage');

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️  MongoDB disconnected');
      });

      return this.connection;
    } catch (error) {
      console.error('❌ Error connecting to MongoDB:', error);
      process.exit(1);
    }
  }

  getGridFS() {
    return this.gfs;
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
  }

  // Utility method to check if connected
  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

export default new Database();