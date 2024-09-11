import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class ReportDto {
    @IsString()
    @IsNotEmpty()
    endpoint: string

    @IsArray()
    @IsNotEmpty()
    headers: string[]
}