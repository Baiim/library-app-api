import {unlinkSync} from 'fs';
import {Request, Response, NextFunction} from 'express';
import User from '../models/UserModel';
import {BadRequestException, InternalServerErrException} from '../exceptions/ResponseException';

const DuplicateEmail = (req: Request, _res: Response, next: NextFunction): void => {
    const {email, id_number} = JSON.parse(req.body.data);
    User.findOne({$or: [{email}, {id_number}]}, '-password -__v -bookmark')
        .exec()
        .then((result) => {
            if (result) {
                if (req.file) {
                    unlinkSync(`public/assets/users/${req.file?.filename}`);
                }
                next(
                    new BadRequestException(
                        'Email atau NIM/NIDN telah terdaftar, silahkan gunakan Email atau NIM/NIDN lain'
                    )
                );
                return;
            }
            next();
        })
        .catch(() => {
            if (req.file) {
                unlinkSync(`public/assets/users/${req.file?.filename}`);
            }
            next(new InternalServerErrException());
        });
};

export default DuplicateEmail;
