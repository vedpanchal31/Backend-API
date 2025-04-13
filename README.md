# Backend API

A robust authentication system built with Node.js, Express, and MongoDB.

## Features

- User registration with email verification
- Secure login with JWT authentication
- Password reset functionality
- Email verification with OTP
- Protected routes with middleware
- Token blacklisting for logout
- Swagger documentation

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/verify-email` - Verify email with OTP
- `POST /auth/sign-in` - Sign in user
- `POST /auth/forgot-password` - Request password reset OTP
- `POST /auth/verify-otp` - Verify password reset OTP
- `POST /auth/reset-password/:token` - Reset password using token
- `POST /auth/resend-email` - Resend OTP or verify email (protected)
- `POST /auth/logout` - Logout user (protected)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/Backend-API.git
   cd Backend-API
   ```

2. Install dependencies:

   ```bash
   npm install / npm run dev
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/your-database
   JWT_SECRET=your-jwt-secret
   EMAIL_SERVICE=your-email-service
   EMAIL_USER=your-email
   EMAIL_PASSWORD=your-email-password
   ```

4. Start the server:
   ```bash
   npm start
   # or
   yarn start
   ```

## API Documentation

The API documentation is available at `/api-docs` when the server is running. It provides detailed information about all endpoints, request/response formats, and authentication requirements.

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Email verification
- Token blacklisting for logout
- Input validation
- Error handling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
