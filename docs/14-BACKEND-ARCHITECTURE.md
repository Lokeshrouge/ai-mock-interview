# Backend Architecture

## Document Information
**Project:** AI-Powered Mock Interview System  
**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** B.Sc. Final Year Project Team

---

## 1. Introduction

This document defines the backend architecture for the AI-Powered Mock Interview System, built with NestJS, TypeORM, and PostgreSQL. The architecture follows SOLID principles, modular design, and separation of concerns to create a maintainable, scalable, and testable system.

The backend serves as the orchestration layer between the frontend, database, and AI service, handling authentication, business logic, data persistence, and external API integration.

---

## 2. Technology Stack

### 2.1 Core Framework

**NestJS 10.x**
- TypeScript-based Node.js framework
- Modular architecture with dependency injection
- Built-in support for decorators and metadata
- Express-based HTTP server (default)
- CLI for code generation

**Node.js 20.x LTS**
- Long-term support version
- Native ESM support
- Enhanced performance and security

### 2.2 Database and ORM

**PostgreSQL 16**
- Relational database with ACID compliance
- JSON/JSONB support for flexible schemas
- Advanced indexing and query optimization
- Row-level security (future enhancement)

**TypeORM 0.3.x**
- TypeScript ORM with decorator-based entities
- Migration system for schema versioning
- Repository pattern for data access
- Connection pooling and query builder

### 2.3 Authentication

**JWT (JSON Web Tokens)**
- Access tokens: 15-minute expiration
- Refresh tokens: 7-day expiration
- RS256 algorithm with public/private key pair
- httpOnly cookies for refresh token storage

**Passport.js**
- JWT strategy for access token validation
- Local strategy for username/password authentication
- Extensible for OAuth providers (future)

**bcrypt**
- Password hashing with cost factor 12
- Secure salt generation

### 2.4 Validation and Documentation

**class-validator & class-transformer**
- Decorator-based DTO validation
- Automatic type transformation
- Custom validation rules

**Swagger / OpenAPI**
- Auto-generated API documentation
- Interactive API explorer
- Schema export for frontend type generation

### 2.5 Background Jobs

**@nestjs/schedule**
- Cron job scheduling
- Interval-based tasks
- Timeout-based tasks

**Bull (Future Enhancement)**
- Redis-backed job queue
- Retry logic and job prioritization
- For heavy operations (report generation, email sending)

---

## 3. Modular Architecture

### 3.1 Module Structure

NestJS applications are organized into modules, each encapsulating related functionality.

**AppModule (Root):**
```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // Use migrations in production
        logging: config.get('NODE_ENV') === 'development',
        poolSize: 10,
      }),
    }),
    ScheduleModule.forRoot(),
    
    // Feature modules
    AuthModule,
    UsersModule,
    InterviewsModule,
    QuestionsModule,
    AnswersModule,
    ReportsModule,
    AIProxyModule,
    FilesModule,
    AdminModule,
  ],
})
export class AppModule {}
```

### 3.2 Feature Modules

Each feature module follows a consistent structure:
- **Controller:** HTTP endpoint handlers
- **Service:** Business logic
- **Repository:** Data access (TypeORM)
- **Entity:** Database model
- **DTOs:** Data transfer objects (request/response schemas)
- **Guards:** Authorization and access control
- **Decorators:** Custom decorators for metadata

---

## 4. AuthModule - Detailed Architecture

