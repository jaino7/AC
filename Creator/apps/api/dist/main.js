"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const shared_1 = require("@creator/shared");
async function bootstrap() {
    var _a, _b;
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: (_a = process.env.WEB_ORIGIN) !== null && _a !== void 0 ? _a : "http://localhost:3000",
        credentials: true
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
    }));
    const port = (_b = process.env.PORT) !== null && _b !== void 0 ? _b : 3001;
    await app.listen(port);
    console.log(`API running on http://localhost:${port}`);
    console.log(shared_1.SHARED_GREETING);
}
bootstrap();
//# sourceMappingURL=main.js.map