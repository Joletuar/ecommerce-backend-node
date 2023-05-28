# Express Js Teslo Shop

## Descripción

Este proyecto tuvo como objetivo la implementación de todo un sistema Backend para el Frontend realizado en [Teslo Shop Frontend](https://github.com/Joletuar/ecommerce-next).
Se realizó un sistema RestFull API creando diferentes endpoints para realizar las operaciones de un CRUD con rutas protegidas mediante sessiones generadas usando JWT. La arquitectura utilizada fue de un modelo de 3 capas **(MVC)** para asegurar así que sea escalable y mantenible. La información se alamacena en una base de datos NOSQL como MongoDB para lo cual creó una imagen de docker para que su despliegue sea portable y sencillo de implementar en diferentes entornos usando contenedores.

## Tecnologías

### Backend

-   Node Js
-   Express Js
-   JWT

### Base de datos

-   NOSQL: MongoDB

### Servicio para alojar contenido multimedia

-   Cloudinary

### Plataformas

-   Docker

## Despliegue Local

### Levantar la Base de Datos

En primer lugar, realiza el despligue de la base de datos a traves de la creación de una imagen de docker y su posterior implementación en un contenedor. Ejecuta el siguiente comando para esto:

```
docker-compose up -d
```

Luego de esto levanta la imagen en un contenedor. Puede utilizar [Docker Desktop](https://www.docker.com/products/docker-desktop/) para esto. Asegurate de que puedas conectarte correctamente a la base de datos usando herramientas como [MongoDB Compas](https://www.mongodb.com/products/compass).

### Configuración de variables de entorno

En segundo lugar, renombra el archivo **.env.template** a **.env** y rellena las variables de entorno con los datos necesarios. Dentro de estás variables se encuentras keys y tokens que será utilizados para validar las transacciones realizadas con Paypal desde el Frontend, así como la conexión con la API de Cloudinary para la carga de imagenes.

### Instalación de dependencias

En tercer luegar, luego de haber desplegado el backend realizar la instalación de todos los paquetes y dependencias del proyecto usando:

```
yarn
```

or

```
npm install
```

or

```
pnpm install
```

### Lanzar el servidor de desarrollo

En cuarto lugar, cuando las todas dependencias se hayan instalado y la base datos esté levantada correctamente. Levanta el servidor de desarrollo usando:

```
yarn dev
```

or

```
npm run dev
```

or

```
pnpm run dev
```

El proyecto será desplegado en la siguiente URL:

```
http://localhost:<TU_PUERTO_CONFIGURADO>
```

## **!!!IMPORTANTE!!!**

Cuando todo ya esté levantado y funcionando correctamente haz una llamada de tipo **_POST_** al siguiente endpoint para llenar la base datos con un seed de datos:

```
http://localhost:<TU_PUERTO_CONFIGURADO>/api/seed
```

Puede utilizar herramientas como [POSTMAN](https://www.postman.com/) para este tipo de cosas.

## Endpoints

#### Semilla

```
/api/seed
```

#### Productos

```
/api/products
```

#### Búsqueda de Productos

```
/api/search
```

#### Usuarios

```
/api/users
```

#### Órdenes

```
/api/orders
```

#### Administración

```
/api/admin
```
