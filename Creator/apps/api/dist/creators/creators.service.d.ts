import { PrismaService } from "../prisma/prisma.service";
import { CreateCreatorDto } from "./dto/create-creator.dto";
import { LoginCreatorDto } from "./dto/login-creator.dto";
type CreatorResponse = {
    id: string;
    email: string;
    verified: boolean;
    createdAt?: Date;
};
export declare class CreatorsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(payload: CreateCreatorDto): Promise<CreatorResponse>;
    login(payload: LoginCreatorDto): Promise<CreatorResponse>;
    private toCreatorResponse;
}
export {};
