import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Puzzle API 명세서')
    .setDescription('Puzzle 서비스의 API 명세서입니다. 각 요청에 필요한 JWT 토큰을 헤더에 포함해야 합니다.')
    .setVersion('1.0.0')
    .addBearerAuth(
      { 
        type: 'http', 
        scheme: 'bearer', 
        bearerFormat: 'JWT',
        in: 'header',
        description: 'JWT 토큰만 입력해주세요. "Bearer " 접두사는 제외하고 토큰만 넣습니다.'
      }
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 쿠키 파서 미들웨어 추가
  app.use(cookieParser());

  // CORS 설정
  app.enableCors({
    origin: ['http://localhost:3000', 'https://your-production-domain.com'], // 접근을 허용할 도메인 설정
    credentials: true, // 쿠키와 함께 요청을 허용
  });

  await app.listen(3000);
}

bootstrap();
