import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../user.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject('USER_REPOSITORY')
        private userRepository: typeof User,

        private config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get<string>('JWT_SECRET')
        })
    }

    async validate(payload: {
        sub: number,
        email: string
    }) {
        const user = await this.userRepository.findByPk(payload.sub);
        delete user.createdAt;
        delete user.updatedAt;
        delete user.password;
        return user;
    }
}