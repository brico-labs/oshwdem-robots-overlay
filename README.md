# Oshwdem Robot Overlay

Webapp to manage and track robot scores for Oshwdem 2017, allows tracking
three different competitions: Siguelineas, Velocistas and Laberintos.

Requires Node to handle dependencies and run the webserver for the app and
MongoDB to store the data.

**DISCLAIMER: This app is not meant to be hosted for online use, it's not
secured for simplicity purposes**

To install dependencies and get the base app running just do:
```
npm install
npm start
```

If it doesn't work maybe you need nodemon, bower and gulp instaleld and in your system's PATH:
```
npm install -g nodemon bower gulp
```
Even though the app is not meant for online use, config.js should be changed
when running the app to avoid running into problems at the local network.

To open the overlay, just point a browser to
```
http://<your_ip>:8080/overlay/<category-id>
```

The category-id parameter is the same as the categories in the management panel.

# Docker Compose Setup

You can also run the app and MongoDB easily using Docker Compose.

1. Make sure you have [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

2. Use the following `docker-compose.yml` file to start the services:


```yaml
services:
  oshwdem-robots-overlay:
    image: ghcr.io/brico-labs/oshwdem-robots-overlay:latest
    container_name: oshwdem-robots-overlay
    ports:
      - "8080:8080"
    depends_on:
      - mongo
    environment:
      - PORT=8080
      - MONGO_HOST=mongo
      - MONGO_PORT=27017
      - MONGO_DB=oshwdem_2025
    networks:
      - internal_net
    restart: unless-stopped

  mongo:
    image: mongo:7
    container_name: mongo-overlay
    volumes:
      - ./mongo-data:/data/db
    networks:
      - internal_net
    restart: unless-stopped

networks:
  internal_net:
    driver: bridge
```

3. Run the following command in the directory containing the docker-compose.yml file:
```bash
docker-compose up -d
```

4. Access the app in your browser at http://localhost:8080.

5. MongoDB data is persisted in the local `./mongo-data` folder.

6. To stop and remove the containers, run:
```bash
docker-compose down
```

This setup makes it easy to run the entire stack without installing Node.js or MongoDB locally.