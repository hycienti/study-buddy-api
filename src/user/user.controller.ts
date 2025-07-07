import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ResponseService } from 'src/common/response/response.service';
import { UserAddressDto } from './dto/user-address-dto';
import { UserVerificationDocumentDto } from './dto/user-verification-document-dto';
import { UserStatus } from '@prisma/client';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService, private readonly responseService: ResponseService) { }
  @Get('profile')
  async getProfile(@Request() req) {
    const userId = req.user.id;
    if (!userId) {
      return this.responseService.errorResponse({
        status: HttpStatus.UNAUTHORIZED,
        response: 'Unauthorized'
      });
    }
    const user = await this.userService.findOne(userId);

    if (!user) {
      return this.responseService.errorResponse({
        status: HttpStatus.NOT_FOUND,
        response: 'User not found'
      });
    }
    return this.responseService.successResponse({ ...user, password: undefined });
  }

  @Post('verification-documents')
  async addUserVerificationDocument(@Request() req, @Body() documentData: UserVerificationDocumentDto) {
    const userId = req.user.id;
    if (!userId) {
      return this.responseService.errorResponse({
        status: HttpStatus.UNAUTHORIZED,
        response: 'Unauthorized'
      });
    }
    const document = await this.userService.addUserVerificationDocument(userId, documentData);
    return this.responseService.successResponse(document);
  }

  //get user address
  @Get('user-address')
  async getUserAddress(@Request() req) {
    const userId = req.user.id;
    if (!userId) {
      return this.responseService.errorResponse({
        status: HttpStatus.UNAUTHORIZED,
        response: 'Unauthorized'
      });
    }
    const address = await this.userService.getUserAddress(userId);
    if (!address) {
      return this.responseService.errorResponse({
        status: HttpStatus.NOT_FOUND,
        response: 'Address not found'
      });
    }
    return this.responseService.successResponse(address);
  }

  //get use documents
  @Get('user-documents')
  async getUserVerificationDocuments(@Request() req) {
    const userId = req.user.id;
    if (!userId) {
      return this.responseService.errorResponse({
        status: HttpStatus.UNAUTHORIZED,
        response: 'Unauthorized'
      });
    }
    const documents = await this.userService.getUserVerificationDocuments(userId);
    if (!documents || documents.length === 0) {
      return this.responseService.errorResponse({
        status: HttpStatus.NOT_FOUND,
        response: 'No verification documents found'
      });
    }
    console.log(documents)

    return this.responseService.successResponse(documents);
  }

  @Post('address')
  async addUserAddress(@Request() req, @Body() addressData: UserAddressDto) {
    const userId = req.user.id;
    if (!userId) {
      return this.responseService.errorResponse({
        status: HttpStatus.UNAUTHORIZED,
        response: 'Unauthorized'
      });
    }
    const address = await this.userService.addUserAddress(userId, addressData);
    return this.responseService.successResponse(address);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.userService.remove(id, req.user.id);
  }

  @Patch(":userid/change-account-status")
  async changeAccountStatus(@Param("userid") userId: string, @Body("status") status: UserStatus, @Request() req) {
    try {
      const result = await this.userService.changeAccountStatus(userId, status, req.user.id);
      if (!result) {
        return this.responseService.errorResponse({ response: 'User not found', status: 404 });
      }
      return this.responseService.successResponse(result);
    } catch (error) {
      return this.responseService.errorResponse({ response: error.message, status: 400 });

    }
  }
}
