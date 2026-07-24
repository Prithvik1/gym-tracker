import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('signed-token') },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    usersService = module.get(UsersService);
  });

  describe('signup', () => {
    it('rejects an email that is already registered', async () => {
      usersService.findByEmail.mockResolvedValue({ id: '1' } as User);

      await expect(
        authService.signup('taken@example.com', 'password123', 'Test'),
      ).rejects.toThrow(ConflictException);
    });

    it('hashes the password before storing the user', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockImplementation(
        async (email, passwordHash, name) =>
          ({ id: '1', email, password_hash: passwordHash, name }) as User,
      );

      const result = await authService.signup(
        'new@example.com',
        'password123',
        'Test',
      );

      const [, storedHash] = usersService.create.mock.calls[0];
      expect(storedHash).not.toBe('password123');
      expect(await bcrypt.compare('password123', storedHash)).toBe(true);
      expect(result.access_token).toBe('signed-token');
      expect(result.user).not.toHaveProperty('password_hash');
    });
  });

  describe('login', () => {
    it('rejects an unknown email', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login('missing@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects an incorrect password', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: '1',
        email: 'user@example.com',
        password_hash: await bcrypt.hash('correct-password', 10),
      } as User);

      await expect(
        authService.login('user@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('accepts a correct password and returns a token', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: '1',
        email: 'user@example.com',
        password_hash: await bcrypt.hash('correct-password', 10),
      } as User);

      const result = await authService.login(
        'user@example.com',
        'correct-password',
      );

      expect(result.access_token).toBe('signed-token');
    });
  });
});
