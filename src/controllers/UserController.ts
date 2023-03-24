import {unlinkSync} from 'fs';
import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {IUserController} from '../interfaces/controller.interface';
import User, {UserDocument, UserInput} from '../models/UserModel';
import JwtSign from '../utils/jwtSign';
import Helper from '../utils/Helper';
import responseSuccess from '../utils/responseSuccess';
import {BadRequestException, InternalServerErrException, NotFoundException} from '../exceptions/ResponseException';
import config, {IConfig} from '../utils/config';

const baseUrl = config(process.env.NODE_ENV as keyof IConfig).API_BASE_URl;
interface DataPayload {
    aud: string;
}

class UserController implements IUserController {
    async register(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            const userInput: UserInput = JSON.parse(req.body.data);
            let imgUrl;
            if (req.file) {
                imgUrl = `${baseUrl}/public/assets/users/${req.file?.filename}`;
                userInput.imgUrl = imgUrl;
            }
            const user = new User(userInput);
            await user.save();
            resp.status(200).send(responseSuccess(null));
        } catch (error) {
            const errorData = Helper.getErrorData(error);
            if (req.file) {
                unlinkSync(`public/assets/users/${req.file?.filename}`);
            }
            if (errorData?.name === 'ValidationError') {
                next(new BadRequestException(errorData.error[0]));
                return;
            }
            next(new InternalServerErrException());
        }
    }

    async login(req: Request, resp: Response, next: NextFunction): Promise<void> {
        const {email, password} = req.body;
        try {
            const result = await User.findOne({email: email}, '-__v -bookmark');
            if (!result) {
                next(new NotFoundException('Email tidak terdaftar'));
                return;
            }
            result.comparePassword(password, function (matchError, isMatch) {
                if (matchError || !isMatch) {
                    next(new BadRequestException(matchError ? 'Ups!, ada yang salah' : 'Ups!, password tidak valid'));
                    return;
                }
                new JwtSign(result)
                    .createToken()
                    .then((response) => resp.status(200).send(responseSuccess(response)))
                    .catch(() => next(new InternalServerErrException()));
            });
        } catch (error) {
            const errorData = Helper.getErrorData(error);
            if (errorData?.name === 'ValidationError') {
                next(new BadRequestException(errorData.error[0]));
                return;
            }
            next(new InternalServerErrException());
        }
    }

    async update(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            const {id} = req.params;
            let imgUrl;
            const userInput: UserInput =
                req.body.verified || req.body.verified === false ? req.body : JSON.parse(req.body.data);
            const maybeError = new User(userInput).validateSync();

            if (req.file) {
                imgUrl = `${baseUrl}/public/assets/users/${req.file?.filename}`;
                userInput.imgUrl = imgUrl;
            }
            if (maybeError) {
                const error = Helper.checkError(maybeError);
                if (error) throw error;
            }

            await User.findOneAndUpdate({_id: id}, userInput)
                .exec()
                .then((result) => {
                    if (result) {
                        const imgPath = result.imgUrl?.split('/');
                        const imgLink = imgPath?.splice(3, imgPath.length)?.join('/');
                        if (imgLink) unlinkSync(imgLink);
                        resp.status(200).send(responseSuccess(null));
                        return;
                    }
                    next(new NotFoundException('User tidak ditemukan'));
                })
                .catch((error) => {
                    throw error;
                });
        } catch (error) {
            const errorData = Helper.getErrorData(error);
            if (req.file) {
                unlinkSync(`public/assets/users/${req.file?.filename}`);
            }
            if (errorData?.name === 'ValidationError') {
                next(new BadRequestException(errorData.error[0]));
                return;
            }
            next(new InternalServerErrException());
        }
    }

    async delete(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            const {id} = req.params;
            await User.findOneAndDelete({_id: id})
                .exec()
                .then((result) => {
                    if (result) {
                        if (result.imgUrl) {
                            const imgPath = result.imgUrl.split('/');
                            const imgLink = imgPath.splice(3, imgPath.length).join('/');
                            unlinkSync(imgLink);
                        }
                        resp.status(200).send(responseSuccess(null));
                        return;
                    }
                    next(new BadRequestException('User tidak ditemukan'));
                })
                .catch((error) => {
                    throw error;
                });
        } catch (error) {
            next(new InternalServerErrException());
        }
    }

    async get(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            const {id} = req.params;
            const result = await User.findOne({_id: id}, '-password -__v -bookmark');
            if (result) {
                resp.status(200).send(responseSuccess(result));
                return;
            }
            next(new NotFoundException('User tidak ditemukan'));
        } catch (error) {
            next(new InternalServerErrException());
        }
    }

    async getAll(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            await User.find({}, '-password -__v -bookmark')
                .exec()
                .then((result) => {
                    if (result && result.length) {
                        resp.status(200).send(responseSuccess(result));
                        return;
                    }
                    next(new NotFoundException('Data user tidak ditemukan'));
                })
                .catch((error) => {
                    throw error;
                });
        } catch (error) {
            next(new InternalServerErrException());
        }
    }

    async refreshToken(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            const bearerHeader = req.headers['authorization'];
            const bearerToken = bearerHeader?.split(' ')[1] as string;
            const payload = jwt.decode(bearerToken, {complete: true})?.payload as DataPayload;
            new JwtSign({id: payload.aud} as UserDocument)
                .createToken()
                .then((response) => resp.status(200).send(responseSuccess(response)))
                .catch((error) => {
                    throw error;
                });
        } catch (error) {
            const message = Helper.getErrorMessage(error);
            next(new InternalServerErrException(message));
        }
    }
}

export default new UserController();
