const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Obtenemos las variables de entorno definidas en el archivo .env

require('dotenv').config();

// Creamos el servidor

const app = express();

// Serializamos la información que entre y salga (transforma la req.body a un json)

app.use(express.json());

// CORS

app.use(
  cors({
    // Habilitamos que nuestro front tenga acceso
    credentials: true,
    optionSuccessStatus: 200,
    origin: process.env.FRONT_URL,
  })
);

// Nos permite manejar cookies en express

app.use(cookieParser());

// Con esto podemos serializar x-www-form-ulrencoded

app.use(express.urlencoded({ extended: true }));

// Definimos las rutas

app.use('/api/seed', require('./routes/seed'));

app.use('/api/products', require('./routes/products'));

app.use('/api/search', require('./routes/search'));

app.use('/api/user', require('./routes/user'));

app.use('/api/orders', require('./routes/orders'));

app.use('/api/admin', require('./routes/admin'));

// Ponemos a la escucha al servidor

app.listen(process.env.PORT, () => {
  console.log(`----> Servidor levantado en el puerto ${process.env.PORT}`);
});
