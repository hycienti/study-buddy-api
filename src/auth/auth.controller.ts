// src/auth/auth.controller.ts
import { Body, Controller, Post, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ConfirmAuthDto } from './dto/confirm-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ConfirmForgotPasswordDto } from './dto/confirm-forgot-password.dto';
import { ResponseService } from 'src/common/response/response.service';
import { CreateAuthAdminDto } from './dto/create-auth-admin.dto';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ResendOtpDto } from './dto/resend-otp.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly responseService: ResponseService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiBody({ type: CreateAuthDto })
  async register(@Body() createAuthDto: CreateAuthDto) {
    try {
      const authObject = { ...createAuthDto, email: createAuthDto.email.toLowerCase() };
      const user = await this.authService.createAccount(authObject);
      return this.responseService.successResponse(user);
    } catch (error) {
      console.error('Error during registration:', error);
      return this.responseService.errorResponse(error);
    }
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm user registration' })
  @ApiResponse({ status: 200, description: 'User successfully confirmed.' })
  @ApiResponse({ status: 400, description: 'Invalid confirmation code or email.' })
  @ApiBody({ type: ConfirmAuthDto })
  async confirm(@Body() confirmAuthDto: ConfirmAuthDto) {
    try {
      const result = await this.authService.confirmRegistration(confirmAuthDto.email, confirmAuthDto.code);
      return this.responseService.successResponse(result);
    } catch (error) {
      return this.responseService.errorResponse(error);
    }
  }
  @Post('resend-code')
  @ApiOperation({ summary: 'Resend confirmation code' })
  @ApiResponse({ status: 200, description: 'Confirmation code resent.' })
  @ApiResponse({ status: 400, description: 'Invalid email.' })
  @ApiBody({ type: ResendOtpDto })
  async resendCode(@Body() confirmAuthDto: ResendOtpDto) {
    try {
      const result = await this.authService.resendConfirmationCode(confirmAuthDto.email);
      return this.responseService.successResponse(result);
    } catch (error) {
      return this.responseService.errorResponse(error);
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate a user' })
  @ApiResponse({ status: 200, description: 'User successfully authenticated.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiBody({ type: LoginAuthDto })
  async login(@Body() loginAuthDto: LoginAuthDto) {
    try {
      const authData = { ...loginAuthDto, email: loginAuthDto.email.toLowerCase() };
      const user = await this.authService.login(authData.email, authData.password);
      return this.responseService.successResponse(user);
    } catch (error) {
      console.error('Error during login:', error);
      return this.responseService.errorResponse(error);
    }
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Initiate forgot password process' })
  @ApiResponse({ status: 200, description: 'Password reset initiated.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      const result = await this.authService.initiateForgotPassword(forgotPasswordDto.email);
      return this.responseService.successResponse(result);
    } catch (error) {
      return this.responseService.errorResponse(error);
    }
  }

  @Post('confirm-forgot-password')
  @ApiOperation({ summary: 'Confirm forgot password process' })
  @ApiResponse({ status: 200, description: 'Password successfully reset.' })
  @ApiResponse({ status: 400, description: 'Invalid reset code or email.' })
  @ApiBody({ type: ConfirmForgotPasswordDto })
  async confirmForgotPassword(@Body() confirmForgotPasswordDto: ConfirmForgotPasswordDto) {
    try {
      const result = await this.authService.resetPassword(
        confirmForgotPasswordDto.email,
        confirmForgotPasswordDto.code,
        confirmForgotPasswordDto.newPassword
      );
      return this.responseService.successResponse(result);
    } catch (error) {
      return this.responseService.errorResponse(error);
    }
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post("admin/create/user")
  @ApiOperation({ summary: 'Register a new user (admin-level access required)' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiBody({ type: CreateAuthAdminDto })
  async registerAdminUser(@Body() createAuthDto: CreateAuthAdminDto) {
    if (createAuthDto?.role === "ADMIN") {
      return this.responseService.errorResponse({ status: 403, response: "You are not allowed to create a user with this kind of role" });
    }
    try {
      const authObject = { ...createAuthDto, email: createAuthDto.email.toLowerCase() };
      const user = await this.authService.createAccount(authObject);
      return this.responseService.successResponse(user);
    } catch (error) {
      console.error('Error during registration:', error);
      return this.responseService.errorResponse(error);
    }
  }
}
