import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
