---

# Nestjs Rabbitmq Prisma JWT Boilerplate

This repository is a boilerplate for building a scalable and secure authentication system using NestJS, Prisma, MariaDB (Mysql), RabbitMQ, and Docker. It provides a starting point for creating microservices-based applications with robust authentication mechanisms.

## Features

- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **Prisma**: A next-generation ORM for Node.js and TypeScript.
- **MariaDB (Mysql)**: A relational database management system.
- **RabbitMQ**: A message broker for inter-service communication.
- **Docker**: Containerization for easy deployment and scalability.
- **JWT Authentication**: Secure authentication using JSON Web Tokens.
- **Microservices Architecture**: Separation of concerns using microservices.

## Project Structure

```
├── apps
│   ├── auth
│   │   ├── src
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   └── strategies
│   │   └── Dockerfile
│   ├── gateway
│   │   ├── src
│   │   │   ├── auth.controller.ts
│   │   │   ├── gateway.module.ts
│   │   │   └── main.ts
│   │   └── Dockerfile
│   └── users
│       ├── src
│       │   ├── users.controller.ts
│       │   ├── users.module.ts
│       │   └── users.service.ts
│       └── Dockerfile
├── libs
│   └── common
│       ├── src
│       │   ├── auth
│       │   │   ├── auth.guard.ts
│       │   │   ├── auth.module.ts
│       │   ├── database
│       │   │   ├── prisma.service.ts
│       │   │   └── prisma.module.ts
│       │   └── rmq
│       │       ├── rmq.service.ts
│       │       └── rmq.module.ts
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/pouyahasanamreji/nestjs-rabbitmq-prisma-jwt-boilerplate
    cd nestjs-auth-boilerplate
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Set up environment variables:**

    #### Users Microservice (.env)

    ```env
    DATABASE_URL="mysql://user:password@mariadb:3306/pos"
    RABBIT_MQ_URI=amqp://rabbitmq:5672
    RABBIT_MQ_USERS_QUEUE=users
    ```

    #### Auth Microservice (.env)

    ```env
    RABBIT_MQ_URI=amqp://rabbitmq:5672
    RABBIT_MQ_AUTH_QUEUE=auth
    RABBIT_MQ_USERS_QUEUE=users
    JWT_SECRET=yJSDVpxKUQ1LSfrnrsLN6r6tmFd1i95I3zGXjpIryO8zoWg7fDmYEnyyCmtKFh2MFd4c7rFjN9wKsiwRXYKZ9BKJ5YHTByQi8Q4
    JWT_EXPIRATION='60m'
    JWT_REFRESH_EXPIRATION='14d'
    ```

    #### Gateway Microservice (.env)

    ```env
    RABBIT_MQ_URI=amqp://rabbitmq:5672
    RABBIT_MQ_AUTH_QUEUE=auth
    RABBIT_MQ_USERS_QUEUE=users
    JWT_SECRET=yJSDVpxKUQ1LSfrnrsLN6r6tmFd1i95I3zGXjpIryO8zoWg7fDmYEnyyCmtKFh2MFd4c7rFjN9wKsiwRXYKZ9BKJ5YHTByQi8Q4
    ```

    #### Root of Project (.env) (For Prisma CLI)

    ```env
    DATABASE_URL="mysql://root:password@localhost:3306/pos"
    ```

### Running the Application

1. **Start the services:**

    ```bash
    docker-compose up --build
    ```

    This command will build and start the Docker containers for MariaDB, RabbitMQ, and the NestJS microservices.

2. **Apply database migrations:**

    Once the services are up, apply the Prisma migrations:

    ```bash
    npx prisma migrate deploy
    ```

3. **Access the application:**

    The gateway service will be accessible at `http://localhost:3000`.

### Endpoints

- **Authentication:**
  - `POST /auth/login`: Authenticate a user and return JWT tokens.
  - `POST /auth/register`: Register a new user and return JWT tokens.
  - `POST /auth/refresh`: Refresh the access token using the refresh token.
  - `POST /auth/logout`: Log out a user by invalidating the tokens.

- **Users:**
  - `GET /users`: Retrieve all users (protected route).

## Project Configuration

### Prisma

Prisma is used for database access. The Prisma schema is defined in `libs/common/src/database/prisma/schema.prisma`. You can generate the Prisma client by running:

```bash
npx prisma generate
```

### RabbitMQ

RabbitMQ is used for inter-service communication. The RMQ configuration is defined in `libs/common/src/rmq/rmq.module.ts`.

### JWT

JWT is used for authentication. The JWT configuration is defined in `libs/common/src/auth/auth.module.ts` and `apps/auth/src/auth.service.ts`.

## TODO

- Implement authorization
- Implement testing

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss your ideas.

## License

This project is licensed under the MIT License.

## Acknowledgements

- [NestJS](https://nestjs.com/)
- [Prisma](https://www.prisma.io/)
- [MariaDB](https://mariadb.com/)
- [RabbitMQ](https://www.rabbitmq.com/)
- [Docker](https://www.docker.com/)

## Author

Developed by [Pouya Hasan Amreji](mailto:pouyahasanamreji@protonmail.com).

---
