// src/auth/auth.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma-service/prisma.service';
import { EmailService } from 'src/common/email/email.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService
  ) { }

  async createAccount(createAuthDto) {
    const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
    const emailVerificationToken = this.generateRandomCode();
    const user = await this.prismaService.user.create({
      data: {
        email: createAuthDto.email,
        password: hashedPassword,
        firstName: createAuthDto.firstName,
        lastName: createAuthDto.lastName,
        accountType: createAuthDto.userAccountType,
        emailVerificationToken,
        ...(createAuthDto.role && { role: createAuthDto.role })
      }
    });
    const sentEmail = await this.emailService.sendVerificationEmail(user.email, emailVerificationToken);
    console.log('Email sent:', sentEmail);
    return user; // Return user directly
  }

  async confirmRegistration(email, token) {
    const user = await this.prismaService.user.findUnique({
      where: { email, emailVerificationToken: token }
    });
    if (!user) throw new NotFoundException('Invalid token or email.');
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerificationToken: null }
    });
    await this.emailService.sendWelcomeEmail(user.email);
    const halfUser = { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, emailVerified: true };
    return { user: halfUser }; // Return user info
  }

  async resendConfirmationCode(email) {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found.');
    const sentEmail = await this.emailService.sendVerificationEmail(user.email, user.emailVerificationToken as string);
    if (sentEmail) {
      return { message: 'Confirmation code resent successfully.' }
    }
    throw new BadRequestException('Failed to resend confirmation code.');
  }

  async login(email, password) {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      throw new BadRequestException('Invalid credentials.');
    if (!user.emailVerified) throw new BadRequestException('Email not verified.');
    if (user.status !== 'ACTIVE') throw new BadRequestException('Account is not active.');
    const payload = { sub: user.id, username: `${user.firstName} ${user.lastName}`, email: user.email, role: user?.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    await this.prismaService.user.update({
      where: { email },
      data: { refreshToken }
    });
    const halfUser = { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, emailVerified: user.emailVerified };
    return { user: halfUser, accessToken, refreshToken }; // Return the authenticated user along with tokens
  }

  async initiateForgotPassword(email) {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found.');
    const resetToken = this.generateRandomCode();
    const expires = new Date(Date.now() + 1000 * 60 * 60); // Token expires in 1 hour
    await this.prismaService.user.update({
      where: { email },
      data: { passwordResetToken: resetToken, passwordResetExpires: expires }
    });
    this.emailService.sendPasswordResetEmail(email, resetToken);
    return { resetToken, expires }; // Return token details
  }

  async resetPassword(email, token, newPassword) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email,
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date()
        }
      }
    });
    if (!user) throw new BadRequestException('Invalid or expired password reset token.');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prismaService.user.update({
      where: { email },
      data: { password: hashedPassword, passwordResetToken: null, passwordResetExpires: null }
    });
    return { message: 'Password reset successful' }; // Return success message
  }

  async deleteAccount(email) {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found.');
    await this.prismaService.user.delete({ where: { email } });
    this.emailService.sendAccountDeletionEmail(email);
    return { message: 'Account deleted successfully.' }; // Return success message
  }

  async updateAccount(email, updateData) {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found.');
    const updatedUser = await this.prismaService.user.update({
      where: { email },
      data: updateData
    });
    this.emailService.sendAccountUpdateEmail(email);
    return updatedUser; // Return the updated user info
  }

  async changePassword(email, newPassword) {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found.');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prismaService.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
    this.emailService.sendPasswordChangeEmail(email);
    return { message: 'Password changed successfully.' }; // Return success message
  }

  //generate random 6 digit number
  generateRandomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
