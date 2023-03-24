import {NextFunction, Request, Response} from 'express';
import {
    AuthenticationTokenException,
    BadRequestException,
    InternalServerErrException,
} from '../exceptions/ResponseException';
import Role from '../models/RoleModel';
import User from '../models/UserModel';

const verifyUser = async (req: Request, _res: Response, next: NextFunction) => {
    const {id} = req.params;
    const {verified, email} = req.body;

    if ((verified || verified === false) && email) {
        await User.findOne({email})
            .exec()
            .then(async (result) => {
                if (result) {
                    if (result.id === id) {
                        next(
                            new AuthenticationTokenException('!Ups, tidak bisa melakukan verifikasi pada akun sendiri')
                        );
                        return;
                    }
                    await Role.findOne({_id: result.id_role})
                        .exec()
                        .then((result) => {
                            if (result && (result.code === 1 || result.code === 0)) {
                                next();
                                return;
                            }
                            next(
                                new AuthenticationTokenException('!Ups, role user tidak bisa melakukan verifikasi akun')
                            );
                        })
                        .catch(() => {
                            next(new InternalServerErrException());
                        });
                    return;
                }
                next(new AuthenticationTokenException('!Ups, role user tidak bisa melakukan verifikasi akun'));
            })
            .catch(() => {
                next(new InternalServerErrException());
            });
        return;
    }
    next(new BadRequestException('verify dan id role harus dikirim'));
};

export default verifyUser;