### 4.1 Module Definition

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
```

### 4.2 AuthController

**Endpoints:**
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout

```typescript
@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(dto);
    
    // Set refresh token in httpOnly cookie
    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return user and access token (not refresh token)
    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('login')
  @UseGuards(LocalAuthGuard) // Validates credentials
  @ApiOperation({ summary: 'Login with email and password' })
  async login(
    @Request() req,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(req.user);
    
    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refreshToken'];
    
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const result = await this.authService.refresh(refreshToken);
    
    // Rotate refresh token
    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: result.accessToken,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout and invalidate tokens' })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refreshToken'];
    
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // Clear cookie
    response.clearCookie('refreshToken');

    return { message: 'Logged out successfully' };
  }
}
```

### 4.3 AuthService

**Business Logic:**

```typescript
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokensRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if email exists
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Create user
    const user = this.usersRepository.create({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: 'USER',
    });

    await this.usersRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Save refresh token
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'role'],
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(user: User) {
    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    // Verify token
    let payload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token exists in database
    const tokenRecord = await this.refreshTokensRepository.findOne({
      where: { token: refreshToken, userId: payload.sub },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // Check expiration
    if (tokenRecord.expiresAt < new Date()) {
      await this.refreshTokensRepository.remove(tokenRecord);
      throw new UnauthorizedException('Refresh token expired');
    }

    // Get user
    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user);

    // Invalidate old refresh token and save new one
    await this.refreshTokensRepository.remove(tokenRecord);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(refreshToken: string) {
    const tokenRecord = await this.refreshTokensRepository.findOne({
      where: { token: refreshToken },
    });

    if (tokenRecord) {
      await this.refreshTokensRepository.remove(tokenRecord);
    }
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_SECRET,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const refreshToken = this.refreshTokensRepository.create({
      userId,
      token,
      expiresAt,
    });

    await this.refreshTokensRepository.save(refreshToken);
  }

  private sanitizeUser(user: User) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}
```

### 4.4 JWT Strategy

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Payload contains { sub: userId, email, role }
    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user; // Attached to request.user
  }
}
```

### 4.5 Guards

**JwtAuthGuard:**
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
```

**RolesGuard:**
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true; // No role requirement
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.includes(user.role);
  }
}
```

**Usage:**
```typescript
@Get('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
async getUsers() {
  // Only accessible by ADMIN role
}
```

---

## 5. InterviewsModule - Detailed Architecture

### 5.1 Module Definition

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Interview, Question, Answer]),
    AIProxyModule,
  ],
  controllers: [InterviewsController],
  providers: [InterviewsService, InterviewOwnershipGuard],
  exports: [InterviewsService],
})
export class InterviewsModule {}
```

### 5.2 Interview Entity

```typescript
@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 20 })
  type: 'HR' | 'TECHNICAL' | 'PROJECT';

  @Column({ name: 'job_title', type: 'varchar', length: 100 })
  jobTitle: string;

  @Column({ type: 'jsonb' })
  skills: string[];

  @Column({ type: 'varchar', length: 20 })
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

  @Column({ name: 'question_count', type: 'int' })
  questionCount: number;

  @Column({ type: 'varchar', length: 20, default: 'CREATED' })
  status: 'CREATED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'ABANDONED' | 'EXPIRED';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'paused_at', type: 'timestamp', nullable: true })
  pausedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'abandoned_at', type: 'timestamp', nullable: true })
  abandonedAt: Date | null;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'current_question_index', type: 'int', default: 0 })
  currentQuestionIndex: number;

  @Column({ name: 'answered_count', type: 'int', default: 0 })
  answeredCount: number;

  @Column({ name: 'total_questions', type: 'int' })
  totalQuestions: number;

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds: number | null;

  @Column({ name: 'report_generated', type: 'boolean', default: false })
  reportGenerated: boolean;

  @OneToMany(() => Question, (question) => question.interview, { cascade: true })
  questions: Question[];

  @OneToMany(() => Answer, (answer) => answer.interview, { cascade: true })
  answers: Answer[];

  @Index()
  @Column({ name: 'user_id' })
  userIdIndex: string;

  @Index()
  @Column({ name: 'status' })
  statusIndex: string;

  @Index()
  @Column({ name: 'expires_at' })
  expiresAtIndex: Date;
}
```

### 5.3 InterviewsController

```typescript
@Controller('interviews')
@ApiTags('interviews')
@UseGuards(JwtAuthGuard)
export class InterviewsController {
  constructor(private interviewsService: InterviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new interview' })
  async create(@Request() req, @Body() dto: CreateInterviewDto) {
    return this.interviewsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List user interviews' })
  async list(@Request() req, @Query() query: ListInterviewsQueryDto) {
    return this.interviewsService.listForUser(req.user.id, query);
  }

  @Get(':id')
  @UseGuards(InterviewOwnershipGuard)
  @ApiOperation({ summary: 'Get interview details' })
  async get(@Param('id') id: string) {
    return this.interviewsService.findOne(id);
  }

  @Put(':id/start')
  @UseGuards(InterviewOwnershipGuard, InterviewStatusGuard)
  @RequireStatuses(['CREATED'])
  @ApiOperation({ summary: 'Start interview and generate questions' })
  async start(@Param('id') id: string) {
    return this.interviewsService.startInterview(id);
  }

  @Put(':id/pause')
  @UseGuards(InterviewOwnershipGuard, InterviewStatusGuard)
  @RequireStatuses(['IN_PROGRESS'])
  @ApiOperation({ summary: 'Pause interview' })
  async pause(@Param('id') id: string) {
    return this.interviewsService.pauseInterview(id);
  }

  @Put(':id/resume')
  @UseGuards(InterviewOwnershipGuard, InterviewStatusGuard)
  @RequireStatuses(['PAUSED'])
  @ApiOperation({ summary: 'Resume interview' })
  async resume(@Param('id') id: string) {
    return this.interviewsService.resumeInterview(id);
  }

  @Put(':id/end')
  @UseGuards(InterviewOwnershipGuard, InterviewStatusGuard)
  @RequireStatuses(['IN_PROGRESS', 'PAUSED'])
  @ApiOperation({ summary: 'End interview' })
  async end(@Param('id') id: string) {
    return this.interviewsService.endInterview(id);
  }

  @Get(':id/questions')
  @UseGuards(InterviewOwnershipGuard)
  @ApiOperation({ summary: 'Get interview questions' })
  async getQuestions(@Param('id') id: string) {
    return this.interviewsService.getQuestions(id);
  }

  @Get(':id/report')
  @UseGuards(InterviewOwnershipGuard)
  @ApiOperation({ summary: 'Get interview report' })
  async getReport(@Param('id') id: string) {
    return this.interviewsService.getReport(id);
  }
}
```

### 5.4 InterviewsService

```typescript
@Injectable()
export class InterviewsService {
  constructor(
    @InjectRepository(Interview)
    private interviewsRepository: Repository<Interview>,
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    private aiProxyService: AIProxyService,
  ) {}

  async create(userId: string, dto: CreateInterviewDto): Promise<Interview> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

    const interview = this.interviewsRepository.create({
      userId,
      type: dto.type,
      jobTitle: dto.jobTitle,
      skills: dto.skills,
      difficulty: dto.difficulty,
      questionCount: dto.questionCount,
      totalQuestions: dto.questionCount,
      expiresAt,
      status: 'CREATED',
    });

    return this.interviewsRepository.save(interview);
  }

  async listForUser(userId: string, query: ListInterviewsQueryDto) {
    const { page = 1, limit = 20, status, type, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const queryBuilder = this.interviewsRepository
      .createQueryBuilder('interview')
      .where('interview.userId = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('interview.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('interview.type = :type', { type });
    }

    queryBuilder
      .orderBy(`interview.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async startInterview(id: string): Promise<Interview> {
    const interview = await this.interviewsRepository.findOne({
      where: { id },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    // Check expiration
    if (interview.expiresAt < new Date()) {
      throw new GoneException('Interview has expired');
    }

    // Generate questions via AI service
    const generatedQuestions = await this.aiProxyService.generateQuestions({
      interviewType: interview.type,
      jobTitle: interview.jobTitle,
      skills: interview.skills,
      difficulty: interview.difficulty,
      questionCount: interview.questionCount,
    });

    // Use transaction for atomicity
    return this.interviewsRepository.manager.transaction(async (manager) => {
      // Save questions
      const questions = generatedQuestions.questions.map((q, index) => {
        const question = new Question();
        question.interviewId = interview.id;
        question.orderIndex = index;
        question.text = q.text;
        question.topic = q.topic;
        question.difficulty = q.difficulty;
        question.expectedAnswerLength = q.expected_answer_length;
        question.evaluationCriteria = q.evaluation_criteria;
        return question;
      });

      await manager.save(Question, questions);

      // Update interview status
      interview.status = 'IN_PROGRESS';
      interview.startedAt = new Date();
      await manager.save(Interview, interview);

      return interview;
    });
  }

  async pauseInterview(id: string): Promise<Interview> {
    const interview = await this.interviewsRepository.findOne({
      where: { id },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    interview.status = 'PAUSED';
    interview.pausedAt = new Date();

    return this.interviewsRepository.save(interview);
  }

  async endInterview(id: string): Promise<Interview> {
    const interview = await this.interviewsRepository.findOne({
      where: { id },
      relations: ['answers'],
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    interview.status = 'COMPLETED';
    interview.completedAt = new Date();

    if (interview.startedAt) {
      const durationMs = interview.completedAt.getTime() - interview.startedAt.getTime();
      interview.durationSeconds = Math.floor(durationMs / 1000);
    }

    await this.interviewsRepository.save(interview);

    // Trigger report generation asynchronously
    this.generateReportAsync(id).catch((error) => {
      console.error(`Failed to generate report for interview ${id}:`, error);
    });

    return interview;
  }

  private async generateReportAsync(interviewId: string) {
    // Implementation in ReportsModule
    // Calls AI service to summarize session
  }
}
```

---

## 6. AIProxyModule

### 6.1 Purpose

Thin HTTP client that proxies requests to the Python AI service, transforming request/response formats between NestJS and FastAPI.

### 6.2 AIProxyService

```typescript
@Injectable()
export class AIProxyService {
  private httpService: HttpService;
  private aiServiceUrl: string;

  constructor(
    private configService: ConfigService,
    httpService: HttpService,
  ) {
    this.httpService = httpService;
    this.aiServiceUrl = this.configService.get('AI_SERVICE_URL');
  }

  async generateQuestions(request: GenerateQuestionsRequest): Promise<GenerateQuestionsResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/generate-questions`, {
          interview_type: request.interviewType,
          job_title: request.jobTitle,
          skills: request.skills,
          difficulty: request.difficulty,
          question_count: request.questionCount,
          resume_text: request.resumeText || null,
        }, {
          timeout: 30000, // 30 seconds
        }),
      );

      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new ServiceUnavailableException('AI service timeout');
      }
      
      if (error.response?.status === 502) {
        throw new BadGatewayException('AI service returned invalid response');
      }

      throw new ServiceUnavailableException('AI service unavailable');
    }
  }

  async evaluateAnswer(request: EvaluateAnswerRequest): Promise<EvaluateAnswerResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/evaluate-answer`, {
          question_text: request.questionText,
          question_topic: request.questionTopic,
          difficulty: request.difficulty,
          evaluation_criteria: request.evaluationCriteria,
          answer_text: request.answerText,
          context: request.context || null,
        }, {
          timeout: 30000,
        }),
      );

      return response.data;
    } catch (error) {
      // Similar error handling
      throw new ServiceUnavailableException('AI service unavailable');
    }
  }

  async summariseSession(request: SummariseSessionRequest): Promise<SummariseSessionResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/summarise-session`, request, {
          timeout: 45000, // 45 seconds (longer for summarization)
        }),
      );

      return response.data;
    } catch (error) {
      throw new ServiceUnavailableException('AI service unavailable');
    }
  }
}
```

---

## 7. Middleware and Global Filters

### 7.1 LoggerMiddleware

```typescript
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;

      this.logger.log(`${method} ${originalUrl} ${statusCode} ${duration}ms`);
    });

    next();
  }
}
```

**Apply in AppModule:**
```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
```

### 7.2 Global ValidationPipe

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Strip properties not in DTO
    forbidNonWhitelisted: true, // Throw error on extra properties
    transform: true, // Auto-transform to DTO class instances
    transformOptions: {
      enableImplicitConversion: true, // Auto-convert types
    },
  }),
);
```

