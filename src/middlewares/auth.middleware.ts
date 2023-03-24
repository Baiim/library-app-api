import {Response, NextFunction, Request} from 'express';
import jwt from 'jsonwebtoken';
import {config as dotenv} from 'dotenv';
import config, {IConfig} from '../utils/config';
import {AuthenticationTokenException} from '../exceptions/ResponseException';
import client from '../utils/initRedis';

interface DataPayload {
    aud: string;
}
class AuthMiddleware {
    private ACCESS_TOKEN_SECRET: string;
    private REFRESH_TOKEN_SECRET: string;

    constructor() {
        dotenv();
        this.ACCESS_TOKEN_SECRET = config(process.env.NODE_ENV as keyof IConfig)?.ACCESS_TOKEN_SECRET ?? '';
        this.REFRESH_TOKEN_SECRET = config(process.env.NODE_ENV as keyof IConfig)?.REFRESH_TOKEN_SECRET ?? '';
    }

    private getBearerToken = (req: Request) => {
        const bearerHeader = req.headers['authorization'];
        if (!bearerHeader) return null;
        const bearer = bearerHeader.split(' ');
        return bearer[1];
    };

    public verifyAccessToken = (req: Request, res: Response, next: NextFunction) => {
        const bearerToken = this.getBearerToken(req);
        if (!bearerToken) {
            return next(new AuthenticationTokenException());
        }

        jwt.verify(bearerToken, this.ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) {
                return next(new AuthenticationTokenException());
            }
            const data: DataPayload = payload as DataPayload;
            client
                .lRange(data.aud, 0, -1)
                .then((reply) => {
                    if (reply.length) {
                        for (let i = 0; i < reply.length; i++) {
                            const item = reply[i];
                            if (bearerToken === JSON.parse(item).accessToken) return next();
                            else if (i === reply.length - 1) return next(new AuthenticationTokenException());
                        }
                    } else {
                        next(new AuthenticationTokenException());
                    }
                })
                .catch(() => {
                    next(new AuthenticationTokenException());
                });
        });
    };

    public verifyRefreshToken = (req: Request, res: Response, next: NextFunction) => {
        const bearerToken = this.getBearerToken(req);
        if (!bearerToken) {
            return next(new AuthenticationTokenException());
        }

        jwt.verify(bearerToken, this.REFRESH_TOKEN_SECRET, (err, payload) => {
            if (err) return next(new AuthenticationTokenException());
            const data: DataPayload = payload as DataPayload;
            client
                .lRange(data.aud, 0, -1)
                .then((reply) => {
                    if (reply.length) {
                        for (let i = 0; i < reply.length; i++) {
                            const item = reply[i];
                            if (bearerToken === JSON.parse(item).refreshToken) {
                                client
                                    .lRem(data.aud, 0, item)
                                    .then(() => {
                                        return next();
                                    })
                                    .catch((error) => {
                                        throw error;
                                    });
                            } else if (i === reply.length - 1) return next(new AuthenticationTokenException());
                        }
                    } else {
                        next(new AuthenticationTokenException());
                    }
                })
                .catch(() => {
                    next(new AuthenticationTokenException());
                });
        });
    };
}

export default new AuthMiddleware();
