import { CreatorsService } from "./creators.service";
import { CreateCreatorDto } from "./dto/create-creator.dto";
import { LoginCreatorDto } from "./dto/login-creator.dto";
export declare class CreatorsController {
    private readonly creatorsService;
    constructor(creatorsService: CreatorsService);
    create(createCreatorDto: CreateCreatorDto): Promise<{
        id: string;
        email: string;
        verified: boolean;
        createdAt?: Date;
    }>;
    login(loginCreatorDto: LoginCreatorDto): Promise<{
        id: string;
        email: string;
        verified: boolean;
        createdAt?: Date;
    }>;
}