### 7.3 Global Exception Filter

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || error;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

**Apply:**
```typescript
app.useGlobalFilters(new AllExceptionsFilter());
```

---

## 8. Configuration Management

### 8.1 Environment Variables

**.env file:**
```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ai_mock_interview

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-change-in-production

# AI Service
AI_SERVICE_URL=http://localhost:8000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DEST=./uploads

# Rate Limiting
THROTTLE_TTL=900000
THROTTLE_LIMIT=100
```

### 8.2 Validation Schema

```typescript
import * as Joi from 'joi';

ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
    PORT: Joi.number().default(3000),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(5432),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_REFRESH_SECRET: Joi.string().required(),
    AI_SERVICE_URL: Joi.string().uri().required(),
  }),
});
```

---

## 9. Database Migrations

### 9.1 TypeORM Configuration

**ormconfig.ts:**
```typescript
export default {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  cli: {
    migrationsDir: 'src/database/migrations',
  },
  synchronize: false, // Never true in production
  logging: process.env.NODE_ENV === 'development',
};
```

### 9.2 Example Migration

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateInterviewsTable1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'interviews',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'job_title',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'skills',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'difficulty',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'CREATED'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            columnNames: ['user_id', 'status'],
          },
          {
            columnNames: ['expires_at'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('interviews');
  }
}
```

---

## 10. Background Jobs

### 10.1 Expiration Cron Job

```typescript
@Injectable()
export class ExpirationService {
  private logger = new Logger('ExpirationService');

