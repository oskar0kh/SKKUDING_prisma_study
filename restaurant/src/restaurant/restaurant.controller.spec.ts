import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantController } from './restaurant.controller';

import { RestaurantService } from './restaurant.service'; // RestaurantService 모듈 가져오기
import { RestaurantList, Restaurant } from './interface/restaurant.interface'; // RestaurantList 타입 가져오기
import { REPLCommand } from 'repl';

const fs = require('fs');
const path = require('path');

// 1. 전체 Controller 코드가 잘 작동되는지 테스트
describe('RestaurantController', () => { // 1-1. 현재 테스트 그룹명 = 'RestaurantController'로 지정
  let controller: RestaurantController;  // 나중에 controller 변수에 RestaurantController 객체를 할당할 예정

  beforeEach(async () => {               // 1-2. it() 테스트케이스 실행 전, 초기 환경설정용
    const module: TestingModule = await Test.createTestingModule({       // 1) Test용 모듈 생성
      controllers: [RestaurantController],                               //   -> 현재 테스트에서만 사용할 객체 종류 지정
      providers : [RestaurantService]                                    //   -> Controller가 생성자에서 Service 사용함
    }).compile();                                                        // 모듈 컴파일 (실제로 실행할 수 있게 됨)

    controller = module.get<RestaurantController>(RestaurantController); // 2) Test용 모듈에서 RestaurantController
  });                                                                    //      객체 까내서, 현재 테스트 그룹에서 사용하는
                                                                         //      controller 변수에 할당
  it('should be defined', () => {        // 1-3. 개별 테스트 케이스 (RestaurantController가 잘 생성되는지 확인하는 테스트)
    expect(controller).toBeDefined();    //   -> controller가 undefined인지 확인
  });
});

// 2. Controller - 'getAllRestaurants()' 테스트
describe('RestaurantController - getAllRestaurants() 통합 테스트', () => {
  let controller: RestaurantController;
  let service: RestaurantService;

  // 2-1. test용 경로 선언
  const testFilePath = path.join(__dirname, 'test-data', 'restaurants.test.json');

  // 2-2. parsing한 test용 JSON 데이터를 저장하는 변수 (메서드 실행 결과랑 비교하기 위함)
  let testJsonData: RestaurantList;

  // 2-3. test용 JSON 데이터 먼저 읽기 (메서드 실행 결과랑 비교하기 위함)
  beforeAll(async () => {
    const raw = await fs.promises.readFile(testFilePath, 'utf-8'); // test용 JSON 데이터 읽기
    testJsonData = JSON.parse(raw); // testJsonData 변수에, JSON 데이터 저장
  });

  // 2-4. test용 모듈 생성, 초기 환경 설정
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantController],    // TestingModule에 어떤 Controller 넣을지 지정
      providers: [RestaurantService],         // TestingModule에 어떤 Service 넣을지 지정
    }).compile();

    controller = module.get<RestaurantController>(RestaurantController); // controller 모듈 생성
    service = module.get<RestaurantService>(RestaurantService);          // service 모듈 생성

    (service as any).filePath = testFilePath; // 테스트용 JSON 파일을 사용하도록, service의 filePath 수정
  });

  // 2-5. 실제 테스트 케이스 로직 작성
  it('Test용 JSON 파일에서 모든 restaurant 데이터 가져오는지 확인 (Controller)', async () => {
    const mockRes = { // mockRes : Express의 Response 객체를 Mocking
      status: jest.fn().mockReturnThis(), // res.status().json() 같은 체이닝 구조 구현
      json: jest.fn(), // json(data) 역할 : 자기가 가지고 있는 데이터 그대로 출력
    };

    // 1) 실제 Controller의 'getAllRestaurants()' 메서드 실행
    await controller.getAllRestaurants(mockRes as any);

    // 2) 반환된 status 코드 비교하기 (ex: 데이터 직접 읽었을 때의 200 코드 == getAllRestaurants의 200 코드)
    expect(mockRes.status).toHaveBeenCalledWith(200);

    // 3) 직접 읽었을 때의 JSON 데이터 == getAllRestaurants() 메서드의 JSON 데이터 결과값 비교
    expect(mockRes.json).toHaveBeenCalledWith(testJsonData);
  });
});

