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
http://<your_ip>:8080/ocerlay/<category-id>
```

The category-id parameter is the same as the categories in the management panel.

