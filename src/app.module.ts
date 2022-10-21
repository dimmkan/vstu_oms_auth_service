import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { RMQModule } from 'nestjs-rmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { getJWTConfig } from './configs/jwt.config';
import { getRMQConfig } from './configs/rmq.config';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    RMQModule.forRootAsync(getRMQConfig()),
    JwtModule.registerAsync(getJWTConfig()),
    MailerModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
