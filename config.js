module.exports = {
  url: '0.0.0.0',
  port: process.env.PORT || 8080,
  database: `mongodb://${process.env.MONGO_HOST}:` +
            `${process.env.MONGO_PORT}/` +
            `${process.env.MONGO_DB}`,
};