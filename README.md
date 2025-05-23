﻿# BookLog-ELK-Stack

Este proyecto es una aplicación que utiliza ELK Stack (**Elasticsearch**, **Logstash** y **Kibana**) para registrar y visualizar logs generados por un backend desarrollado en **Node.js** con **Express** y **MongoDB**.

## Requisitos

Antes de comenzar, asegúrate de cumplir con los siguientes requisitos:

1. **Software necesario**:
   - [Docker Desktop](https://www.docker.com/products/docker-desktop) (en caso de utilizar sistemas Windows) instalado y en ejecución. Esto será necesario para iniciar ELK Stack.
   - [Node.js](https://nodejs.org/).
   - [MongoDB](https://www.mongodb.com/try/download/community).

---

## Instalación y Despliegue

### 1. Clonar el repositorio

```bash
git clone https://github.com/JesusFern/booklog-elk-stack.git
```

### 2. Configurar archivos de entorno
En la carpeta de backend:
```bash
copy .env.local.example .env
```

En la carpeta de frontend:
```bash
copy .env.local.example .env
```

### 3. Iniciar ELK Stack con Docker Compose
En la carpeta raíz:
```bash
docker-compose up -d
```

### 4. Instalar dependencias y arrancar backend
En la carpeta backend:
```bash
npm install
```
**IMPORTANTE**: si cuando usted instaló MongoDB, no lo instaló como servicio, tendrá que arrancar manualmente el servidor de la base de datos. Para ello abra una ventana de comandos, sitúese en la ruta donde se ha instalado el servidor (si ha dejado la ruta por defecto, suele ser C:\ProgramFiles\MongoDB\Server\8.0\bin) y ejecute el programa mongod.

```bash
npm run dev
```

### 5. Instalar dependencias y arrancar frontend
En la carpeta frontend:
```bash
npm install
npm start
```

Tras haber seguido estos pasos:

- Elasticsearch estará disponible en [http://localhost:9200](http://localhost:9200).
- Kibana estará disponible en [http://localhost:5601](http://localhost:5601).
- Logstash estará escuchando en el puerto 5044 para recibir logs.
- El backend estará ejecutando en [http://localhost:3000](http://localhost:3000).
- El frontend estará ejecutando en [http://localhost:5000](http://localhost:5000).

Para verificar que los contenedores están corriendo:

```bash
docker ps
```

## Comandos útiles

### Detener los contenedores de Docker

```bash
docker-compose down
```

### Ver los logs de Logstash

```bash
docker logs -f logstash
```

### Ver los índices en Elasticsearch

Accede a: [http://localhost:9200/_cat/indices?v](http://localhost:9200/_cat/indices?v)
