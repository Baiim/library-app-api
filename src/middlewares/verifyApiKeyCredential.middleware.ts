import {Request, Response, NextFunction} from 'express';
import {WrongCredentialsException} from '../exceptions/ResponseException';
import config, {IConfig} from '../utils/config';

export const verifyApiKeyCredential = (req: Request, _res: Response, next: NextFunction) => {
    const apiKey = req.header('X-Api-Key');
    if (apiKey !== config(process.env.NODE_ENV as keyof IConfig).APIKEY) {
        next(new WrongCredentialsException());
        return;
    }
    next();
};
