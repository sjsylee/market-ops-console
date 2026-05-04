import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './modules/app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true, credentials: true });

  const port = Number(process.env.API_PORT || 4000);
  await app.listen(port);
  console.log(`Market Ops demo API listening on http://localhost:${port}`);
}

void bootstrap();
