const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function connectDB() {
  try {
    const mongooseOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 120000, // 2 minutes in milliseconds
      family: 4, // Use IPv4
      socketTimeoutMS: 45000, // 45 seconds for socket timeout
      connectTimeoutMS: 120000, // 2 minutes in milliseconds
    };

    // Always try to use MongoDB Memory Server first
    try {
      const mongod = await MongoMemoryServer.create({
        binary: {
          version: '7.0.4',
          downloadDir: './.mongodb-binaries',
        },
      });
      const mongoUri = mongod.getUri();
      await mongoose.connect(mongoUri, mongooseOptions);
      console.log('Conectado ao MongoDB em memória');
      return;
    } catch (memoryServerError) {
      console.log('Fallback para MongoDB remoto:', memoryServerError.message);
    }

    // Fallback to remote MongoDB if memory server fails
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
      console.log('Conectado ao MongoDB remoto');
    } else {
      throw new Error('MONGO_URI não definida e MongoDB em memória falhou');
    }
  } catch (error) {
    console.error('Erro fatal ao conectar ao MongoDB:', error);
    process.exit(1); // Exit on fatal connection error
  }
}

module.exports = connectDB;