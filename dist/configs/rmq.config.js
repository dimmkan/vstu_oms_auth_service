"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRMQConfig = void 0;
const config_1 = require("@nestjs/config");
const getRMQConfig = () => ({
    inject: [config_1.ConfigService],
    imports: [config_1.ConfigModule],
    useFactory: () => {
        var _a, _b, _c, _d;
        return ({
            exchangeName: (_a = process.env.AMQP_EXCHANGE) !== null && _a !== void 0 ? _a : '',
            connections: [
                {
                    login: (_b = process.env.AMQP_USER) !== null && _b !== void 0 ? _b : '',
                    password: (_c = process.env.AMQP_PASSWORD) !== null && _c !== void 0 ? _c : '',
                    host: (_d = process.env.AMQP_HOST) !== null && _d !== void 0 ? _d : '',
                },
            ],
            queueName: process.env.AMQP_QUEUE,
            prefetchCount: 32,
            serviceName: 'auth-service',
        });
    },
});
exports.getRMQConfig = getRMQConfig;
//# sourceMappingURL=rmq.config.js.map