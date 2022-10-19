"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const sdk_1 = require("@directus/sdk");
const nestjs_rmq_1 = require("nestjs-rmq");
const constants_1 = require("nestjs-rmq/dist/constants");
const randomNumber = require("random-number");
const mailer_service_1 = require("../mailer/mailer.service");
let AuthService = class AuthService {
    constructor(jwtService, mailerService) {
        this.jwtService = jwtService;
        this.mailerService = mailerService;
        this.directus = new sdk_1.Directus(process.env.DIRECTUS_HOST, {
            auth: {
                staticToken: process.env.ADMIN_API_KEY,
            },
        });
    }
    login(id) {
        throw new Error('Method not implemented.');
    }
    validateUser(email, password) {
        throw new Error('Method not implemented.');
    }
    async confirm(dto) {
        const confirm_tokens = this.directus.items('confirm_tokens');
        const confirm_token = await confirm_tokens.readByQuery({
            filter: { token: dto.confirm_code },
            fields: 'id,token,payload',
        }).then(response => response.data.length ? response.data[0] : undefined);
        if (confirm_token !== undefined) {
            const users_collection = this.directus.items('users');
            const user_profiles_collection = this.directus.items('user_profiles');
            const user = await users_collection.createOne({
                password: confirm_token.payload.password,
                email: confirm_token.payload.email,
                confirmed: true,
            });
            await user_profiles_collection.createOne({
                user_id: user.id,
                full_name: confirm_token.payload.fullName,
            });
            await confirm_tokens.deleteOne(confirm_token.id);
            return { success: true };
        }
        throw new nestjs_rmq_1.RMQError('Неверный код подтверждения', constants_1.ERROR_TYPE.RMQ, 400);
    }
    async register(dto) {
        const confirm_tokens = this.directus.items('confirm_tokens');
        const users_collection = this.directus.items('users');
        const userAlreadyExist = await users_collection.readByQuery({
            filter: { email: dto.email },
            fields: 'id',
        }).then(response => response.data.length);
        if (userAlreadyExist) {
            throw new nestjs_rmq_1.RMQError('Пользователь с таким E-mail уже существует!', constants_1.ERROR_TYPE.RMQ, 400);
        }
        const createdToken = randomNumber({
            min: 100000,
            max: 999999,
            integer: true
        }).toString();
        await confirm_tokens.createOne({
            token: createdToken,
            payload: JSON.stringify(dto),
        });
        await this.mailerService.sendConfirmation(createdToken, dto.email);
        return { success: true };
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        mailer_service_1.MailerService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map