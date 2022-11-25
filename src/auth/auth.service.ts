/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthConfirm } from 'src/contracts/auth/confirm';
import { AuthRegister } from 'src/contracts/auth/register';
import { Directus } from '@directus/sdk';
import { RMQError } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import randomNumber = require("random-number");
import { MailerService } from 'src/mailer/mailer.service';
import { Cron } from '@nestjs/schedule';
import * as _ from 'ramda';
import { AuthConfirmEmployee, AuthLogin, AuthLoginEmployee, AuthLogout, AuthLogoutEmployee, AuthRefresh, AuthRefreshEmployee, AuthRegisterEmployee } from '../contracts';
import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import parse from 'parse-duration';

const refreshTokenExpireDate = () => new Date(
  new Date().getTime() + parse(process.env.EXPIRE_REFRESH),
);

@Injectable()
export class AuthService {
  directus: any;
  constructor(
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService
  ) {
    this.directus = new Directus(process.env.DIRECTUS_HOST, {
      auth: {
        staticToken: process.env.ADMIN_API_KEY, // If you want to use a static token, otherwise check below how you can use email and password.
      },
    });
  }

  async login(
    id: number,
    ip: string,
    agent: string,
  ): Promise<AuthLogin.Response> {
    const key = await nanoid(20);
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

  async validateUser(
    email: string,
    password: string,
  ): Promise<{ id: number }> {
    const users_collection = this.directus.items('users');

    const user = await users_collection.readByQuery({
      filter: { email },
      fields: 'id,password',
    }).then(_.compose(
      _.head,
      _.path(['data'])
    ));

    if (user) {
      const confirm_password = await bcrypt.compare(password, user.password);
      if (confirm_password) {
        return user;
      }
    }

    throw new RMQError('Неверный логин или пароль пользователя', ERROR_TYPE.RMQ, 400);
  }

  async confirm(dto: AuthConfirm.Request): Promise<AuthConfirm.Response> {

    const confirm_tokens = this.directus.items('confirm_tokens');
    const confirm_token = await confirm_tokens.readByQuery({
      filter: { token: dto.confirm_code },
      fields: 'id,token,payload',
    }).then(_.compose(
      _.head,
      _.path(['data'])
    ));

    if (confirm_token !== undefined) {
      await this.validateUserBeforeRegistry(confirm_token.payload.email);
      const users_collection = this.directus.items('users');
      const user_profiles_collection = this.directus.items('user_profiles');
      const user = await users_collection.createOne({
        password: confirm_token.payload.password,
        email: confirm_token.payload.email,
        confirmed: true,
      });
      await user_profiles_collection.createOne(
        {
          user_id: user.id,
          full_name: confirm_token.payload.fullName,
        }
      );
      await confirm_tokens.deleteOne(confirm_token.id);
      return { success: true };
    }
    throw new RMQError('Неверный код подтверждения', ERROR_TYPE.RMQ, 400);
  }

  async register(dto: AuthRegister.Request): Promise<AuthRegister.Response> {
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
      payload: JSON.stringify({
        ...dto,
        password: hash,
      }),
    });

    await this.mailerService.sendConfirmation(createdToken, dto.email)

