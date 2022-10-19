import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { getJWTConfig } from 'src/configs/jwt.config';
import { MailerModule } from 'src/mailer/mailer.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule.registerAsync(getJWTConfig()), MailerModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
