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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const contracts_1 = require("../contracts");
const contracts_2 = require("../contracts");
const contracts_3 = require("../contracts");
const nestjs_rmq_1 = require("nestjs-rmq");
const loginEmployee_1 = require("../contracts/auth/loginEmployee");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async register(dto) {
        return this.authService.register(dto);
    }
    async confirm(dto) {
        return this.authService.confirm(dto);
    }
    async login(dto) {
        const { id } = await this.authService.validateUser(dto.email, dto.password);
        return this.authService.login(id, dto.ip, dto.agent);
    }
    async refresh(dto) {
        return this.authService.refresh(dto);
    }
    async logout(dto) {
        return this.authService.logout(dto);
    }
    async registerEmployee(dto) {
        return this.authService.registerEmployee(dto);
    }
    async confirmEmployee(dto) {
        return this.authService.confirmEmployee(dto);
    }
    async loginEmployee(dto) {
        const { id } = await this.authService.validateEmployee(dto.email, dto.password);
        return this.authService.loginEmployee(id, dto.ip, dto.agent);
    }
    async refreshEmployee(dto) {
        return this.authService.refreshEmployee(dto);
    }
    async logoutEmployee(dto) {
        return this.authService.logoutEmployee(dto);
    }
};
__decorate([
    (0, nestjs_rmq_1.RMQRoute)(contracts_2.AuthRegister.topic),
    (0, nestjs_rmq_1.RMQValidate)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contracts_2.AuthRegister.Request]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, nestjs_rmq_1.RMQRoute)(contracts_3.AuthConfirm.topic),
    (0, nestjs_rmq_1.RMQValidate)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contracts_3.AuthConfirm.Request]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "confirm", null);
__decorate([
    (0, nestjs_rmq_1.RMQRoute)(contracts_1.AuthLogin.topic),
    (0, nestjs_rmq_1.RMQValidate)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contracts_1.AuthLogin.Request]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, nestjs_rmq_1.RMQRoute)(contracts_1.AuthRefresh.topic),
    (0, nestjs_rmq_1.RMQValidate)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contracts_1.AuthRefresh.Request]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, nestjs_rmq_1.RMQRoute)(contracts_1.AuthLogout.topic),
    (0, nestjs_rmq_1.RMQValidate)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contracts_1.AuthLogout.Request]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, nestjs_rmq_1.RMQRoute)(contracts_1.AuthRegisterEmployee.topic),
    (0, nestjs_rmq_1.RMQValidate)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contracts_1.AuthRegisterEmployee.Request]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerEmployee", null);
__decorate([
    (0, nestjs_rmq_1.RMQRoute)(contracts_1.AuthConfirmEmployee.topic),
    (0, nestjs_rmq_1.RMQValidate)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contracts_1.AuthConfirmEmployee.Request]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "confirmEmployee", null);
__decorate([
    (0, nestjs_rmq_1.RMQRoute)(loginEmployee_1.AuthLoginEmployee.topic),
    (0, nestjs_rmq_1.RMQValidate)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [loginEmployee_1.AuthLoginEmployee.Request]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginEmployee", null);
__decorate([
    (0, nestjs_rmq_1.RMQRoute)(contracts_1.AuthRefreshEmployee.topic),
    (0, nestjs_rmq_1.RMQValidate)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contracts_1.AuthRefreshEmployee.Request]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshEmployee", null);
__decorate([
    (0, nestjs_rmq_1.RMQRoute)(contracts_1.AuthLogoutEmployee.topic),
    (0, nestjs_rmq_1.RMQValidate)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contracts_1.AuthLogoutEmployee.Request]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logoutEmployee", null);
AuthController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map