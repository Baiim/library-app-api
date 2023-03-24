import {Request, Response, NextFunction} from 'express';
import {BadRequestException, InternalServerErrException} from '../exceptions/ResponseException';
import ITransaction from '../interfaces/controller.transaction.interface';
import Book from '../models/BookModel';
import Transaction, {TransactionInput} from '../models/TransactionModel';
import Helper from '../utils/Helper';
import responseSuccess from '../utils/responseSuccess';

class TransactionController implements ITransaction {
    async create(req: Request, resp: Response, next: NextFunction): Promise<void> {
        const session = await Book.startSession();
        session.startTransaction();

        try {
            const transactionInput: TransactionInput = req.body;
            transactionInput.id_transaction = Math.floor(1000000 + Math.random() * 90000000).toString();

            const date1 = new Date(transactionInput.dateFrom);
            const date2 = new Date(transactionInput.dateTo);
            const diffTime = Math.abs((date2 as unknown as number) - (date1 as unknown as number));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 32) {
                next(new BadRequestException('Waktu peminjaman buku tidak boleh lebih dari 1 bulan'));
                return;
            }

            const transaction = new Transaction(transactionInput);
            await Book.findOneAndUpdate(
                {_id: transactionInput.id_book},
                {$inc: {borrowAmount: 1, available: -1}},
                {session}
            );
            await transaction.save();
            await session.commitTransaction();
            session.endSession();
            resp.status(200).send(responseSuccess());
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            const errorData = Helper.getErrorData(error);
            if (errorData?.name === 'ValidationError') {
                next(new BadRequestException(errorData.error[0]));
                return;
            }
            next(new InternalServerErrException());
        }
    }

    async returnTransaction(req: Request, resp: Response, next: NextFunction): Promise<void> {
        const session = await Transaction.startSession();
        session.startTransaction();

        try {
            const {id} = req.params;
            let returnImgUrl, penaltyDesc;
            let penalty = 0;
            const returnDate = new Date(Helper.getTodayDate());

            if (req.file) {
                returnImgUrl = Helper.getAssetPath('transactions', req.file);
            }
            const transaction = await Transaction.findOne({_id: id}, 'dateTo id_book');
            if (returnDate > (transaction?.dateTo as Date)) {
                penalty = 50000;
                penaltyDesc = 'Denda karena telat mengembalikan buku';
            }

            const result = await Transaction.findOneAndUpdate(
                {_id: id},
                {penalty, penaltyDesc, returnDate, returnImgUrl},
                {session}
            );
            if (!result) {
                throw new Error('notfound');
            }
            await Book.findOneAndUpdate({_id: result.id_book}, {$inc: {available: 1}});
            await session.commitTransaction();
            session.endSession();
            resp.status(200).send(responseSuccess());
        } catch (error) {
            const message = Helper.getErrorMessage(error);
            await session.abortTransaction();
            session.endSession();

            if (message === 'notfound') {
                next(new BadRequestException('Transaksi tidak ditemukan'));
                return;
            }
            next(new InternalServerErrException());
        }
    }

    async getAll(req: Request, resp: Response, next: NextFunction): Promise<void> {
        try {
            const {page = 1, limit = 10} = req.query;
            const transactions = await Transaction.aggregate([
                {
                    //Populate data book
                    $lookup: {
                        from: 'book',
                        let: {bookId: '$id_book'},
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [{$eq: ['$_id', '$$bookId']}],
                                    },
                                },
                            },
                            {
                                //Populate category book from data book
                                $lookup: {
                                    from: 'category',
                                    let: {
                                        categoryId: {
                                            //Mapping the array of id_category and convert to ObjectId
                                            $map: {
                                                input: '$id_category',
                                                as: 'category',
                                                in: {$toObjectId: '$$category'},
                                            },
                                        },
                                    },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [{$in: ['$_id', '$$categoryId']}],
                                                },
                                            },
                                        },
                                    ],
                                    as: 'category',
                                },
                            },
                            {
                                //Getting only string name category and save it to new field called categories
                                $addFields: {
                                    categories: {$map: {input: '$category', in: '$$this.name'}},
                                },
                            },
                            {
                                //Select the field only needed
                                $project: {
                                    title: '$title',
                                    author: '$author',
                                    imgUrl: '$imgUrl',
                                    categories: '$categories',
                                },
                            },
                            //don't show _id in response
                            {$unset: ['_id']},
                        ],
                        as: 'book',
                    },
                },
                //convert array from $lookup to object
                {$unwind: '$book'},
                {
                    /**
                     * Calculate the due date and save the value to dueDate field
                     * formula => Math.round(dateTo - today / 86400000)
                     */
                    $addFields: {
                        dueDate: {
                            $round: {
                                $divide: [{$subtract: ['$dateTo', new Date()]}, 86400000],
                            },
                        },
                    },
                },
                //remove the data not needs in the response
                {$unset: ['id_user', 'id_book', 'dateFrom', 'dateTo', 'createdAt', 'updatedAt', '__v']},
                {
                    //Handle pagination
                    $facet: {
                        data: [{$skip: ((page as number) - 1) * (limit as number)}, {$limit: (limit as number) * 1}],
                    },
                },
                {$sort: {createdAt: -1}},
            ]).exec();
            const count = await Book.countDocuments();
            resp.status(200).send(
                responseSuccess({
                    content: transactions?.[0]?.data ?? [],
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
            const result = await Transaction.findOne({_id: id})
                .select('-__v')
                .populate('id_book', 'title author publisher year pageSize imgUrl -_id')
                .populate({
                    path: 'id_user',
                    select: 'id_number name email phoneNumber id_role -_id',
                    populate: {
                        path: 'id_role',
                        select: '-createdAt -updatedAt -__v -_id',
                    },
                });
            if (!result) {
                next(new BadRequestException('Transaksi tidak dtemukan'));
                return;
            }
            resp.status(200).send(responseSuccess(result));
        } catch (error) {
            next(new InternalServerErrException());
        }
    }
}

export default new TransactionController();
