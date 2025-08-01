import { PrismaClient } from '@prisma/client';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() { // 3개 테스트용 restaurant 데이터 생성 -> Query 날리기
  // upsert : WHERE 조건 속 name이 DB에 있으면 업데이트, 없으면 새로 생성
  const restaurant1 = await prisma.restaurant.upsert({ // restaurant 테이블에, 아래 정보를 Query로 날리기
    where: { name: '봉수육' },
    update: {},
    create: {
      name: '봉수육',
      address: '경기 수원시 장안구 율전로108번길 11 1층',
      phone: '0507-1460-0903',
    },
  });

  const restaurant2 = await prisma.restaurant.upsert({
    where: { name: '생각나는 순대' },
    update: {},
    create: {
      name: '생각나는 순대',
      address: '경기 수원시 쪽문쪽 어쩌고',
      phone: '1111-1111-1111',
      rating: 3.5,
    },
  });

  const restaurant3 = await prisma.restaurant.upsert({
    where: { name: '성대 밥상'},
    update: {},
    create: {
      name: '성대 밥상',
      address: '경기 수원시 쪽문쪽 어쩌고',
      phone: '5555-6666-7777',
    },
  });

  console.log({ restaurant1, restaurant2, restaurant3 });
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });