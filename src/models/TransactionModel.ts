import mongoose, {Document, Model, Schema} from 'mongoose';
import Helper from '../utils/Helper';

type TransactionDocument = Document & {
    id_transaction: string;
    id_user: string;
    id_book: string;
    dateFrom: Date;
    dateTo: Date;
    returnDate: Date;
    returnImgUrl: string;
    penalty: number;
    penaltyDesc: string;
};

type TransactionInput = {
    id_transaction: TransactionDocument['id_transaction'];
    id_user: TransactionDocument['id_user'];
    id_book: TransactionDocument['id_book'];
    dateFrom: TransactionDocument['dateFrom'];
    dateTo: TransactionDocument['dateTo'];
    returnDate: TransactionDocument['returnDate'];
    returnImgUrl: TransactionDocument['returnImgUrl'];
    penalty: TransactionDocument['penalty'];
    penaltyDesc: TransactionDocument['penaltyDesc'];
};

const transactionSchema = new Schema(
    {
        id_transaction: {
            type: Schema.Types.String,
            required: [true, 'ID transaksi harus diisi'],
        },
        id_user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'ID user harus diisi'],
            index: false,
            unique: false,
        },
        id_book: {
            type: Schema.Types.ObjectId,
            ref: 'Book',
            required: [true, 'ID buku harus diisi'],
            index: false,
            unique: false,
        },
        dateFrom: {
            type: Schema.Types.Date,
            required: [true, 'Tanggal peminjaman buku harus diisi'],
        },
        dateTo: {
            type: Schema.Types.Date,
            required: [true, 'Tanggal pemulangan buku harus diisi'],
        },
        returnDate: {
            type: Schema.Types.Date,
            required: false,
        },
        returnImgUrl: {
            type: Schema.Types.String,
            required: false,
        },
        penalty: {
            type: Schema.Types.Number,
            required: false,
        },
        penaltyDesc: {
            type: Schema.Types.String,
            required: false,
        },
    },
    {
        collection: 'transaction',
        timestamps: {currentTime: () => Helper.generateTimeStamp()},
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    }
);

const Transaction: Model<TransactionDocument> = mongoose.model<TransactionDocument>('Transaction', transactionSchema);

export {TransactionDocument, TransactionInput};

export default Transaction;