    return { success: true };
  }

  async validateUserBeforeRegistry(email: string) {
    const users_collection = this.directus.items('users');

    const userAlreadyExist = await users_collection.readByQuery({
      filter: { email },
      fields: 'id',
    }).then(response => response.data.length);

    if (userAlreadyExist) {
      throw new RMQError('Пользователь с таким E-mail уже существует!', ERROR_TYPE.RMQ, 400);
    }
  }

  @Cron('10 * * * * *')
  async deleteUnusedConfirmTokens() {
    const confirm_tokens = this.directus.items('confirm_tokens');
    const tokens_for_delete = await confirm_tokens.readByQuery({
      limit: -1,
    }).then(_.compose(
      _.filter(item => !!item),
      _.map(_.path(['id'])),
      _.filter((item) => this.validateConfirmToken(item)),
      _.path(['data']),
    ));

    await confirm_tokens.deleteMany(tokens_for_delete);
  }

  validateConfirmToken(item: any): boolean {
    const token_date = new Date(item.date_created).getTime();
    const now_date = new Date().getTime();
    return now_date - token_date > 600000;
  }

  async refresh(dto: AuthRefresh.Request): Promise<AuthRefresh.Response> {
    const refresh_tokens = this.directus.items('refresh_tokens');
    const current_refresh_token = await refresh_tokens.readByQuery({
      filter: { key: dto.key },
    }).then(_.compose(
      _.omit(['date_created', 'date_updated']),
      _.head,
      _.path(['data'])
    ));

    if (!current_refresh_token) {
      throw new RMQError('Токен не существует!', ERROR_TYPE.RMQ, 400);
    }

    const key = await nanoid(20);
    const refresh_token = await this.jwtService.sign({ id: dto.id, key }, {
      expiresIn: process.env.EXPIRE_REFRESH,
      secret: process.env.JWT_SECRET,
    });
    
    refresh_tokens.updateOne(current_refresh_token.id, {
      ...current_refresh_token,
      key,
      token: refresh_token,
      expires: refreshTokenExpireDate(),
      created_by_ip: dto.ip,
      agent: dto.agent,
    });

    const access_token = await this.jwtService.sign({ id: dto.id, rId: current_refresh_token.id }, {
      expiresIn: process.env.EXPIRE_ACCESS,
      secret: process.env.JWT_SECRET,
    });

    return {
      access_token,
      refresh_token,
    };
  }

  async logout(dto: AuthLogout.Request): Promise<AuthLogout.Response> {
    const refresh_tokens = this.directus.items('refresh_tokens');
    const current_refresh_token = await refresh_tokens.readOne(dto.rId);

    if (!current_refresh_token) {
      return {success: true};
    }

    await refresh_tokens.deleteOne(current_refresh_token.id);
    
    return {success: true};
  }

  async registerEmployee(dto: AuthRegisterEmployee.Request): Promise<AuthRegisterEmployee.Response> {
    const confirm_tokens = this.directus.items('confirm_tokens');

    await this.validateEmployeeBeforeRegistry(dto.email);

    const createdToken = randomNumber({
      min: 100000,
      max: 999999,
      integer: true
    }).toString();

    const hash = await bcrypt.hash(dto.password, 10);

    await confirm_tokens.createOne({
      token: createdToken,
      payload: JSON.stringify({
        ...dto,
        password: hash,
      }),
    });

    await this.mailerService.sendConfirmation(createdToken, dto.email)

    return { success: true };
  }

  async validateEmployeeBeforeRegistry(email: string) {
    const employees_collection = this.directus.items('employees');

    const employeeAlreadyExist = await employees_collection.readByQuery({
      filter: { email },
      fields: 'id',
    }).then(response => response.data.length);

    if (employeeAlreadyExist) {
      throw new RMQError('Пользователь с таким E-mail уже существует!', ERROR_TYPE.RMQ, 400);
    }
  }

  async confirmEmployee(dto: AuthConfirmEmployee.Request): Promise<AuthConfirmEmployee.Response> {

    const confirm_tokens = this.directus.items('confirm_tokens');
    const confirm_token = await confirm_tokens.readByQuery({
      filter: { token: dto.confirm_code },
      fields: 'id,token,payload',
    }).then(_.compose(
      _.head,
      _.path(['data'])
    ));

    if (confirm_token !== undefined) {
      await this.validateEmployeeBeforeRegistry(confirm_token.payload.email);
      const employees_collection = this.directus.items('employees');
      const employee_profiles_collection = this.directus.items('employee_profiles');
      const employee = await employees_collection.createOne({
        password: confirm_token.payload.password,
        email: confirm_token.payload.email,
        confirmed: true,
      });
      await employee_profiles_collection.createOne(
        {
          employee_id: employee.id,
          full_name: confirm_token.payload.fullName,
        }
      );
      await confirm_tokens.deleteOne(confirm_token.id);
      return { success: true };
    }
    throw new RMQError('Неверный код подтверждения', ERROR_TYPE.RMQ, 400);
  }

  async loginEmployee(
    id: number,
    ip: string,
    agent: string,
  ): Promise<AuthLoginEmployee.Response> {
    const key = await nanoid(20);
    const refresh_token = await this.jwtService.sign({ id, key }, {
      expiresIn: process.env.EXPIRE_REFRESH,
      secret: process.env.JWT_SECRET,
    });

    const refresh_tokens = this.directus.items('employee_refresh_tokens');
    const new_refresh_obj = refresh_tokens.createOne({
      employee: id,
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

  async validateEmployee(
    email: string,
    password: string,
  ): Promise<{ id: number }> {
    const employees_collection = this.directus.items('employees');

    const employee = await employees_collection.readByQuery({
      filter: { email },
      fields: 'id,password',
    }).then(_.compose(
      _.head,
      _.path(['data'])
    ));

    if (employee) {
      const confirm_password = await bcrypt.compare(password, employee.password);
      if (confirm_password) {
        return employee;
      }
    }

    throw new RMQError('Неверный логин или пароль сотрудника', ERROR_TYPE.RMQ, 400);
  }

  async refreshEmployee(dto: AuthRefreshEmployee.Request): Promise<AuthRefreshEmployee.Response> {
    const refresh_tokens = this.directus.items('employee_refresh_tokens');
    const current_refresh_token = await refresh_tokens.readByQuery({
      filter: { key: dto.key },
    }).then(_.compose(
      _.omit(['date_created', 'date_updated']),
      _.head,
      _.path(['data'])
    ));

    if (!current_refresh_token) {
      throw new RMQError('Токен не существует!', ERROR_TYPE.RMQ, 400);
    }

    const key = await nanoid(20);
    const refresh_token = await this.jwtService.sign({ id: dto.id, key }, {
      expiresIn: process.env.EXPIRE_REFRESH,
      secret: process.env.JWT_SECRET,
    });
    
    refresh_tokens.updateOne(current_refresh_token.id, {
      ...current_refresh_token,
      key,
      token: refresh_token,
      expires: refreshTokenExpireDate(),
      created_by_ip: dto.ip,
      agent: dto.agent,
    });

    const access_token = await this.jwtService.sign({ id: dto.id, rId: current_refresh_token.id }, {
      expiresIn: process.env.EXPIRE_ACCESS,
      secret: process.env.JWT_SECRET,
    });

    return {
      access_token,
      refresh_token,
    };
  }

  async logoutEmployee(dto: AuthLogoutEmployee.Request): Promise<AuthLogoutEmployee.Response> {
    const refresh_tokens = this.directus.items('employee_refresh_tokens');
    const current_refresh_token = await refresh_tokens.readOne(dto.rId);

    if (!current_refresh_token) {
      return {success: true};
    }

    await refresh_tokens.deleteOne(current_refresh_token.id);
    
    return {success: true};
  }
}