// 3. Controller - 'getRestaurantByName()' 테스트
describe('RestaurantController - getRestaurantByName() 통합 테스트', () => {
  let controller: RestaurantController;
  let service: RestaurantService;

  // 3-1. test용 경로 선언
  const testFilePath = path.join(__dirname, 'test-data', 'restaurants.test.json');

  // 3-2. test용 JSON 저장할 변수 선언
  let testJsonData: RestaurantList;

  // 3-3. test용 JSON 데이터 전체 가져오기 (메서드 실행 결과랑 비교하기 위함)
  beforeAll(async () => {
    const raw = await fs.promises.readFile(testFilePath, 'utf-8');
    testJsonData = JSON.parse(raw);
  });

  // 3-4. test용 모듈 생성, 초기 환경 설정
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantController],    // TestingModule에 어떤 Controller 넣을지 지정
      providers: [RestaurantService],         // TestingModule에 어떤 Service 넣을지 지정
    }).compile();

    controller = module.get<RestaurantController>(RestaurantController); // controller 모듈 생성
    service = module.get<RestaurantService>(RestaurantService);          // service 모듈 생성

    (service as any).filePath = testFilePath; // 테스트용 JSON 파일을 사용하도록, service의 filePath 수정
  });

  // 3-5. 실제 테스트 케이스 로직 작성
  it('Test용 JSON 파일에서 특정 name에 해당하는 데이터 가져오는지 확인 (Controller)', async () => {
    const mockRes = { // mockRes : Express의 Response 객체를 Mocking
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // 1) name 1개 지정
    const name: string = '먹거리 고을';

    // 2) 실제 Controller의 메서드 실행 (name도 건네주기)
    await controller.getRestaurantByName(mockRes as any, name);

    // 3) test용 JSON 데이터에서, name이랑 같은 데이터 찾기
    const expected = testJsonData.restaurants.find(r => r.name === name);

    // 4) 반환된 status 코드 비교하기
    expect(mockRes.status).toHaveBeenCalledWith(200);

    // 5) 'getRestaurantByName 메서드의 결과값 == test용 JSON 데이터에서 찾은 데이터' 인지 확인
    expect(mockRes.json).toHaveBeenCalledWith(expected);
  });
});

// 4. Controller - 'addRestaurant()' 테스트
describe('RestaurantController - addRestaurant() 통합 테스트', () => {
  let controller: RestaurantController;
  let service: RestaurantService;

  // 4-1. test용 경로, test용 JSON 데이터 저장할 변수 선언
  const testFilePath = path.join(__dirname, 'test-data', 'restaurants.test.json');

  let testJsonData1: RestaurantList; // 직접 데이터 집어넣을 JSON 변수
  let testJsonData2: RestaurantList; // Service 로직으로 데이터 집어넣을 변수

  // 4-2. test용 JSON 데이터 전체 가져오기 (testJsonData1에 저장)
  beforeAll(async () => {
    const raw = await fs.promises.readFile(testFilePath, 'utf-8');
    testJsonData1 = JSON.parse(raw);
  });

  // 4-3. test용 모듈 생성, 초기 환경 설정
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantController],
      providers: [RestaurantService],
    }).compile();

    controller = module.get<RestaurantController>(RestaurantController);
    service = module.get<RestaurantService>(RestaurantService);

    (service as any).filePath = testFilePath;
  });

  // 4-4. '직접 데이터 넣은 JSON 파일 == addRestaurant Service 로직 사용한 JSON 파일' 같은지 비굔
  it('Test용 JSON 파일에 데이터 추가하는 기능 확인 (Controller)', async () => {
    const mockRes = { // mockRes : Express의 Response 객체를 Mocking
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // 1) 집어넣을 JSON 데이터 1개 만들기
    const testData = {
      "name": "알촌",
      "address": "경기도 수원시 당구장쪽",
      "phone": "1111-5555-9999"
    };

    // 2) 직접 JSON 파일에 데이터 넣기
    testJsonData1.restaurants.push(testData);

    // 3) controller 메서드 사용 -> JSON 파일에 데이터 넣기 -> testJsonData2로 변경된 파일 다시 읽어오기
    await controller.addRestaurant(mockRes as any, testData);

    const raw = await fs.promises.readFile(testFilePath, 'utf-8');
    testJsonData2 = JSON.parse(raw); // 데이터 추가된 파일 다시 가져오기

    // 4) 반환된 status 코드 비교하기 (POST 헨들러: 201 코드 반환)
    expect(mockRes.status).toHaveBeenCalledWith(201);

    // 5) 'addRestaurant 메서드의 결과 JSON 파일 == 직접 데이터 넣은 JSON 파일' 인지 확인
    expect(testJsonData2).toEqual(testJsonData1);
  });
});

