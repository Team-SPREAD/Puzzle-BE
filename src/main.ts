import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Puzzle API Documentation')
    .setDescription('Puzzle service API documentation. Include the required JWT token in the header for each request.')
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
      description: 'Enter only the JWT token. Do not include the "Bearer " prefix.',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 쿠키 파서 미들웨어 추가
  app.use(cookieParser());

  // CORS 설정
  app.enableCors({
    origin: [
      'http://localhost:3000', // 로컬 개발 환경
      'https://spread-puzzle.io/', // 배포 환경
    ],
    credentials: true, // 쿠키 및 인증 헤더 포함 허용
  });

  // ConfigService를 통해 PORT 가져오기
  const port = parseInt(configService.get('PORT'), 10) || 3000;

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
