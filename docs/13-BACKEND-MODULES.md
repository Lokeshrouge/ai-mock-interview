# Backend Modules Architecture

## NestJS Modules

### 1. AuthModule
**Responsibility**: Authentication and authorization  
**Controllers**: AuthController  
**Services**: AuthService  
**Entities**: None (uses UsersModule)  
**Key Features**:
- User registration
- Login with JWT
- Token refresh
- Password hashing (bcrypt)
- JWT strategy
- Guards (JwtAuthGuard, RolesGuard)

### 2. UsersModule
**Responsibility**: User management  
**Controllers**: UsersController  
**Services**: UsersService  
**Entities**: User  
**Key Features**:
- CRUD operations
- User lookup
- Account status management

### 3. ProfilesModule
**Responsibility**: Student profiles  
**Controllers**: ProfilesController  
**Services**: ProfilesService  
**Entities**: StudentProfile  
**Key Features**:
- Get/update profile
- Profile validation

### 4. ResumesModule
**Responsibility**: Resume management  
**Controllers**: ResumesController  
**Services**: ResumesService  
**Entities**: Resume  
**Key Features**:
- File upload
- Text extraction
- AI parsing integration
- Resume CRUD

### 5. JobRolesModule
**Responsibility**: Job role management  
**Controllers**: JobRolesController  
**Services**: JobRolesService  
**Entities**: JobRole  
**Key Features**:
- List roles
- Admin CRUD
- Role filtering

### 6. InterviewsModule
**Responsibility**: Interview orchestration  
**Controllers**: InterviewsController  
**Services**: InterviewsService, QuestionService, AnswerService, EvaluationService  
**Entities**: Interview, InterviewQuestion, InterviewAnswer, Evaluation, Recommendation  
**Key Features**:
- Interview lifecycle
- Question generation
- Answer submission
- Evaluation
- Report generation
- State machine

### 7. AiServiceModule
**Responsibility**: AI service integration  
**Controllers**: None (internal)  
**Services**: AiServiceClient  
**Key Features**:
- HTTP client to AI service
- Question generation requests
- Evaluation requests
- Error handling
- Retry logic

### 8. AdminModule
**Responsibility**: Admin functionality  
**Controllers**: AdminController  
**Services**: AdminService  
**Key Features**:
- User management
- System statistics
- Activity monitoring

### 9. DatabaseModule
**Responsibility**: Database configuration  
**Key Features**:
- TypeORM configuration
- Connection management
- Migration management

### 10. CommonModule
**Responsibility**: Shared functionality  
**Key Features**:
- Exception filters
- Interceptors (logging, transform)
- Pipes (validation)
- Decorators
- Utilities
