/**
 * @author Sébastien Haentjens
 */

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { Pinger } = require('../ping-service/Pinger');
const database = require('./database');
const routes = require('./routes');
const console_display = require('../console/console');
const chalk = require('chalk');
const websites = require('../../websites.json')

require('dotenv').load();

app.set('port', process.env.PORT || 3000); //app initialization
app.use(bodyParser.json());
app.use('/', routes); 

database.connect(process.env.MONGO_URL || "mongodb://localhost:27017", (err) => { // database initialization
  if (err) {
    console.error('Unable to connect to Mongo', err);
    process.exit(1);
  } else {
    app.listen(app.get('port'), () => {
      console.log(chalk.green(`Server started on port ${app.get('port')}`));
    });
  }
});

websites.websites.forEach((website) => { // launch pinger for each website
  const single_pinger = new Pinger(website.url, website.time);
  single_pinger.start()
});

console_display.start(websites.websites.map(website => website.url)); // start displaying on console

module.exports = app;