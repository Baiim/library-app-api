import {unlinkSync} from 'fs';
import {Request, Response, NextFunction} from 'express';
import IBook from '../interfaces/controller.book.interface';
import Book, {BookInput} from '../models/BookModel';
import responseSuccess from '../utils/responseSuccess';
import {BadRequestException, InternalServerErrException, NotFoundException} from '../exceptions/ResponseException';
import Helper from '../utils/Helper';
import config, {IConfig} from '../utils/config';

const baseUrl = config(process.env.NODE_ENV as keyof IConfig).API_BASE_URl;

class BookController implements IBook {
    async create(req: Request, resp: Response, next: NextFunction): Promise<void> {
        const files = req.files as Record<string, Array<Express.Multer.File>>;
        const filenames = Object.keys(files).length ? files : undefined;
        try {
            const bookInput: BookInput = JSON.parse(req.body.data);
            let imgUrl, pdfUrl;
            if (Object.keys(files).length) {
                if (filenames?.['book_pdf']?.[0].mimetype) {
                    if (!/pdf/.test(filenames?.['book_pdf']?.[0].mimetype)) {
                        throw new Error('File buku harus format pdf');
                    }
                }
                if (filenames?.['cover_book']?.[0].filename) {
                    if (!/jpeg|jpg|png/.test(filenames?.['cover_book']?.[0].mimetype)) {
                        throw new Error('Thumbnail buku harus format image');
                    }
                }
                imgUrl = `${baseUrl}/public/assets/books/${filenames?.['cover_book'][0].filename}`;
                pdfUrl = `${baseUrl}/public/assets/books/${filenames?.['book_pdf'][0].filename}`;
                if (!imgUrl.includes('undefined')) bookInput.imgUrl = imgUrl;
                if (!pdfUrl.includes('undefined')) bookInput.pdfUrl = pdfUrl;
            }

            const book = new Book(bookInput);
            await book.save();
            resp.status(200).send(responseSuccess(null));
        } catch (error) {
            const errorData = Helper.getErrorData(error);
            const message = Helper.getErrorMessage(error);
            if (Object.keys(files).length) {
                unlinkSync(`public/assets/books/${filenames?.['cover_book']?.[0].filename}`);
                unlinkSync(`public/assets/books/${filenames?.['book_pdf']?.[0].filename}`);
            }
            if (errorData?.name === 'ValidationError') {
                next(new BadRequestException(errorData.error[0]));
                return;
            }
            next(new InternalServerErrException(message));
        }
    }

    async update(req: Request, resp: Response, next: NextFunction): Promise<void> {
        const files = req.files as Record<string, Array<Express.Multer.File>>;
        const filenames = Object.keys(files).length ? files : undefined;
        try {
            const {id} = req.params;
            const bookInput: BookInput = JSON.parse(req.body.data);
            let imgUrl, pdfUrl;
            const maybeError = new Book(bookInput).validateSync();

            if (Object.keys(files).length) {
                if (filenames?.['book_pdf']?.[0].mimetype) {
                    if (!/pdf/.test(filenames?.['book_pdf']?.[0].mimetype)) {
                        throw new Error('File buku harus format pdf');
                    }
                }
                if (filenames?.['cover_book']?.[0].filename) {
                    if (!/jpeg|jpg|png/.test(filenames?.['cover_book']?.[0].mimetype)) {
                        throw new Error('Thumbnail buku harus format image');
                    }
                }
                imgUrl = `${baseUrl}/public/assets/books/${filenames?.['cover_book']?.[0].filename}`;
                pdfUrl = `${baseUrl}/public/assets/books/${filenames?.['book_pdf']?.[0].filename}`;
                if (!imgUrl.includes('undefined')) bookInput.imgUrl = imgUrl;
                if (!pdfUrl.includes('undefined')) bookInput.pdfUrl = pdfUrl;
            }
            if (maybeError) {
                const error = Helper.checkError(maybeError);
                if (error) throw error;
            }

            await Book.findOneAndUpdate({_id: id}, bookInput)
                .exec()
                .then((result) => {
                    if (result) {
                        if (bookInput.imgUrl && result.imgUrl) {
                            const imgPath = result.imgUrl.split('/');
                            const imgLink = imgPath.splice(3, imgPath.length).join('/');
                            unlinkSync(imgLink);
                        }
                        if (bookInput.pdfUrl && result.pdfUrl) {
                            const pdfPath = result.pdfUrl.split('/');
                            const pdfLink = pdfPath.splice(3, pdfPath.length).join('/');
                            unlinkSync(pdfLink);
                        }
                        resp.status(200).send(responseSuccess(null));
                        return;
                    }
                    next(new BadRequestException('Buku tidak ditemukan'));
                })
                .catch(() => {
                    next(new InternalServerErrException());
                    return;
                });
        } catch (error) {
            const errorData = Helper.getErrorData(error);
            const message = Helper.getErrorMessage(error);
            if (Object.keys(files).length) {
                unlinkSync(`public/assets/books/${filenames?.['cover_book']?.[0].filename}`);
                unlinkSync(`public/assets/books/${filenames?.['book_pdf']?.[0].filename}`);
            }
            next(new BadRequestException(errorData?.error[0] ?? message));
        }
    }

