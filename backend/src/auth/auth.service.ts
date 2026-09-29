import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { toPublicUser } from '../users/user.entity';
import { UsersService } from '../users/users.service';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(email: string, password: string, name: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.usersService.create(email, passwordHash, name);
    return this.buildAuthResponse(user);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: Awaited<ReturnType<UsersService['create']>>) {
    return {
      access_token: this.jwtService.sign({ sub: user.id, email: user.email }),
      user: toPublicUser(user),
    };
  }
}
