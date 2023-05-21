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
    // Verificamos si ya estamos conectados

    if (mongoConnection.isConnected) {
        console.log('---> Ya estabamos conectados');
        return;
    }

    // Verificamos si existen conexiones

    if (mongoose.connections.length > 0) {
        // Obtenemos el estado de la primera conexión (puede ser un arreglo de conexiones, solo tomanos una de esas)

        mongoConnection.isConnected = mongoose.connections[0].readyState;

        // Si su estado es "1" usamos dicha conexión

        if (mongoConnection.isConnected === 1) {
            console.log('---> Usando conexión anterior');
            return;
        }

        // Caso contrario cerramos la conexión

        await mongoose.disconnect();
    }

    // Realizamos la conexión con la bd

    await mongoose.connect(process.env.MONGO_URL || '');
    mongoConnection.isConnected = 1;
    console.log('---> Conectado a MongoDB:', process.env.MONGO_URL);
};

// Función para desconectar a la base de datos

const disconnect = async () => {
    // Si estamos en desarrollo no nos desconectamos de la bd

    if (process.env.NODE_ENV === 'development') return;

    // Si ya estamos desconectamos no hacemos nada

    if (mongoConnection.isConnected === 0) return;

    // Realizamos la desconexión de la bd

    await mongoose.disconnect();
    mongoConnection.isConnected = 0;

    console.log('---> Desconectado de MongoDB');
};

module.exports = {
    connect,
    disconnect,
};
