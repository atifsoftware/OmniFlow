import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a new user with hashed password (12 rounds)', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'usr-1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'CUSTOMER',
        createdAt: new Date(),
      });

      const result = await service.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
      });

      expect(result.token).toBe('mocked-jwt-token');
      expect(result.user.email).toBe('john@example.com');
      expect(prisma.user.create).toHaveBeenCalled();
      const createArgs = prisma.user.create.mock.calls[0][0];
      expect(createArgs.data.email).toBe('john@example.com');
      // Verify bcrypt hash validity
      expect(createArgs.data.password).toMatch(/^\$2[aby]\$12\$/);
    });

    it('should throw ConflictException if user already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'usr-existing', email: 'existing@example.com' });

      await expect(
        service.register({
          name: 'Jane Doe',
          email: 'existing@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should successfully login and return user and token', async () => {
      const hashedPassword = await bcrypt.hash('secret123', 12);
      prisma.user.findUnique.mockResolvedValue({
        id: 'usr-2',
        name: 'Alice',
        email: 'alice@example.com',
        password: hashedPassword,
        role: 'ADMIN',
      });

      const result = await service.login({
        email: 'alice@example.com',
        password: 'secret123',
      });

      expect(result.token).toBe('mocked-jwt-token');
      expect(result.user.email).toBe('alice@example.com');
      expect((result.user as any).password).toBeUndefined();
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      const hashedPassword = await bcrypt.hash('correctPassword', 12);
      prisma.user.findUnique.mockResolvedValue({
        id: 'usr-3',
        email: 'bob@example.com',
        password: hashedPassword,
      });

      await expect(
        service.login({
          email: 'bob@example.com',
          password: 'wrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'notfound@example.com',
          password: 'password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