    async getMostPicked(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            const mostPicked = await Book.find({}, '-__v')
                .sort({borrowAmount: -1})
                .select('title author year imgUrl borrowAmount')
                .limit(5);
            resp.status(200).send(responseSuccess(mostPicked));
        } catch (error) {
            next(new InternalServerErrException());
        }
    }

    async getAll(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            const {page = 1, limit = 10} = req.query;
            const books = await Book.find({}, '-__v')
                .limit((limit as number) * 1)
                .skip(((page as number) - 1) * (limit as number))
                .select('title author year imgUrl')
                .sort('-createdAt');
            const count = await Book.countDocuments();
            resp.status(200).send(
                responseSuccess({
                    content: books,
                    totalPage: Math.ceil(count / (limit as number)),
                    currentPage: parseInt(page as string),
                })
            );
        } catch (error) {
            next(new InternalServerErrException());
        }
    }

    async get(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            const {id} = req.params;
            await Book.findOne({_id: id}, '-__v')
                .exec()
                .then((result) => {
                    if (result) {
                        resp.status(200).send(responseSuccess(result));
                        return;
                    }
                    next(new NotFoundException('Buku tidak ditemukan'));
                })
                .catch((error) => {
                    throw error;
                });
        } catch (error) {
            next(new InternalServerErrException());
        }
    }

    async getByCategory(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            const {id} = req.params;
            const books = await Book.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [{$in: [id, '$id_category']}],
                        },
                    },
                },
                {
                    $project: {
                        title: '$title',
                        author: '$author',
                        year: '$year',
                        imgUrl: '$imgUrl',
                    },
                },
            ]);
            if (!books.length) {
                next(new NotFoundException('Buku tidak ditemukan'));
                return;
            }
            resp.status(200).send(responseSuccess(books));
        } catch (error) {
            next(new InternalServerErrException());
        }
    }

    async delete(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            const {id} = req.params;
            await Book.findOneAndDelete({_id: id})
                .exec()
                .then((result) => {
                    if (result) {
                        const imgPath = result.pdfUrl?.split('/');
                        const pdfPath = result.imgUrl?.split('/');
                        const imgLink = imgPath?.splice(3, imgPath.length)?.join('/');
                        const pdfLink = pdfPath?.splice(3, pdfPath.length)?.join('/');
                        if (imgLink) unlinkSync(imgLink);
                        if (pdfLink) unlinkSync(pdfLink);
                        resp.status(200).send(responseSuccess(null));
                        return;
                    }
                    next(new NotFoundException('Buku tidak ditemukan'));
                })
                .catch((error) => {
                    throw error;
                });
        } catch (error) {
            next(new InternalServerErrException());
        }
    }
}

export default new BookController();
