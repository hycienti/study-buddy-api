import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PrismaService } from 'src/common/prisma-service/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prismaService: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload: any) {
        // Find the user in the database using the ID from the JWT payload
        const user = await this.prismaService.user.findUnique({
            where: { id: payload.sub, role: payload.role }
        });
        if (!user) {
            throw new UnauthorizedException();
        }
        return user; // The returned user will be attached to the request object in any protected route
    }
}
