import { Injectable, Res } from '@nestjs/common';
import { PrismaService } from '../../../src/prisma/prisma.service'; // 추가!

import { Restaurant, RestaurantList } from './interface/restaurant.interface';
import { promises } from 'dns';

const fs = require('fs');
const path = require('path');

const { fileURLToPath } = require('url');
const { dirname } = require('path');

@Injectable()
export class RestaurantService {

    constructor(private prisma: PrismaService) {} // 생성자 -> Prisma 객체 생성

    // 1. 모든 restaurant 데이터 가져오기 (Service) - SQL DB에서 데이터 가져오기 (JSON 파일 X)
    async getAllRestaurants(): Promise<RestaurantList> {
        try {

            // 1-1. 'restaurant' 테이블 속 모든 데이터 가져오기
            //      -> 이때, prisma로 찾은 데이터에는 'createdAt' 같은 SQL 테이블에만 있는 데이터가 포함되어 있어서,
            //         'restaurants'의 타입은 'Restaurant[]'로 지정하는게 맞음
            //         (RestaurantList에는 createdAt 같은 데이터가 없기에, 그냥 Restaurant 배열로 받는게 맞음)
            const restaurants: Restaurant[] = await this.prisma.restaurant.findMany();

            // 1-2. 가져온 DB 데이터 반환
            return { restaurants };

        } catch(err) {
            console.error(`모든 데이터 가져오기 오류 : ${err}`);
            throw new Error(`DB에서 restaruant 조회 실패: ${err.message}`);
        }
    }

    // 2. 특정 name의 restaurant 가져오기 (Service)
    async getRestaurantByName(name: string): Promise<Restaurant | null> { // name 없으면, null 반환
        try {
            
            // 2-1. 'restaurant' 테이블 속, 'name == 생각나는 순대' 인 데이터 가져오기
            const restaurant : Restaurant | null = await this.prisma.restaurant.findUnique({
                where: {
                    name: name
                },
            });

            // 2-2. name 똑같은 1개 Restaurant만 반환
            return restaurant;

        } catch(err) {
            console.error(`특정 name restaurant 가져오기 오류 : ${err}`);
            throw new Error(`DB에서 restaruant 조회 실패: ${err.message}`);
        }
    }

    // 3. DB에 새로운 restaurant 데이터 추가하기
    async addRestaurant(newRestaurant: Restaurant): Promise<Restaurant> {
        try {

            // 3-1. create 로직 작성
            const newRestaurant : Restaurant = await this.prisma.restaurant.create({
                data: {
                    name: '알촌',
                    address: '경기도 수원시 어쩌고',
                    phone: '1111-4444-9999',
                }
            });

            // 3-2. 어떤걸 생성했는지 반환
            return newRestaurant;

        } catch(err) {
            console.error(`restaurant 추가 오류 : ${err}`);
            throw new Error(`restaurant 추가 실패: ${err.message}`);
        }
    }

    // 4. 특정 name의 데이터 삭제
    async deleteRestaurant(name: string): Promise<Restaurant> {
        try {

            // 4-1. delete 로직 작성 ('name' parameter 데이터 삭제)
            const deletedRestaurant : Restaurant = await this.prisma.restaurant.delete({
                where: {
                    name: name
                }
            });

            // 4-2. 삭제한 데이터가 뭔지 return
            return deletedRestaurant;

        } catch(err) {
            console.error(`restaurant 삭제 오류 : ${err}`);
            throw new Error(`restaurant 삭제 실패: ${err.message}`);
        }
    }

    // 5. 특정 name의 데이터 수정
    async patchRestaurant(name: string, newData: Partial<Restaurant>): Promise<Restaurant> {
        try {

            // 5-1. update 로직 작성
            const updatedRestaurant : Restaurant = await this.prisma.restaurant.update({
                where: {
                    name: name
                },
                data: {
                    // ... (true && { 데이터 }) -> { 데이터 } 반환
                    // ... (false && { 데이터 }) -> {} 반환
                    ...(newData.name !== undefined && { name: newData.name }),
                    ...(newData.address !== undefined && { address: newData.address }),
                    ...(newData.phone !== undefined && { phone: newData.phone }),
                    ...(newData.rating !== undefined && { rating: newData.rating }),
                    // rating이 없으면 (undefined) -> data에 rating 데이터가 안들어감!
                }
            });

            // 5-2. 갱신한 데이터 반환 (수정 결과)
            return updatedRestaurant;

        } catch(err) {
            console.error(`restaurant 갱신 오류 : ${err}`);
            throw new Error(`restaurant 갱신 실패: ${err.message}`);
        }
    }
}