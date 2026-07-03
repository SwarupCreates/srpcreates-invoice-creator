import { app } from './app.js';
import { getEnv } from './config/env.js';

const env = getEnv();

app.listen(env.PORT, () => {
  console.log(`Backend listening on http://localhost:${env.PORT}`);
});
