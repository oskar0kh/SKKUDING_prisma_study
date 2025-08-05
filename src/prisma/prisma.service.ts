import { INestApplication, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient { // 우리가 직접 PrismaService라는 클래스 만들어서 사용
  constructor() {
    super(); // super 호출 -> beforeExit 오류 무시
  }

  async enableShutdownHooks(app: INestApplication) {
    (this as any).$on('beforeExit', async () => {
      await app.close();
    });
  }
}