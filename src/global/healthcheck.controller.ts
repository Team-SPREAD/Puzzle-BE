import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('api')
export class HealthCheckController {
  constructor(private readonly configService: ConfigService) {}

  // 서버 환경 상태를 반환하는 엔드포인트
  @Get('hc')
  healthCheck() {
    const serverName = this.configService.get<string>('serverName');
    const serverPort = this.configService.get<string>('serverPort');
    const env = this.configService.get<string>('serverEnv');

    // 서버 상태 정보를 반환
    return {
      serverName,
      serverPort,
      env,
    };
  }

  // 서버 환경을 반환하는 엔드포인트
  @Get('env')
  getEnv() {
    const env = this.configService.get<string>('serverEnv');
    return env;
  }
}
