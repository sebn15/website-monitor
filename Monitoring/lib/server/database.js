/**
 * @author Sébastien Haentjens
 */

const MongoClient = require('mongodb').MongoClient;

const state = {
  database: null
};

const initializeDatabase = async (database) => { // database initialization
  try {
    await database.createCollection('logs');
    await database.collection('logs').dropIndexes();
    await database.collection('logs').createIndex({ timestamp: 1 }, { expireAfterSeconds: 3600 });
    await database.createCollection('alerts');
    await database.collection('alerts').dropIndexes();
    return await database.collection('alerts').createIndex({ timestamp: 1 }, { expireAfterSeconds: 3600 * 24 });
  } catch (err) {
    return console.error('Error creating index, logs and alerts will not expire');
  }
};

const connect = (uri, done) => { // first connection
  if (state.database) {
    return done();}
  MongoClient.connect(uri, (err, database) => {
    if (err) return done(err);
    initializeDatabase(database);
    state.database = database;
    return done();
  });
};

const get = () => { // access the database
  return state.database;
};

const close = (done) => {
  if (state.db) {
    state.db.close((err, result) => {
      state.db = null;
      state.mode = null;
      return done(err);
    });
  }
};

module.exports = { connect, get, close};