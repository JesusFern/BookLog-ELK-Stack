# BookLog-ELK-Stack

Este proyecto es una aplicación que utiliza ELK Stack (**Elasticsearch**, **Logstash** y **Kibana**) para registrar y visualizar logs generados por un backend desarrollado en **Node.js** con **Express** y **MongoDB**.

## Requisitos

Antes de comenzar, asegúrate de cumplir con los siguientes requisitos:

1. **Software necesario**:
   - [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado y en ejecución.
   - [Node.js](https://nodejs.org/).
   - [MongoDB Compass](https://www.mongodb.com/products/compass).

2. **Base de datos requerida**:
   - Crear una base de datos en MongoDB llamada `bookdb`.

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/booklog-elk-stack.git
cd booklog-elk-stack
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

## Uso

### 1. Iniciar ELK Stack con Docker Compose

```bash
docker-compose up -d
```

Esto hará lo siguiente:

- Elasticsearch estará disponible en [http://localhost:9200](http://localhost:9200).
- Kibana estará disponible en [http://localhost:5601](http://localhost:5601).
- Logstash estará escuchando en el puerto 5044 para recibir logs.

Para verificar que los contenedores están corriendo:

```bash
docker ps
```

### 2. Iniciar el backend

Navega a la carpeta backend y ejecuta el servidor:

```bash
npm run dev
```

---

## Verificar los logs en Kibana

1. Abre Kibana en tu navegador: [http://localhost:5601](http://localhost:5601)
2. Ve a la sección **Discover**.
3. Selecciona el índice `express-logs-*` para visualizar los logs generados por el backend.

---

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
