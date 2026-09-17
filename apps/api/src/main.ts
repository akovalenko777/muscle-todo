import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { createValidationPipe } from './config/validation-pipe.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(createValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Kanban API')
    .setDescription('Task management API with JWT authentication')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
