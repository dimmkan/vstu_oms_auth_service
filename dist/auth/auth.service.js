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
const schedule_1 = require("@nestjs/schedule");
const _ = require("ramda");
const bcrypt = require("bcrypt");
const nanoid_1 = require("nanoid");
const parse_duration_1 = require("parse-duration");
const refreshTokenExpireDate = () => new Date(new Date().getTime() + (0, parse_duration_1.default)(process.env.EXPIRE_REFRESH));
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
    async login(id, ip, agent) {
        const key = await (0, nanoid_1.nanoid)(20);
        const refresh_token = await this.jwtService.sign({ id, key }, {
            expiresIn: process.env.EXPIRE_REFRESH,
            secret: process.env.JWT_SECRET,
        });
        const refresh_tokens = this.directus.items('refresh_tokens');
        const new_refresh_obj = refresh_tokens.createOne({
            user: id,
            key,
            token: refresh_token,
            expires: refreshTokenExpireDate(),
            created_by_ip: ip,
            agent,
        });
        const access_token = await this.jwtService.sign({ id, rId: new_refresh_obj.id }, {
            expiresIn: process.env.EXPIRE_ACCESS,
            secret: process.env.JWT_SECRET,
        });
        return {
            access_token: access_token,
            refresh_token: refresh_token,
        };
    }
    async validateUser(email, password) {
        const users_collection = this.directus.items('users');
        const user = await users_collection.readByQuery({
            filter: { email },
            fields: 'id,password',
        }).then(_.compose(_.head, _.path(['data'])));
        if (user) {
            const confirm_password = await bcrypt.compare(password, user.password);
            if (confirm_password) {
                return user;
            }
        }
        throw new nestjs_rmq_1.RMQError('Неверный логин или пароль пользователя', constants_1.ERROR_TYPE.RMQ, 400);
    }
    async confirm(dto) {
        const confirm_tokens = this.directus.items('confirm_tokens');
        const confirm_token = await confirm_tokens.readByQuery({
            filter: { token: dto.confirm_code },
            fields: 'id,token,payload',
        }).then(_.compose(_.head, _.path(['data'])));
        if (confirm_token !== undefined) {
            await this.validateUserBeforeRegistry(confirm_token.email);
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
        await this.validateUserBeforeRegistry(dto.email);
        const createdToken = randomNumber({
            min: 100000,
            max: 999999,
            integer: true
        }).toString();
        const hash = await bcrypt.hash(dto.password, 10);
        await confirm_tokens.createOne({
            token: createdToken,
            payload: JSON.stringify(Object.assign(Object.assign({}, dto), { password: hash })),
        });
        await this.mailerService.sendConfirmation(createdToken, dto.email);
        return { success: true };
    }
    async validateUserBeforeRegistry(email) {
        const users_collection = this.directus.items('users');
        const userAlreadyExist = await users_collection.readByQuery({
            filter: { email },
            fields: 'id',
        }).then(response => response.data.length);
        if (userAlreadyExist) {
            throw new nestjs_rmq_1.RMQError('Пользователь с таким E-mail уже существует!', constants_1.ERROR_TYPE.RMQ, 400);
        }
    }
    async deleteUnusedConfirmTokens() {
        const confirm_tokens = this.directus.items('confirm_tokens');
        const tokens_for_delete = await confirm_tokens.readByQuery({
            limit: -1,
        }).then(_.compose(_.filter(item => !!item), _.map(_.path(['id'])), _.filter((item) => this.validateConfirmToken(item)), _.path(['data'])));
        await confirm_tokens.deleteMany(tokens_for_delete);
    }
    validateConfirmToken(item) {
        const token_date = new Date(item.date_created).getTime();
        const now_date = new Date().getTime();
        return now_date - token_date > 300000;
    }
    async refresh(dto) {
        const refresh_tokens = this.directus.items('refresh_tokens');
        const current_refresh_token = await refresh_tokens.readByQuery({
            filter: { key: dto.key },
        }).then(_.compose(_.omit(['date_created', 'date_updated']), _.head, _.path(['data'])));
        if (!current_refresh_token) {
            throw new nestjs_rmq_1.RMQError('Токен не существует!', constants_1.ERROR_TYPE.RMQ, 400);
        }
        const key = await (0, nanoid_1.nanoid)(20);
        const refresh_token = await this.jwtService.sign({ id: dto.id, key }, {
            expiresIn: process.env.EXPIRE_REFRESH,
            secret: process.env.JWT_SECRET,
        });
        refresh_tokens.updateOne(current_refresh_token.id, Object.assign(Object.assign({}, current_refresh_token), { key, token: refresh_token, expires: refreshTokenExpireDate(), created_by_ip: dto.ip, agent: dto.agent }));
        const access_token = await this.jwtService.sign({ id: dto.id, rId: current_refresh_token.id }, {
            expiresIn: process.env.EXPIRE_ACCESS,
            secret: process.env.JWT_SECRET,
        });
        return {
            access_token,
            refresh_token,
        };
    }
    async logout(dto) {
        const refresh_tokens = this.directus.items('refresh_tokens');
        const current_refresh_token = await refresh_tokens.readOne(dto.rId);
        if (!current_refresh_token) {
            return { success: true };
        }
        await refresh_tokens.deleteOne(current_refresh_token.id);
        return { success: true };
    }
};
__decorate([
    (0, schedule_1.Cron)('5 * * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "deleteUnusedConfirmTokens", null);
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        mailer_service_1.MailerService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map