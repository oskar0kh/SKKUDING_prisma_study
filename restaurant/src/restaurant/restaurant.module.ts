import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../src/prisma/prisma.module'; // 추가!
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';

@Module({
  controllers: [RestaurantController],
  providers: [RestaurantService],
  imports: [PrismaModule], // 추가!
})
export class RestaurantModule {}