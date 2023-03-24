import mongoose, {Document, Model, Schema} from 'mongoose';
import Helper from '../utils/Helper';

type BookStockDocumen = Document & {
    id_book: string;
    qty: number;
    borrowAmount: number;
};

type BookStockInput = {
    id_book: BookStockDocumen['id_book'];
    qty: BookStockDocumen['qty'];
    borrowAmount: BookStockDocumen['borrowAmount'];
};

const bookStockSchema = new Schema(
    {
        id_book: {
            type: Schema.Types.ObjectId,
            ref: 'Book',
            required: [true, 'ID Buku harus diisi'],
            index: true,
            unique: true,
        },
        qty: {
            type: Schema.Types.String,
            required: [true, 'Ketersediaan buku harus diisi'],
        },
        borrowAmount: {
            type: Schema.Types.String,
            required: [true, 'Jumlah dipeminjaman buku harus diisi'],
        },
    },
    {
        collection: 'book_stock',
        timestamps: {currentTime: Helper.generateTimeStamp},
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    }
);

const BookStock: Model<BookStockDocumen> = mongoose.model<BookStockDocumen>('BookStock', bookStockSchema);

export {BookStockDocumen, BookStockInput};

export default BookStock;
