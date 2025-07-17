import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { urlencoded, json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Buddy API')
    .setDescription('Api to manage everything ')
    .setVersion('1.0')
    // .addTag('Api')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // Add global prefix
  app.setGlobalPrefix('api/v1'); // All routes will start with /api/v1
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  app.enableCors({
    origin: '*', // Allow all origins for development, restrict in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true, // Allow credentials if needed
  });

  const port = process.env.PORT || 8080; // Use PORT from environment or default to 8080
  await app.listen(port);

  // Detect if running locally
  const isLocal = ['localhost', '127.0.0.1'].includes(process.env.HOST || '') || !process.env.HOST;

  const host = isLocal ? 'localhost' : process.env.HOST || '0.0.0.0';
  console.log(`Server is running on http://${host}:${port}/api/v1`);
}
bootstrap();