  constructor(
    @InjectRepository(Interview)
    private interviewsRepository: Repository<Interview>,
  ) {}

  @Cron('0 * * * *') // Every hour at :00
  async handleExpiredInterviews() {
    this.logger.log('Checking for expired interviews...');

    const expiredInterviews = await this.interviewsRepository.find({
      where: {
        status: In(['CREATED', 'IN_PROGRESS', 'PAUSED']),
        expiresAt: LessThanOrEqual(new Date()),
      },
    });

    this.logger.log(`Found ${expiredInterviews.length} expired interviews`);

    for (const interview of expiredInterviews) {
      interview.status = 'EXPIRED';
      await this.interviewsRepository.save(interview);
      
      this.logger.log(`Expired interview ${interview.id}`);
    }
  }
}
```

---

## 11. Module Dependency Diagram (ASCII)

```
                         ┌─────────────┐
                         │  AppModule  │
                         └──────┬──────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼────────┐ ┌───▼────────┐ ┌───▼─────────┐
        │  AuthModule    │ │UsersModule │ │AdminModule  │
        │  - Auth        │ │  - Users   │ │  - Stats    │
        │  - JWT         │ │  - Profile │ │  - Mgmt     │
        └────────────────┘ └────────────┘ └─────────────┘
                │
        ┌───────┴────────┬──────────────┬──────────────┐
        │                │              │              │
