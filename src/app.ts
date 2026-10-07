import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFound } from './middlewares/error.middleware';
import { uploadRoot } from './modules/upload/upload.route';
import { router } from './routes';

export function createApp() {
  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(
    cors({
      origin: env.clientUrls,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use('/uploads', express.static(uploadRoot));
  app.use('/api/v1', router);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
