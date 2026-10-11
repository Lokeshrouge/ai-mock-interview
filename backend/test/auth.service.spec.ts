import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { User, UserRole } from '../src/database/entities/user.entity';
import { StudentProfile } from '../src/database/entities/student-profile.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepo: any;
  let mockProfileRepo: any;
  let mockJwtService: any;

  const usersStore = new Map<string, any>();
  const profilesStore = new Map<string, any>();

  beforeEach(async () => {
    usersStore.clear();
    profilesStore.clear();

    mockUserRepo = {
      findOne: jest.fn(async ({ where }) => {
        if (where?.email) {
          for (const u of usersStore.values()) {
            if (u.email === where.email) return u;
          }
        }
        if (where?.id) {
          return usersStore.get(where.id) || null;
        }
        return null;
      }),
      create: jest.fn((dto) => ({
        id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        failedLoginAttempts: 0,
        lockedUntil: null,
        ...dto,
      })),
      save: jest.fn(async (user) => {
        usersStore.set(user.id, user);
        return user;
      }),
    };

    mockProfileRepo = {
      create: jest.fn((dto) => ({
        id: `prof-${Date.now()}`,
        ...dto,
      })),
      save: jest.fn(async (profile) => {
        profilesStore.set(profile.userId, profile);
        return profile;
      }),
    };

    mockJwtService = {
      sign: jest.fn((payload) => `mock_token_for_${payload.sub}`),
      verify: jest.fn((token) => ({ sub: 'usr-1', email: 'test@example.com', role: UserRole.STUDENT })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: getRepositoryToken(StudentProfile),
          useValue: mockProfileRepo,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should successfully register a new user and return tokens and profile', async () => {
      const registerDto = {
        email: 'NewCandidate@example.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      const result = await authService.register(registerDto);

      expect(result).toBeDefined();
      expect(result.email).toBe('newcandidate@example.com');
      expect(result.role).toBe(UserRole.STUDENT);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.userId).toBeDefined();

      // Verify user was stored with hashed password, not plaintext
      const storedUser = usersStore.get(result.userId);
      expect(storedUser).toBeDefined();
      expect(storedUser.email).toBe('newcandidate@example.com');
      expect(storedUser.passwordHash).not.toBe(registerDto.password);
      expect(await bcrypt.compare(registerDto.password, storedUser.passwordHash)).toBe(true);

      // Verify profile was created with user ID
      const storedProfile = profilesStore.get(result.userId);
      expect(storedProfile).toBeDefined();
      expect(storedProfile.firstName).toBe('Jane');
      expect(storedProfile.lastName).toBe('Doe');
    });

    it('should throw ConflictException when email is already registered', async () => {
      const registerDto = {
        email: 'duplicate@example.com',
        password: 'Password123!',
        firstName: 'First',
        lastName: 'User',
      };

      await authService.register(registerDto);

      // Attempt to register again with same email
      await expect(
        authService.register({
          email: 'duplicate@example.com',
          password: 'AnotherPassword456!',
          firstName: 'Second',
          lastName: 'User',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException for case-insensitive duplicate email', async () => {
      await authService.register({
        email: 'student@example.com',
        password: 'Password123!',
        firstName: 'Case',
        lastName: 'One',
      });

      await expect(
        authService.register({
          email: 'STUDENT@EXAMPLE.COM',
          password: 'Password123!',
          firstName: 'Case',
          lastName: 'Two',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authService.register({
        email: 'login.test@example.com',
        password: 'SecurePassword123!',
        firstName: 'Test',
        lastName: 'Student',
      });
    });

    it('should successfully log in with valid credentials', async () => {
      const result = await authService.login({
        email: 'login.test@example.com',
        password: 'SecurePassword123!',
      });

      expect(result).toBeDefined();
      expect(result.email).toBe('login.test@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should successfully log in with case-insensitive email', async () => {
      const result = await authService.login({
        email: 'LOGIN.TEST@EXAMPLE.COM',
        password: 'SecurePassword123!',
      });

      expect(result).toBeDefined();
      expect(result.email).toBe('login.test@example.com');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      await expect(
        authService.login({
          email: 'login.test@example.com',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for nonexistent email', async () => {
      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'SecurePassword123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
