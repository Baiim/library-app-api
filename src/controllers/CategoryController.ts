import {Request, Response, NextFunction} from 'express';
import Category, {CategoryInput} from '../models/CategoryModel';
import ICategory from '../interfaces/controller.category.interface';
import responseSuccess from '../utils/responseSuccess';
import Helper from '../utils/Helper';
import {BadRequestException, InternalServerErrException, NotFoundException} from '../exceptions/ResponseException';

class CategoryController implements ICategory {
    async create(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            const categoryInput: CategoryInput = req.body;
            const category = new Category(categoryInput);
            await category.save();
            resp.status(200).send(responseSuccess(null));
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
            const categoryInput: CategoryInput = req.body;
            const maybeError = new Category(categoryInput).validateSync();
            if (maybeError) {
                const error = Helper.checkError(maybeError);
                if (error) throw error;
            }
            const result = await Category.updateOne({_id: id}, categoryInput);
            if (result.modifiedCount) {
                resp.status(200).send(responseSuccess(null));
                return;
            }
            next(new BadRequestException('Category tidak ditemukan'));
        } catch (error) {
            const errorData = Helper.getErrorData(error);
            if (errorData?.name === 'ValidationError') {
                next(new BadRequestException(errorData.error[0]));
                return;
            }
            next(new InternalServerErrException());
        }
    }

    async getAll(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            await Category.find({}, '-__v')
                .exec()
                .then((result) => {
                    if (result?.length) {
                        resp.status(200).send(responseSuccess(result));
                        return;
                    }
                    next(new NotFoundException('Category tidak ditemukan'));
                })
                .catch((error) => {
                    throw error;
                });
        } catch (error) {
            next(new InternalServerErrException());
        }
    }

    async delete(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            const {id} = req.params;
            await Category.deleteOne({_id: id})
                .exec()
                .then(() => {
                    resp.status(200).send(responseSuccess(null));
                })
                .catch((error) => {
                    throw error;
                });
        } catch (error) {
            next(new InternalServerErrException());
        }
    }
}

export default new CategoryController();
