import { Injectable, Res } from '@nestjs/common';

import { Restaurant, RestaurantList } from './interface/restaurant.interface';
import { promises } from 'dns';

const fs = require('fs');
const path = require('path');

const { fileURLToPath } = require('url');
const { dirname } = require('path');

//////////////

import { PrismaService } from '../../../src/prisma/prisma.service';

/////////////

@Injectable()
export class RestaurantService {
    constructor(private prisma: PrismaService) {} // Prisma 생성자

    // 밑의 Service 로직 -> Json 파일 말고 DB로 들어가도록, Prisma Query화 진행!

    // 디렉토리를 한번만 선언 (process.cwd() : 루트 디렉토리)
    private readonly filePath = path.join(process.cwd(), 'src', 'restaurant', 'data', 'restaurants.json');

    // 1. 모든 restaurant 데이터 가져오기 (Service)
    async getAllRestaurants(): Promise<RestaurantList> {
        try {

            // 1-1. fs 모듈의 promise 기능 사용 -> await 붙여서, fs 모듈의 결과 기다림
            const data: string = await fs.promises.readFile(this.filePath, 'utf-8');

            // 1-2. 가져온 JSON 데이터 반환
            return JSON.parse(data);

        } catch(err) {
            console.error(`모든 데이터 가져오기 오류 : ${err}`);
            throw new Error(`JSON 파일 읽기 실패: ${err.message}`);
        }
    }

    // 2. 특정 name의 restaurant 가져오기 (Service)
    async getRestaurantByName(name: string): Promise<Restaurant | undefined> {
        try {
            
            // 2-1. 먼저 전체 JSON 데이터 다 불러오기 : getAllRestaurants 사용 -> data 배열에 저장
            const data: RestaurantList = await this.getAllRestaurants();

            // 2-2. name 똑같은 1개 Restaurant만 반환
            return data.restaurants.find(r => r.name === name);

        } catch(err) {
            console.error(`특정 name restaurant 가져오기 오류 : ${err}`);
            throw new Error(`JSON 파일 읽기 실패: ${err.message}`);
        }
    }

    // 3. restaurants.json에 새로운 restaurant 데이터 추가하기
    async addRestaurant(newRestaurant: Restaurant): Promise<Restaurant> {
        try {

            // 3-1. 전체 JSON 데이터 가져오기 (RestaurantList 안에 restaurants 배열 있음)
            const data: RestaurantList = await this.getAllRestaurants();

            // 3-2. restaurants 배열에, 새로운 데이터 push
            data.restaurants.push(newRestaurant);

            // 3-3. 데이터를 다시 JSON 형식으로 변환
            const jsonData: string = JSON.stringify(data, null, 2);

            // 3-4. JSON 저장
            await fs.promises.writeFile(this.filePath, jsonData, 'utf-8');

            // 3-5. 저장한 JSON 데이터가 뭔지 return
            return newRestaurant;

        } catch(err) {
            console.error(`restaurant 추가 오류 : ${err}`);
            throw new Error(`restaurant 추가 실패: ${err.message}`);
        }
    }

    // 4. 특정 name의 데이터 삭제
    async deleteRestaurant(name: string): Promise<Restaurant> {
        try {

            // 4-1. 먼저 전체 데이터 가져오기
            const data: RestaurantList = await this.getAllRestaurants();

            // 4-2. 전체 데이터 중, name 같은 데이터의 인덱스 찾기
            const index: number | undefined = data.restaurants.findIndex(r => r.name === name);

            // 4-3. 만약 인덱스 없으면, error 반환 ()
            if(index === -1) {
                throw new Error(`이름 같은 데이터 없음`);
            }

            // 4-4. 만약 인덱스 있으면, 기존 restaurants 배열에서 해당 인덱스 삭제
            const removed: Restaurant[] = data.restaurants.splice(index, 1);

            // 4-5. 삭제한 데이터를 새로운 배열에 저장 (나중에 return 할거임)
            const removedItem: Restaurant = removed[0];

            // 4-6. 기존 배열 -> 다시 JSON 형식으로 변환
            const jsonData: string = JSON.stringify(data, null, 2);

            // 4-7. JSON 데이터 저장
            await fs.promises.writeFile(this.filePath, jsonData, 'utf-8');

            // 4-8. 삭제한 데이터가 뭔지 return
            return removedItem;

        } catch(err) {
            console.error(`restaurant 삭제 오류 : ${err}`);
            throw new Error(`restaurant 삭제 실패: ${err.message}`);
        }
    }

    // 5. 특정 name의 데이터 수정
    async patchRestaurant(name: string, newData: Partial<Restaurant>): Promise<Restaurant | undefined> {
        try {

            // 5-1. 전체 데이터 가져오기
            const data: RestaurantList = await this.getAllRestaurants();

            // 5-2. 똑같은 name 있는지 확인
            const found: Restaurant | undefined = data.restaurants.find(r => r.name === name);

            // 5-3. 만약 똑같은 name 없으면, error 반환
            if(found === undefined) {
                throw new Error('이름 같은 데이터 없음');
            }

            // 5-4. 똑같은 name 찾음 -> 해당 부분의 정보 갱신
            //      (기존 name까지 바뀌면 안되니, name 부분만 남기고 나머지 수정)
            Object.assign(found, {
                ...newData,
                name: found.name
            });

            // 5-5. 갱신한 Restaurant 배열 -> 다시 JSON 형식으로 변환
            const jsonData = JSON.stringify(data, null, 2);

            // 5-6. JSON 데이터 저장
            await fs.promises.writeFile(this.filePath, jsonData, 'utf-8');

            // 5-7. 갱신한 데이터 반환 (수정 결과)
            return found;

        } catch(err) {
            console.error(`restaurant 갱신 오류 : ${err}`);
            throw new Error(`restaurant 갱신 실패: ${err.message}`);
        }
    }
}