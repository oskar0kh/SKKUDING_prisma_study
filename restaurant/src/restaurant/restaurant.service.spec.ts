import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantService } from './restaurant.service';
import { Res } from '@nestjs/common';
import { RestaurantList } from './interface/restaurant.interface';

import { PrismaClient, Restaurant } from '@prisma/client'; // Prisma가 생성한 Restaurant 타입 사용 (createdAt, updatedAt 포함)
import { PrismaService } from '../../../src/prisma/prisma.service'; // PrismaService 모듈 import
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { create } from 'domain';

// 1. Service - 'getAllRestaurants()' 테스트 (PrismaService를 Mock -> ‘findMany' 메서드 테스트)
describe('RestaurantService - getAllRestaurants() 유닛 테스트 (Prisma)', () => {
  let service: RestaurantService;
  let prismaMock: DeepMockProxy<PrismaService>; // PrismaService : Prisma Client를 우리가 직접 extend해서 재정의한 클래스

  // 1-1. 매 it 테스트마다, 테스트용 prismaMock, service 객체 생성
  beforeEach(() => {
    prismaMock = mockDeep<PrismaService>();      // PrismaService의 모든 메서드를 'jest.fn()'으로 바꾸기
    service = new RestaurantService(prismaMock); // 테스트용 mock 객체 생성
  });

  // 1-2. getAllRestaurants() 테스트 (해당 메서드의 내부에 있는 'findMany'가 mock한 데이터 가져오는지 확인)
  it('Prisma: 모든 restaurant 데이터 가져오는지 확인 (Service-Mock)', async () => {
    
    // 1) 더미 데이터 생성
    const mockRestaurants: Restaurant[] = [
      {
        name: '맥도날드',
        address: '경기도 수원시 후문쪽 어쩌구',
        phone: '3232-3232-3232',
        rating: 4.3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { 
        name: '율전회관', 
        address: '경기도 수원시 어쩌구', 
        phone: '1212-1212-1212', 
        rating: 4.6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // 2) findMany 사전 설정 : getAllRestaurants() 사용 -> this.prisma.restaurant.findMany()실행 
    //                     -> findMany가 더미 데이터를 읽도록 설정
    //
    // (mockResolvedValue : findMany가, 우리가 만든 더미 데이터를 읽도록 설정)
    prismaMock.restaurant.findMany.mockResolvedValue(mockRestaurants);

    // 3) getAllRestaurants() 사용 : 이 메서드가 findMany 사용 -> 더미 데이터 가져옴
    const result = await service.getAllRestaurants();

    // 4) 예상값 == 실제값 비교 ('getAllRestaurants로 가져온 더미 데이터 == 더미 데이터' 직접 비교)
    expect(result).toEqual({ restaurants: mockRestaurants });

    // 5) mock한 findMany가 딱 1번만 사용됐는지 확인
    expect(prismaMock.restaurant.findMany).toHaveBeenCalledTimes(1);
  });
});

// 2. Service - 'getRestaurantByName()' 테스트 (Prisma)
describe('RestaurantService - getRestaurantByName() 유닛 테스트 (Prisma)', () => {
  let service: RestaurantService;
  let prismaMock: DeepMockProxy<PrismaService>;

  // 2-1. 매 it 테스트마다, 테스트용 prismaMock, service 객체 생성
  beforeEach(() => {
    prismaMock = mockDeep<PrismaService>();      // PrismaService의 모든 메서드를 'jest.fn()'으로 바꾸기
    service = new RestaurantService(prismaMock); // 테스트용 mock 객체 생성
  });

  // 2-2. getRestaurantByName()이 findUnique()를 올바르게 호출하는지 확인
  it('Prisma: 특정 name에 해당하는 데이터 가져오는지 확인 (Service-Mock)', async() => {
    
    // 1) 더미 데이터 생성
    const mockRestaurants: Restaurant[] = [
      {
        name: '맥도날드',
        address: '경기도 수원시 후문쪽 어쩌구',
        phone: '3232-3232-3232',
        rating: 4.3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { 
        name: '율전회관', 
        address: '경기도 수원시 어쩌구', 
        phone: '1212-1212-1212', 
        rating: 4.6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    
    // 2) test용 name 하나 지정
    const targetName: string = '맥도날드';

    // 3) 더미 데이터에서, name이랑 같은 데이터 찾기
    const expected = mockRestaurants.find(r => r.name === targetName);
    
    // 4) Prisma의 'findUnique' Mock : 앞으로 prisma.restaurant.findUnique()가 호출되면, 그냥 expected 값 반환
    prismaMock.restaurant.findUnique.mockResolvedValue(expected!);

    // 5) getRestaurantByName() 사용 -> findUnique 사용 -> expected 반환
    const result = await service.getRestaurantByName(targetName);

    // 6) 예상값 == 실제값 비교
    expect(result).toEqual(expected);

    // 7) findUnique가 Service 로직대로 'where : { name : targetName }' 형식으로 호출됐는지 기록 확인
    expect(prismaMock.restaurant.findUnique).toHaveBeenCalledWith({
      where: { name: targetName },
    });
  });
});

// 3. Service - 'addRestaurant()' 테스트
describe('RestaurantService - addRestaurant() 유닛 테스트 (Prisma)', () => {
  let service: RestaurantService;
  let prismaMock: DeepMockProxy<PrismaService>;

  // 1-1. 매 it 테스트마다, 테스트용 prismaMock, service 객체 생성
  beforeEach(() => {
    prismaMock = mockDeep<PrismaService>();      // PrismaService의 모든 메서드를 'jest.fn()'으로 바꾸기
    service = new RestaurantService(prismaMock); // 테스트용 mock 객체 생성
  });

  // 1-2. addRestaurant()가 create 호출한 과정 확인
  it('Prisma: 새로운 restaurant 데이터 추가하는 기능 확인 (Service-Mock)', async() => {

    // 1) addRestaurant() 용 더미 데이터 생성
    const createInput = {
      name: '맥도날드',
      address: '경기도 수원시 후문쪽 어쩌구',
      phone: '3232-3232-3232',
      rating: 4.3,
    };

    // create가 반환할 데이터 : createdAt, updatedAt 포함
    const mockRestaurant: Restaurant = {
      ...createInput,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 2) Prisma의 'create' Mock : 앞으로 prisma.restaurant.create()가 호출되면, 그냥 mockRestaurant 반환
    prismaMock.restaurant.create.mockResolvedValue(mockRestaurant);

    // 3) addRestaurant() 사용 -> create 사용 -> mockRestaurant 반환
    const result = await service.addRestaurant(createInput);

    // 4) 예상값 == 실제값 비교
    expect(result).toEqual(mockRestaurant);

    // 5) create가 Service 로직대로 'data : { ~ }' 형식으로 호출됐는지 기록 확인
    expect(prismaMock.restaurant.create).toHaveBeenCalledWith({
      data: createInput // createAt, updatedAt이 없는 형식대로 반환됐는지 확인
    });

  });
});

// 4. Service - 'deleteRestaurant()' 테스트
describe('RestaurantService - deleteRestaurant() 유닛 테스트 (Prisma)', () => {
  let service: RestaurantService;
  let prismaMock: DeepMockProxy<PrismaService>;

  // 1-1. 매 it 테스트마다, 테스트용 prismaMock, service 객체 생성
  beforeEach(() => {
    prismaMock = mockDeep<PrismaService>();      // PrismaService의 모든 메서드를 'jest.fn()'으로 바꾸기
    service = new RestaurantService(prismaMock); // 테스트용 mock 객체 생성
  });

  // 1-2. deleteRestaurant()가 delete 호출한 과정 확인
  it('Prisma: 특정 name의 restaurant 데이터 삭제하는지 확인 (Service-Mock)', async() => {

    // 1) 더미 데이터 생성
    const deletedRestaurant : Restaurant = {
        name: '맥도날드',
        address: '경기도 수원시 후문쪽 어쩌구',
        phone: '3232-3232-3232',
        rating: 4.3,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    
    // 2) test용 name 하나 지정
    const targetName: string = '맥도날드';

    // 3) Prisma의 'delete' Mock : 앞으로 prisma.restaurant.create()가 호출되면, 그냥 deletedRestaurant 반환
    prismaMock.restaurant.delete.mockResolvedValue(deletedRestaurant);

    // 4) deleteRestaurant() 사용 -> delete 사용 -> deletedRestaurant 반환
    const result = await service.deleteRestaurant(targetName);

    // 5) 예상값 == 실제값 비교
    expect(result).toEqual(deletedRestaurant);

    // 6) delete가 Service 로직대로 'where : { ~ }' 형식으로 호출됐는지 기록 확인
    expect(prismaMock.restaurant.delete).toHaveBeenCalledWith({
      where: { name: targetName },
    });
  });
});

// 5. Service - 'patchRestaurant()' 테스트
describe('RestaurantService - patchRestaurant() 유닛 테스트 (Prisma)', () => {
  let service: RestaurantService;
  let prismaMock: DeepMockProxy<PrismaService>;

  // 1-1. 매 it 테스트마다, 테스트용 prismaMock, service 객체 생성
  beforeEach(() => {
    prismaMock = mockDeep<PrismaService>();      // PrismaService의 모든 메서드를 'jest.fn()'으로 바꾸기
    service = new RestaurantService(prismaMock); // 테스트용 mock 객체 생성
  });

  // 5-4. patchRestaurant()가 update 호출한 과정 확인
  it('Prisma: 특정 name의 restaurant 데이터 수정하는지 확인 (Service-Mock)', async() => {
    
    // 1) patchRestaurant() 용 더미 데이터 생성
    const patchInput = {
      name: '맥도날드',
      address: '경기도 수원시 후문쪽 어쩌구',
      phone: '3232-3232-3232',
      rating: 4.3,
    };

    // update가 반환할 데이터 : createdAt, updatedAt 포함
    const mockRestaurant: Restaurant = {
      ...patchInput,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 2) test용 name 하나 지정
    const targetName: string = '맥도날드';

    // 3) Prisma의 'update' Mock : 앞으로 prisma.restaurant.update()가 호출되면, 그냥 updatedRestaurant 반환
    prismaMock.restaurant.update.mockResolvedValue(mockRestaurant);

    // 4) patchRestaurant() 사용 -> update 사용 -> updatedRestaurant 반환
    const result = await service.patchRestaurant(targetName, patchInput);

    // 5) 예상값 == 실제값 비교
    expect(result).toEqual(mockRestaurant);

    // 6) update가 Service 로직대로 'data : { ~ }' 형식으로 호출됐는지 기록 확인
    expect(prismaMock.restaurant.update).toHaveBeenCalledWith({
      where: { name: targetName } ,
      data: patchInput,
    });
  });
});