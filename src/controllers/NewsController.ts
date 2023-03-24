import {unlinkSync} from 'fs';
import {Request, Response, NextFunction} from 'express';
import {BadRequestException, InternalServerErrException, NotFoundException} from '../exceptions/ResponseException';
import INews from '../interfaces/controller.news.interface';
import News, {NewsInput} from '../models/NewsModel';
import config, {IConfig} from '../utils/config';
import Helper from '../utils/Helper';
import responseSuccess from '../utils/responseSuccess';

const baseUrl = config(process.env.NODE_ENV as keyof IConfig).API_BASE_URl;

class NewsController implements INews {
    async create(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            const newsInput: NewsInput = JSON.parse(req.body.data);
            let imgUrl;
            if (req.file) {
                imgUrl = `${baseUrl}/public/assets/news/${req.file?.filename}`;
                newsInput.imgUrl = imgUrl;
            }
            const news = new News(newsInput);
            await news.save();
            resp.status(200).send(responseSuccess());
        } catch (error) {
            const errorData = Helper.getErrorData(error);
            if (req.file) {
                unlinkSync(`public/assets/news/${req.file?.filename}`);
            }
            if (errorData?.name === 'ValidationError') {
                next(new BadRequestException(errorData.error[0]));
                return;
            }
            next(new InternalServerErrException());
        }
    }

    async get(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            const {page = 1, limit = 10} = req.query;
            const news = await News.find({}, '-__v -_id')
                .limit((limit as number) * 1)
                .skip(((page as number) - 1) * (limit as number))
                .sort('-createdAt');
            const count = await News.countDocuments();
            resp.status(200).send(
                responseSuccess({
                    content: news,
                    totalPage: Math.ceil(count / (limit as number)),
                    currentPage: parseInt(page as string),
                })
            );
        } catch (error) {
            next(new InternalServerErrException());
        }
    }

    async update(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            const {id} = req.params;
            const newsInput: NewsInput = JSON.parse(req.body.data);
            let imgUrl;
            if (req.file) {
                imgUrl = `${baseUrl}/public/assets/news/${req.file?.filename}`;
                newsInput.imgUrl = imgUrl;
            }

            const maybeError = new News(newsInput).validateSync();
            if (maybeError) {
                const error = Helper.checkError(maybeError);
                if (error) throw error;
            }

            await News.findOneAndUpdate({_id: id}, newsInput)
                .exec()
                .then((result) => {
                    if (!result) {
                        next(new NotFoundException('Data tidak ditemukan'));
                        return;
                    }
                    if (result.imgUrl && newsInput.imgUrl) {
                        const imgPath = result.imgUrl.split('/');
                        const imgLink = imgPath.splice(3, imgPath.length).join('/');
                        unlinkSync(imgLink);
                    }
                    resp.status(200).send(responseSuccess());
                })
                .catch((error) => {
                    throw error;
                });
        } catch (error) {
            const errorData = Helper.getErrorData(error);
            if (req.file) {
                unlinkSync(`public/assets/news/${req.file?.filename}`);
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
            await News.findOneAndDelete({_id: id})
                .exec()
                .then((result) => {
                    if (!result) {
                        next(new NotFoundException('Data tidak ditemukan'));
                        return;
                    }
                    if (result.imgUrl) {
                        const imgPath = result.imgUrl.split('/');
                        const imgLink = imgPath.splice(3, imgPath.length).join('/');
                        unlinkSync(imgLink);
                    }
                    resp.status(200).send(responseSuccess());
                })
                .catch((error) => {
                    throw error;
                });
        } catch (error) {
            next(new InternalServerErrException());
        }
    }
}

export default new NewsController();
