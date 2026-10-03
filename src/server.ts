import { createApp } from './app';
import { connectDb } from './config/db';
import { env } from './config/env';

async function bootstrap() {
  await connectDb();
  const app = createApp();

  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
