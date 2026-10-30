require('dotenv').config();
const app = require('./app');
const connectDatabase = require('./config/db');

const port = process.env.PORT || 5000;

connectDatabase()
  .then(() => {
    app.listen(port, () => console.log(`API listening on port ${port}.`));
  })
  .catch((error) => {
    console.error('Unable to start the API:', error.message);
    process.exitCode = 1;
  });
