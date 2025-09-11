const mongoose = require('mongoose');

class DatabaseService {
  constructor() {
    this.isConnected = false;
    this.connection = null;
  }

  async connect() {
    try {
      // MongoDB connection options
      const options = {
        // Connection pooling
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        
        // Database name
        dbName: process.env.DB_NAME || 'agricultural-supply-chain',
      };

      console.log('🔗 Connecting to MongoDB...');
      
      this.connection = await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/agricultural-supply-chain',
        options
      );

      this.isConnected = true;
      console.log(`✅ MongoDB Connected: ${this.connection.connection.host}`);
      console.log(`📊 Database: ${this.connection.connection.name}`);

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('📡 MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
        this.isConnected = true;
      });

      return this.connection;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.connection.close();
        console.log('📴 MongoDB connection closed');
        this.isConnected = false;
        this.connection = null;
      }
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error.message);
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      state: this.getReadyStateString(mongoose.connection.readyState)
    };
  }

  getReadyStateString(state) {
    switch (state) {
      case 0: return 'disconnected';
      case 1: return 'connected';
      case 2: return 'connecting';
      case 3: return 'disconnecting';
      default: return 'unknown';
    }
  }

  async createIndexes() {
    try {
      console.log('📊 Creating database indexes...');
      
      // User indexes are already defined in the schema
      // Add any additional custom indexes here if needed
      
      console.log('✅ Database indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating indexes:', error.message);
    }
  }

  async healthCheck() {
    try {
      if (!this.isConnected) {
        throw new Error('Database not connected');
      }

      // Simple ping to check if database is responsive
      await mongoose.connection.db.admin().ping();
      
      return {
        status: 'healthy',
        connected: true,
        database: mongoose.connection.name,
        host: mongoose.connection.host,
        readyState: this.getReadyStateString(mongoose.connection.readyState)
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message
      };
    }
  }

  // Get database statistics
  async getStats() {
    try {
      if (!this.isConnected) {
        throw new Error('Database not connected');
      }

      const stats = await mongoose.connection.db.stats();
      const collections = await mongoose.connection.db.listCollections().toArray();
      
      return {
        database: mongoose.connection.name,
        collections: collections.length,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexSize: stats.indexSize,
        documents: stats.objects,
        indexes: stats.indexes,
        collectionNames: collections.map(col => col.name)
      };
    } catch (error) {
      console.error('❌ Error getting database stats:', error.message);
      throw error;
    }
  }

  // Clean up test data (for development only)
  async cleanDatabase() {
    try {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Cannot clean database in production');
      }

      console.log('🧹 Cleaning test database...');
      
      const collections = await mongoose.connection.db.listCollections().toArray();
      
      for (const collection of collections) {
        await mongoose.connection.db.collection(collection.name).deleteMany({});
        console.log(`🗑️  Cleared collection: ${collection.name}`);
      }

      console.log('✅ Database cleaned successfully');
    } catch (error) {
      console.error('❌ Error cleaning database:', error.message);
      throw error;
    }
  }

  // Seed initial data (for development)
  async seedDatabase() {
    try {
      const User = require('../models/User');
      
      // Check if we already have data
      const userCount = await User.countDocuments();
      if (userCount > 0) {
        console.log('📊 Database already has data, skipping seed');
        return;
      }

      console.log('🌱 Seeding database with initial data...');

      // Create admin user
      const adminUser = await User.create({
        name: 'System Administrator',
        email: 'admin@supplychainfarming.com',
        password: 'admin123456',
        role: 'admin',
        profile: {
          verified: true
        }
      });

      console.log('✅ Created admin user:', adminUser.email);

      // Create sample farmer
      const farmer = await User.create({
        name: 'John Farmer',
        email: 'farmer@example.com',
        password: 'farmer123',
        role: 'farmer',
        walletAddress: '0x742d35Cc6635C0532925a3b8D0B51b4a2b7f3e3e',
        profile: {
          location: 'Odisha, India',
          contact: '+91-9876543210',
          specialties: ['Organic Rice', 'Vegetables']
        }
      });

      console.log('✅ Created sample farmer:', farmer.email);

      // Create sample distributor
      const distributor = await User.create({
        name: 'ABC Distribution',
        email: 'distributor@example.com',
        password: 'distributor123',
        role: 'distributor',
        walletAddress: '0x8ba1f109551bD432803012645Hac136c9e6a3e3e',
        profile: {
          company: 'ABC Distribution Pvt Ltd',
          location: 'Bhubaneswar, Odisha',
          contact: '+91-9876543211',
          licenseNumber: 'DIST123456'
        }
      });

      console.log('✅ Created sample distributor:', distributor.email);

      console.log('🌱 Database seeded successfully!');
      
      return {
        admin: adminUser,
        farmer: farmer,
        distributor: distributor
      };
    } catch (error) {
      console.error('❌ Error seeding database:', error.message);
      throw error;
    }
  }
}

// Export singleton instance
const databaseService = new DatabaseService();

module.exports = {
  DatabaseService,
  databaseService
};
