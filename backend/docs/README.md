# Ohara Backend - NestJS

A modern NestJS backend implementation for Ohara, migrated from Python FastAPI.

## Architecture

This backend follows **NestJS modular architecture** with clean separation of concerns:

```
src/
├── modules/                # Feature modules
│   ├── auth/              # Authentication & authorization
│   │   └── controllers/   # Auth endpoints
│   ├── users/             # User management
│   │   ├── controllers/   # User endpoints
│   │   └── services/      # User business logic
│   ├── collections/       # Collection management
│   │   ├── controllers/   # Collection endpoints
│   │   └── services/      # Collection business logic
│   ├── items/             # Item management
│   │   ├── controllers/   # Item endpoints
│   │   └── services/      # Item business logic
│   ├── documents/         # Document management
│   │   ├── controllers/   # Document endpoints
│   │   └── services/      # Document business logic
│   ├── folders/           # Folder management
│   │   ├── controllers/   # Folder endpoints
│   │   └── services/      # Folder business logic
│   ├── comments/          # Comment management
│   │   ├── controllers/   # Comment endpoints
│   │   └── services/      # Comment business logic
│   ├── reactions/         # Reaction management
│   │   ├── controllers/   # Reaction endpoints
│   │   └── services/      # Reaction business logic
│   └── agent/             # AI agent integration
│       ├── controllers/   # Agent endpoints
│       └── services/      # Agent business logic
├── common/                # Shared utilities
│   └── errors/            # Error handling filters
├── app.module.ts          # Root application module
└── main.ts                # Application entry point
```

## Key Features

- **TypeScript** with strict type checking
- **NestJS Framework** with modular architecture
- **JWT Authentication** with guards and decorators
- **PostgreSQL Database** via TypeORM
- **Modular Design** with controllers and services
- **Global Error Handling** with exception filters
- **Configuration Management** with @nestjs/config
- **AI Agent Integration** for intelligent features
- **Unit Testing** with Jest and TypeScript support

## Database

The backend uses PostgreSQL with TypeORM for database management.

Database schema and entities are defined in each module's service layer.

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Environment variables configured

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Update .env with your database credentials
   ```

3. **Build and start:**
   ```bash
   npm run build
   npm start
   ```

4. **Development mode:**
   ```bash
   npm run dev
   ```

## Environment Configuration

### Required Variables

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your-password
DATABASE_NAME=ohara

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGINS=http://localhost:3000

# External Services
AGENT_SERVICE_URL=http://localhost:8001
```

## API Endpoints

See [ENDPOINTS.md](./ENDPOINTS.md) for detailed endpoint documentation.

## Development

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to dist/
npm start            # Start production server
npm test             # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking only
```

### Testing

The project includes comprehensive testing setup:

- **Jest** with TypeScript and ESM support
- **Unit tests** for services and repositories
- **Integration tests** for API endpoints
- **Mocking** for Supabase client and external dependencies

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/unit/services/jwt-service.test.ts

# Run with coverage
npm test -- --coverage
```

See [TESTING.md](./TESTING.md) for detailed testing guide.

### Adding New Features

1. **Module**: Create new module with `nest g module {name}`
2. **Service**: Add service with `nest g service {name}`
3. **Controller**: Create controller with `nest g controller {name}`
4. **Entities**: Define TypeORM entities if needed
5. **DTOs**: Create Data Transfer Objects for validation
6. **Tests**: Add unit and integration tests

## Migration from Python Backend

This NestJS implementation provides:

✅ **Enhanced Type Safety**: Complete TypeScript implementation
✅ **Modern Architecture**: NestJS modular design for better maintainability
✅ **Dependency Injection**: Built-in DI container
✅ **Decorator-based**: Clean, declarative code style
✅ **Testing Framework**: Comprehensive unit and integration testing

### Key Differences

- **Framework**: FastAPI → NestJS
- **Architecture**: Monolithic → Modular
- **Type System**: Pydantic → TypeScript + class-validator
- **Dependency Injection**: Manual → Built-in NestJS DI

## Production Deployment

### Build for Production

```bash
npm run build
NODE_ENV=production npm start
```

### Security Considerations

- JWT tokens with secure validation
- CORS configured for specific origins
- Environment-based configuration
- Input validation with class-validator
- Exception filters for error handling

### Performance

- Connection pooling via TypeORM
- Efficient database queries with query builders
- Async/await patterns throughout
- Global exception filters

## Current Status

### ✅ **Implemented**

- [x] **Module Structure**: Auth, Users, Collections, Items, Documents, Folders, Comments, Reactions, Agent
- [x] **NestJS Framework**: Modern TypeScript backend
- [x] **Global Error Handling**: Exception filters
- [x] **Configuration Management**: Environment variables
- [x] **TypeScript**: Full type safety with strict configuration
- [x] **Build System**: Production-ready compilation

### 🔄 **Planned Enhancements**

- [ ] Database integration (TypeORM setup)
- [ ] Authentication guards and strategies
- [ ] API documentation with Swagger
- [ ] Rate limiting middleware
- [ ] Database migration scripts
- [ ] E2E testing suite
- [ ] Logging system (Winston/Pino)

## Support

For issues and questions:
- Review module structure in `src/modules/`
- Check NestJS documentation: https://docs.nestjs.com
- Examine the modular architecture for code organization

---

**Migration In Progress** 🔄 - Backend migrated to NestJS framework.