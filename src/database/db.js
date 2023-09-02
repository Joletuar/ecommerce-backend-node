const mongoose = require('mongoose');

/**
 * 0 = disconnected
 * 1 = connected
 * 2 = connecting
 * 3 = disconnecting
 */

const mongoConnection = {
  isConnected: 0,
};

// Función para conectar a la base de datos

const connect = async () => {
  // Realizamos la conexión con la bd

    await mongoose.connect(process.env.MONGO_URL || '');
    mongoConnection.isConnected = 1;
    console.log('---> Conectado a MongoDB:', process.env.MONGO_URL);
  } catch (error) {
    console.log('Error al conectar a MongoDB: ', error);
  }
};

// Función para desconectar a la base de datos

const disconnect = async () => {
  // Si estamos en desarrollo no nos desconectamos de la bd

  if (process.env.NODE_ENV === 'development') return;

  // Si ya estamos desconectamos no hacemos nada

  if (mongoConnection.isConnected === 0) return;

  // Realizamos la desconexión de la bd

  try {
    await mongoose.disconnect();
    mongoConnection.isConnected = 0;

    console.log('---> Desconectado de MongoDB');
  } catch (error) {
    console.log('Error al desconectar a MongoDB: ', error);
  }
};

module.exports = {
  connect,
  disconnect,
};