┌───────▼────────┐ ┌─────▼─────┐ ┌────▼────────┐ ┌───▼──────────┐
│InterviewsModule│ │QuestionsM │ │AnswersModule│ │ReportsModule │
│  - CRUD        │ │  - List   │ │  - Submit   │ │  - Generate  │
│  - State mgmt  │ │  - Get    │ │  - Evaluate │ │  - View      │
└───────┬────────┘ └───────────┘ └──────┬──────┘ └──────┬───────┘
        │                                │               │
        └────────────────┬───────────────┴───────────────┘
                         │
                  ┌──────▼──────────┐
                  │  AIProxyModule  │
                  │  - HTTP client  │
                  │  - Transform    │
                  └─────────────────┘
                         │
                         ▼
                  ┌─────────────────┐
                  │ Python AI       │
                  │ Service (ext)   │
                  │ - FastAPI       │
                  └─────────────────┘


        ┌──────────────┐
        │ FilesModule  │
        │ - Upload     │
        │ - Storage    │
        └──────────────┘
```

---

## 12. Connection Pooling

```typescript
TypeOrmModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    // ... other config
    poolSize: 10, // Maximum 10 connections
    extra: {
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 30000,
      max: 10,
    },
  }),
});
```

---

## 13. Conclusion

The backend architecture leverages NestJS's modular design and dependency injection to create a maintainable, scalable system. Key architectural highlights:

- **Modular Organization:** Clear separation of concerns with feature modules
- **Authentication:** Secure JWT-based auth with token rotation
- **State Management:** Interview state machine enforced at service level
- **AI Integration:** Abstracted AI service calls with error handling
- **Type Safety:** TypeScript strict mode with TypeORM entities
- **Validation:** Automatic DTO validation with class-validator
- **Database:** TypeORM with migrations for schema versioning
- **Background Jobs:** Scheduled tasks for cleanup and maintenance
- **Error Handling:** Global exception filter with consistent error shape
- **Configuration:** Environment-based config with validation

This architecture supports the MVP requirements while remaining extensible for future enhancements such as webhooks, real-time features, and advanced analytics.

---

**End of Document**
