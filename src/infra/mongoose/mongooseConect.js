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

    // Use Memory Server only in development
    if (process.env.NODE_ENV === 'potato') {
      try {
        const mongod = await MongoMemoryServer.create({
          binary: {
            version: '7.0.4',
            downloadDir: './.mongodb-binaries',
          },
        });
        const mongoUri = mongod.getUri();
        await mongoose.connect(mongoUri, mongooseOptions);
        console.log('Conectado ao MongoDB em memória (ambiente de desenvolvimento)');
        return;
      } catch (memoryServerError) {
        console.error('Erro ao iniciar MongoDB em memória:', memoryServerError.message);
        process.exit(1);
      }
    }

    // For production, always use remote MongoDB
    if (!process.env.MONGO_DB_URI) {
      throw new Error('MONGO_DB_URI não definida em ambiente de produção');
    }

    await mongoose.connect(process.env.MONGO_DB_URI, mongooseOptions);
    console.log('Conectado ao MongoDB remoto');
  } catch (error) {
    console.error('Erro fatal ao conectar ao MongoDB:', error);
    process.exit(1);
  }
}

module.exports = connectDB;