// 5. Controller - 'deleteRestaurant()' 테스트
describe('RestaurantController - deleteRestaurant() 통합 테스트', () => {
  let controller: RestaurantController;
  let service: RestaurantService;

  const testFilePath = path.join(__dirname, 'test-data', 'restaurants.test.json');

  let testJsonData: RestaurantList;

  // 5-1. test용 JSON 데이터 전체 가져오기 (testJsonData에 저장)
  beforeAll(async () => {
    const raw = await fs.promises.readFile(testFilePath, 'utf-8');
    testJsonData = JSON.parse(raw);
  });

  // 5-2. test용 모듈 생성, 초기 환경 설정
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantController],
      providers: [RestaurantService],
    }).compile();

    controller = module.get<RestaurantController>(RestaurantController);
    service = module.get<RestaurantService>(RestaurantService);

    (service as any).filePath = testFilePath;
  });

  // 5-3. '직접 삭제한 후의 반환값 == Controller로 삭제한 후의 반환값' 같은지 비교
  it('Test용 JSON 파일에 특정 name의 데이터 삭제하는 기능 확인 (Controller)', async () => {
    const mockRes = { // mockRes : Express의 Response 객체를 Mocking
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // 1) 테스트용 name 1개 지정
    const targetName: string = "알촌";

    // 2) 직접 데이터를 JSON 파일에서 삭제 & 삭제한 데이터 반환 (testJsonData)

      // 1.. targetName이랑 같은 이름의 데이터 인덱스 찾기
    const index: number | undefined = testJsonData.restaurants.findIndex(r => r.name === targetName)

      // 2.. testJsonData1 안에서 해당 데이터 잘라내기
    const removedItem1: Restaurant = testJsonData.restaurants.splice(index, 1)[0];

    // 3) Controller에서 deleteRestaurant() Service 로직 사용 -> 원본 파일에서 삭제 -> 삭제한 데이터 반환
    //  -> controller의 deleteRestaurant()의 반환값 = void
    //  ∴ 반환값 사용하려면, mockRes에서 값 추출해야함!
    await controller.deleteRestaurant(mockRes as any, targetName);

    // 4) 반환된 status 코드 비교
    expect(mockRes.status).toHaveBeenCalledWith(200);

    // 5) 2개 반환값 같은지 비교 (mockRes에서 controller 로직의 반환값 추출)
    expect(mockRes.json).toHaveBeenCalledWith(removedItem1);
  });
});

// 6. Controller - 'patchRestaurant()' 테스트
describe('RestaurantController - patchRestaurant() 통합 테스트', () => {
  let controller: RestaurantController;
  let service: RestaurantService;

  const testFilePath = path.join(__dirname, 'test-data', 'restaurants.test.json');

  let testJsonData: RestaurantList;

  // 6-1. test용 JSON 데이터 전체 가져오기 (testJsonData에 저장)
  beforeAll(async () => {
    const raw = await fs.promises.readFile(testFilePath, 'utf-8');
    testJsonData = JSON.parse(raw);
  });

  // 6-2. test용 모듈 생성, 초기 환경 설정
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantController],
      providers: [RestaurantService],
    }).compile();

    controller = module.get<RestaurantController>(RestaurantController);
    service = module.get<RestaurantService>(RestaurantService);

    (service as any).filePath = testFilePath;
  });

  // 6-3. '직접 수정한 JSON 파일 == Controller로 수정한 원본 test용 JSON 파일' 같은지 비교
  it('Test용 JSON 파일에 특정 name의 데이터 수정하는 기능 확인 (Controller)', async () => {
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // 1) 수정할 JSON 데이터 1개 만들기
    const testData = {
      "name": "행컵",
      "address": "경기도 수원시 당구장쪽",
      "phone": "8282-5555-2323",
      "rating": 4.1 // 추가된 값 (요걸로 수정할거임)
    };

    // 2) 직접 testData의 name과 같은 데이터 찾기 -> 해당 데이터의 정보 수정
    const found: Restaurant | undefined = testJsonData.restaurants.find(r => r.name === testData.name);

      // * found가 undefined인 경우, Error 반환하도록 설계
    if(found) {
      Object.assign(found, {
        ...testData,
        name: found.name  // 기존 name은 유지하고, 나머지 정보들만 testData속 정보들로 바꾸기
      });
    } else {
      throw new Error(`Restaurant with name ${testData.name} not found`);
    }

    // 3) Controller의 patchRestaurant() 사용 : 원본 test용 JSON 파일 수정하기
    await controller.patchRestaurant(mockRes as any, testData.name, testData);

    // 4) 수정된 원본 JSON 파일 다시 읽어오기
    const raw = await fs.promises.readFile(testFilePath, 'utf-8');
    const updatedJson = JSON.parse(raw);

    // 5) 반환된 status 코드 비교
    expect(mockRes.status).toHaveBeenCalledWith(200);

    // 6) '수정된 원본 JSON 파일 == testJsonData' 같은지 비교
    expect(updatedJson).toEqual(testJsonData);
  });
});