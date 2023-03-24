import {NextFunction, Request, Response} from 'express';
import User from '../models/UserModel';
import responseSuccess from '../utils/responseSuccess';
import {BadRequestException, InternalServerErrException, NotFoundException} from '../exceptions/ResponseException';
import Helper from '../utils/Helper';

interface IBookmark {
    addItem(req: Request, resp: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, resp: Response, next: NextFunction): Promise<void>;
    removeItem(req: Request, resp: Response, next: NextFunction): Promise<void>;
}

type BookmarkInput = {
    book_id: string;
    title: string;
    author: string;
    imgUrl: string;
    borrowAmount: number;
};

class BookmarkController implements IBookmark {
    async addItem(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            const {id} = req.params;
            const bookmarkInput: BookmarkInput = req.body;
            await User.updateOne(
                {_id: id},
                {
                    $push: {
                        bookmark: bookmarkInput,
                    },
                }
            )
                .exec()
                .then((result) => {
                    if (result.modifiedCount) {
                        resp.status(200).send(responseSuccess(null));
                        return;
                    }
                    next(new BadRequestException('Gagal menambahkan buku ke favorit'));
                })
                .catch((error) => {
                    throw error;
                });
        } catch (error) {
            Helper.logger(error);
            next(new InternalServerErrException());
        }
    }

    async getAll(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            const {id} = req.params;
            await User.findOne({_id: id}, 'bookmark -_id')
                .exec()
                .then((result) => {
                    if (result?.bookmark && result.bookmark.length) {
                        resp.status(200).send(responseSuccess(result));
                        return;
                    }
                    next(new NotFoundException('Tidak ada bookmark'));
                })
                .catch((error) => {
                    throw error;
                });
        } catch (error) {
            Helper.logger(error);
            next(new InternalServerErrException());
        }
    }

    async removeItem(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            const {id, book_id} = req.query;
            await User.updateOne(
                {_id: id},
                {
                    $pull: {
                        bookmark: {book_id},
                    },
                }
            )
                .exec()
                .then((result) => {
                    if (result.modifiedCount) {
                        resp.status(200).send(responseSuccess(null));
                        return;
                    }
                    next(new BadRequestException('Gagal menghapus buku dari favorit'));
                })
                .catch((error) => {
                    throw error;
                });
        } catch (error) {
            Helper.logger(error);
            next(new InternalServerErrException());
        }
    }
}

export default new BookmarkController();
