import { IsNumber, IsOptional, IsString } from 'class-validator';

export class createRestaurantDto {
    @IsString() // name이 string 타입인지 확인
    name: string;

    @IsString()
    address: string;
    
    @IsString()
    phone: string;
    
    @IsOptional()
    @IsNumber()
    rating?: number;
}