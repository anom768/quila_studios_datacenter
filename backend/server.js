const app = require('./src/app');
const config = require('./src/config');

const { port } = config;

app.listen(port, () => {
  console.log(`[Server] QUILA Data Center Backend running on port ${port} in ${config.env} mode`);
});
