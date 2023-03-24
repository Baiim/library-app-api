import {Request, Response, NextFunction} from 'express';
import Role from '../models/RoleModel';
import IRoleController from '../interfaces/controller.role.interface';
import responseSuccess from '../utils/responseSuccess';
import {InternalServerErrException, NotFoundException} from '../exceptions/ResponseException';

class RoleController implements IRoleController {
    async getAll(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            await Role.find({}, '-__v')
                .exec()
                .then((result) => {
                    if (result && result.length) {
                        resp.status(200).send(responseSuccess(result));
                        return;
                    }
                    next(new NotFoundException('Role tidak ditemukan'));
                })
                .catch((error) => {
                    throw error;
                });
        } catch (error) {
            next(new InternalServerErrException());
        }
    }
}

export default new RoleController();
