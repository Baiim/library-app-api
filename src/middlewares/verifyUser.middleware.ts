import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {
    AuthenticationTokenException,
    BadRequestException,
    InternalServerErrException,
} from '../exceptions/ResponseException';
import User from '../models/UserModel';

interface DataPayload {
    role: string;
    aud: string;
}

const verifyUser = async (req: Request, _res: Response, next: NextFunction) => {
    const {id} = req.params;
    const {verified} = req.body;
    const bearerHeader = req.headers['authorization'];
    const bearerToken = bearerHeader?.split(' ')[1] as string;
    const payload = jwt.decode(bearerToken, {complete: true})?.payload as DataPayload;

    if ((verified || verified === false) && id) {
        await User.findOne({_id: payload.aud}, '_id')
            .exec()
            .then(async (result) => {
                if (!result) {
                    next(new AuthenticationTokenException('!Ups, akun anda tidak bisa melakukan verifikasi'));
                    return;
                }
                if (result.id === id) {
                    next(new AuthenticationTokenException('!Ups, tidak bisa melakukan verifikasi pada akun sendiri'));
                    return;
                }
                next();
            })
            .catch(() => {
                next(new InternalServerErrException());
            });
        return;
    }
    next(new BadRequestException('verify dan id user harus dikirim'));
};

export default verifyUser;
