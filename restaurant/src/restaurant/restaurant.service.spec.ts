import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantService } from './restaurant.service';
import { Res } from '@nestjs/common';

import { RestaurantList, Restaurant } from './interface/restaurant.interface';
const fs = require('fs');
const path = require('path');

// 전체 Service 코드가 잘 작동되는지 테스트
describe('RestaurantService', () => {
  let service: RestaurantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RestaurantService],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

// 1. Service - 'getAllRestaurants()' 테스트
describe('RestaurantService - getAllRestaurants() 유닛 테스트', () => {
  let service: RestaurantService;

  // 1-1. test용 JSON 파일 경로 받기
  const testFilePath = path.join(__dirname, 'test-data', 'restaurants.test.json');

  // 1-2. RestaurantService가 기존에 사용하는 filePath 경로를 test 경로로 바꾸기
  beforeEach(() => {
    service = new RestaurantService(); // RestaurantService 인스턴스 생성 -> 'service'에 할당

    (service as any).filePath = testFilePath; // RestaurantService가 기존에 사용하는 'filePath' = private 임
                                              // : private을 임시 해제 -> 테스트에서도 'filePath'를 사용할 수 있게 설정!
                                              //   -> 'filePath'의 경로를, 우리가 지금 지정한 'testFilePath'로 잠깐 변경
                                              // ∴ RestaurantService에서 test용 JSON 파일 경로로 들어가도록 잠깐 변경
  });

  // 1-3. '실제 readFile한 결과 == getAllRestaurants 결과' 인지 확인
  it('Test용 JSON 파일에서 모든 restaurant 데이터 가져오는지 확인 (Service)', async () => {

    // 실제로 readFile을 한 결과
    const expectedData = JSON.parse(await fs.promises.readFile(testFilePath, 'utf-8'));

    // getAllRestaurants()를 사용한 결과
    const result = await service.getAllRestaurants();

    // 2개 결과가 같은지 비교
    expect(result).toEqual(expectedData);
  });
});

// 2. Service - 'getRestaurantByName()' 테스트
describe('RestaurantService - getRestaurantByName() 유닛 테스트', () => {
  let service: RestaurantService;

  const testFilePath = path.join(__dirname, 'test-data', 'restaurants.test.json');

  let testJsonData: RestaurantList; // 전체 JSON 데이터 저장하는 전역 변수 선언

  // 2-1. 먼저 test용 JSON 데이터 전체 가져오기
  beforeAll(async () => {
    const raw = await fs.promises.readFile(testFilePath, 'utf-8'); // test용 JSON 데이터 읽기
    testJsonData = JSON.parse(raw); // jsonData 변수에, JSON 데이터 저장
  });

  beforeEach(() => {
    service = new RestaurantService();

    (service as any).filePath = testFilePath; // test용 JSON 파일 경로로 수정
  });

  it('Test용 JSON 파일에서 특정 name에 해당하는 데이터 가져오는지 확인 (Service)', async() => {
    // 2-2. test용 name 하나 생성
    const targetName: string = '먹거리 고을';

    // 2-3. 전체 test용 JSON 데이터에서, name이랑 같은 데이터 찾기
    const expected = testJsonData.restaurants.find(r => r.name === targetName);
    
    // 2-4. 실제 getRestaurantByName 메서드 실행
    const result = await service.getRestaurantByName(targetName);

    // 2-4. 예상값 == 실제값 비교
    expect(result).toEqual(expected);
  });
});

// 3. Service - 'addRestaurant()' 테스트
describe('RestaurantService - addRestaurant() 유닛 테스트', () => {
  let service: RestaurantService;

  // __dirname: 현재 service.spec.ts 파일이 위치한 곳
  const testFilePath = path.join(__dirname, 'test-data', 'restaurants.test.json');
  
  // 3-1. 변수 2개 선언: 직접 데이터 넣을 JSON 파일 (testJsonData1), addRestaurant()로 넣을 JSON 파일 (testJsonData2)
  let testJsonData1: RestaurantList;
  let testJsonData2: RestaurantList;

  // 3-2. 먼저 test용 JSON 데이터 전체 가져오기 -> testJsonData1에 저장
  beforeAll(async () => {
    const raw = await fs.promises.readFile(testFilePath, 'utf-8');
    testJsonData1 = JSON.parse(raw);
  });

  // 3-3. 매 it 테스트마다 service 객체 새로 생성하고 테스트 -> 테스트간 독립성 보장
  beforeEach(() => {
    service = new RestaurantService();
    (service as any).filePath = testFilePath;
  });

  // 3-4. '직접 넣은 데이터 == addRestaurant()로 넣은 데이터' 확인
  //      -> 'testJsonData1 == testJsonData2' 둘이 같은지 확인
  it('Test용 Json 파일에 새로운 restaurant 데이터 추가하는 기능 확인 (Service)', async() => {

    // 1) 테스트용 데이터 1개 만들기
    const testData = {
      "name": "알촌",
      "address": "경기도 수원시 당구장쪽",
      "phone": "1111-5555-9999"
    };

    // 2) 직접 데이터를 JSON 파일에 넣기 (testJsonData1)
    testJsonData1.restaurants.push(testData);

    // 3) addRestaurant()로 데이터 넣기
    await service.addRestaurant(testData); // addRestaurant()의 return값은 쓸 필요 없으므로, 아예 return값 안받기

    // 4) addRestaurant() 실행 후, 다시 JSON 파일 읽기 (∵ addRestaurant로 JSON 파일이 바뀌었으니, 다시 읽어와야함)
    const raw = await fs.promises.readFile(testFilePath, 'utf-8');
    testJsonData2 = JSON.parse(raw); // 바뀐 JSON 파일 -> testJsonData2에 저장

    // 5) 2개 JSON 파일 속 데이터가 일치하는지 확인
    expect(testJsonData2).toEqual(testJsonData1);
  });
});

// 4. Service - 'deleteRestaurant()' 테스트
describe('RestaurantService - deleteRestaurant() 유닛 테스트', () => {
  let service: RestaurantService;

  const testFilePath = path.join(__dirname, 'test-data', 'restaurants.test.json');
  
  // 4-1. 직접 데이터 삭제할 JSON 파일의 변수 선언
  let testJsonData: RestaurantList;

  // 4-2. 먼저 test용 JSON 데이터 전체 가져오기
  beforeAll(async () => {
    const raw = await fs.promises.readFile(testFilePath, 'utf-8');
    testJsonData = JSON.parse(raw);
  });

  // 4-3. 매 it 테스트마다 service 객체 새로 생성
  beforeEach(() => {
    service = new RestaurantService();
    (service as any).filePath = testFilePath;
  });

  // 4-4. '직접 삭제한 후의 JSON 데이터 == deleteRestaurant()로 삭제한 후의 JSON 데이터' 확인
  //      -> 'testJsonData에서 삭제한 후 꺼내온 데이터 == 원본 test용 JSON 파일에서 삭제한 후 꺼내온 데이터' 같은지 확인
  //      -> 'removedItem1 == removedItem2' 인지 확인
  it('Test용 Json 파일에 특정 name의 restaurant 데이터 삭제하는지 확인 (Service)', async() => {

    // 1) 테스트용 name 1개 설정
    const targetName: string = '알촌';

    // 2) 직접 데이터를 JSON 파일에서 삭제 & 삭제한 데이터 저장 (testJsonData)

      // 1.. targetName이랑 같은 이름의 데이터 인덱스 찾기
    const index: number | undefined = testJsonData.restaurants.findIndex(r => r.name === targetName)

      // 2.. testJsonData1 안에서 해당 데이터 잘라내기
    const removedItem1: Restaurant = testJsonData.restaurants.splice(index, 1)[0];

    // 3) deleteRestaurant() 사용 : 원본 test용 JSON 파일에서 해당 name의 데이터 삭제 & 삭제한 데이터 반환
    const removedItem2: Restaurant = await service.deleteRestaurant(targetName);

    // 4) 삭제한 후 반환한 2개 데이터가 일치하는지 확인
    expect(removedItem2).toEqual(removedItem1);
  });
});

// 5. Service - 'patchRestaurant()' 테스트
describe('RestaurantService - patchRestaurant() 유닛 테스트', () => {
  let service: RestaurantService;

  const testFilePath = path.join(__dirname, 'test-data', 'restaurants.test.json');

  // 5-1. 직접 데이터 수정할 JSON 파일의 변수 선언
  let testJsonData: RestaurantList;

  // 5-2. 먼저 test용 JSON 데이터 전체 가져오기
  beforeAll(async () => {
    const raw = await fs.promises.readFile(testFilePath, 'utf-8');
    testJsonData = JSON.parse(raw);
  });

  // 5-3. 매 it 테스트마다 service 객체 새로 생성
  beforeEach(() => {
    service = new RestaurantService();
    (service as any).filePath = testFilePath;
  });

  // 5-4. '직접 수정한 JSON 파일 == patchRestaurant()로 수정한 원본 test용 JSON 파일' 같은지 비교
  it('Test용 Json 파일에 특정 name의 restaurant 데이터 수정하는지 확인 (Service)', async() => {
    
    // 1) 수정할 JSON 데이터 1개 만들기
    const testData = {
      "name": "성대 밥상",
      "address": "경기도 수원시 당구장쪽",
      "phone": "1111-5555-9999",
      "rating": 4.0 // 추가된 값 (요걸로 수정할거임)
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

    // 3) patchRestaurant() 사용 : 원본 test용 JSON 파일 수정하기
    await service.patchRestaurant(testData.name, testData);

    // 4) 수정된 원본 JSON 파일 다시 읽어오기
    const raw = await fs.promises.readFile(testFilePath, 'utf-8');
    const updatedJson = JSON.parse(raw);

    // 5) '수정된 원본 JSON 파일 == testJsonData' 같은지 비교
    expect(updatedJson).toEqual(testJsonData);
  });
});