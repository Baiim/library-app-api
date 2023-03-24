import {Request, Response, NextFunction} from 'express';
import mongoose from 'mongoose';
import Rating, {RatingInput} from '../models/RatingModel';
import IRating from '../interfaces/controller.rating.interface';
import responseSuccess from '../utils/responseSuccess';
import Helper from '../utils/Helper';
import {BadRequestException, InternalServerErrException, NotFoundException} from '../exceptions/ResponseException';

class RatingController implements IRating {
    async create(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            const ratingInput: RatingInput = req.body;
            const rating = new Rating(ratingInput);
            await rating.save();
            resp.status(200).send(responseSuccess(null));
        } catch (error) {
            Helper.logger(error);
            const errorData = Helper.getErrorData(error);
            if (errorData?.name === 'ValidationError') {
                next(new BadRequestException(errorData.error[0]));
                return;
            }
            next(new InternalServerErrException());
        }
    }

    async get(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            const {id, page = 1, limit = 10} = req.query;
            const ratings = await Rating.find({id_book: id})
                .select('-_id -__v')
                .limit((limit as number) * 1)
                .skip(((page as number) - 1) * (limit as number))
                .sort('-createdAt');
            const count = await Rating.count({id_book: id});
            resp.status(200).send(
                responseSuccess({
                    ratings,
                    total: Math.ceil(count / (limit as number)),
                    currentPage: parseInt(page as string),
                })
            );
        } catch (error) {
            Helper.logger(error);
            next(new InternalServerErrException());
        }
    }

    async getRatingAverage(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            const {id} = req.params;
            const ratings = await Rating.aggregate([
                {
                    $match: {
                        id_book: new mongoose.Types.ObjectId(id),
                    },
                },
                {
                    $group: {
                        _id: null,
                        avgRating: {$avg: '$size'},
                    },
                },
                {
                    $project: {
                        avgRating: {$trunc: ['$avgRating', 1]},
                    },
                },
                {$unset: '_id'},
            ]);
            if (!ratings) {
                next(new NotFoundException('Belum ada penilaian'));
            }
            resp.status(200).send(responseSuccess(ratings?.[0]));
        } catch (error) {
            Helper.logger(error);
            next(new InternalServerErrException());
        }
    }
}

export default new RatingController();
