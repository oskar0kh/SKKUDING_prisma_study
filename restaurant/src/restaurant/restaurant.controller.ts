import { Controller, Get, HttpStatus, Res, Query, Post, Body, Delete, Param, Patch } from '@nestjs/common';
import { Response } from 'express'; // nestjs의 'Res'랑, express의 'Response'랑 연결해야함

import { RestaurantService } from './restaurant.service'; // Service 로직 가져오기
import { Restaurant, RestaurantList } from './interface/restaurant.interface'; // 인터페이스 가져오기

import { createRestaurantDto } from './dto/restaurant.dto';

@Controller('restaurant')
export class RestaurantController {
    
    // constructor로 Service 로직 DI 주입
    constructor(private readonly restaurantService : RestaurantService) {};

    // 1. 모든 restaurant 데이터 불러오기 (Controller)
    // http://localhost:3000/restaurant

    @Get('/')
    async getAllRestaurants(@Res() res: Response): Promise<void> {
        try {

            // 1-1. service(getAllRestaurants) 사용 -> JSON 데이터 가져오기
            const data: RestaurantList = await this.restaurantService.getAllRestaurants();

            // 1-2. '200 성공 Response & JSON 데이터' 전송
            res.status(HttpStatus.OK).json(data);

        } catch(err){

            console.error('[파일 읽기 오류]', err);

            // 1-3. JSON 데이터 못 가져왔을 때 : 500 실패 Response 전송
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error:  err.message });
        }
    }


    // 2. 특정 name의 restaurant 가져오기 (Controller)
    // * Query 방식
    // http://localhost:3000/restaurant/find?name=생각나는 순대

    @Get('/find') // Query 방식
    async getRestaurantByName(@Res() res: Response, @Query('name') name: string): Promise<void> {
        try {

            // 1. Service 사용 -> name 같은 1개 Restaurant 데이터만 가져오기 (getRestaurantByName)
            const data: Restaurant | undefined = await this.restaurantService.getRestaurantByName(name);

            // 2. '200 성공 Response & JSON 데이터' 전송
            res.status(HttpStatus.OK).json(data);

        } catch(err) {
            console.error('[파일 읽기 오류]', err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error:  err.message });
        }
    }

    // 3. restaurants.json에 새로운 restaurant 데이터 추가하기
    // http://localhost:3000/restaurant/

    @Post('/')
    async addRestaurant(
        @Res() res: Response,
        @Body() newRestaurant: createRestaurantDto
    ): Promise<void> {
        try {

            // 1. Service (addRestaurant 메서드) 사용 -> 데이터 저장하고, 뭘 저장했는지 return값 받기
            const data: Restaurant = await this.restaurantService.addRestaurant(newRestaurant);

            // 2. HTTP Response 전송
            res.status(HttpStatus.CREATED).json(data);

        } catch(err) {

            // 3. 오류 처리
            console.error(`[데이터 추가 오류] : ${err}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: err.message });

        }
    }

    // 4. 특정 name의 데이터 삭제
    // * 이번에는 Param 방식으로 해보자
    // http://localhost:3000/restaurants/먹거리 고을

    @Delete('/:name') // Param 방식
    async deleteRestaurant(@Res() res: Response, @Param('name') name: string): Promise<void> {
        try { 

            // 1. Service 로직 사용 -> name 같은 데이터 삭제
            const data: Restaurant = await this.restaurantService.deleteRestaurant(name);

            // 2. HTTP Response & 삭제한 데이터 전송
            res.status(HttpStatus.OK).json(data);

        } catch(err) {
            console.error(`[데이터 삭제 오류] : ${err}`);

            // 3. Service에서 데이터 못찾았을 때 throw 하는 Error 받기
            //    -> 해당 err의 message가 Service 속 message랑 똑같으면, 404 Not Found 응답
            //    -> 만약 Service에서 이상 없었으면, 500 서버 오류 응답
            
            if(err.message.includes('이름 같은 데이터 없음')) {
                res.status(HttpStatus.NOT_FOUND).json({ error: err.message });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: err.message });
            }
        }
    }

    // 5. 특정 name의 데이터 갱신
    // * Param 방식
    // http://localhost:3000/restaurant/먹거리 고을

    @Patch('/:name')
    async patchRestaurant(
        @Res() res: Response,
        @Param('name') name: string,         // URL로 받는 restaurant의 name
        @Body() newData: Partial<createRestaurantDto> // HTTP Request의 body로 받는 JSON 데이터
    ): Promise<void> {
        try {

            // 1. Service 로직 적용 -> HTTP Request의 body로 받은 새로운 데이터 (newData)로, 기존 정보 update
            const data = await this.restaurantService.patchRestaurant(name, newData);

            // 2. HTTP Response & 수정한 데이터 전송
            res.status(HttpStatus.OK).json(data);

        } catch(err) {
            console.error(`[데이터 수정 오류] : ${err}`);

            // 3. Service에서 데이터 못찾았을 때 throw 하는 Error 받기
            //    -> 해당 err의 message가 Service 속 message랑 똑같으면, 404 Not Found 응답
            //    -> 만약 Service에서 이상 없었으면, 500 서버 오류 응답
            
            if(err.message.includes('이름 같은 데이터 없음')) {
                res.status(HttpStatus.NOT_FOUND).json({ error: err.message });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: err.message });
            }
        }
    }
}