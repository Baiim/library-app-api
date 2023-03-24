import mongoose, {Document, Model, Schema} from 'mongoose';
import Helper from '../utils/Helper';

type BookDocument = Document & {
    title: string;
    synopsis: string;
    author: string;
    year: number;
    pageSize: number;
    publisher: string;
    imgUrl: string;
    pdfUrl: string;
    available: number;
    borrowAmount: number;
    id_category: Array<string>;
};

type BookInput = {
    title: BookDocument['title'];
    synopsis: BookDocument['synopsis'];
    author: BookDocument['author'];
    year: BookDocument['year'];
    pageSize: BookDocument['pageSize'];
    publisher: BookDocument['publisher'];
    imgUrl: BookDocument['imgUrl'];
    pdfUrl: BookDocument['pdfUrl'];
    available: BookDocument['available'];
    borrowAmount: BookDocument['borrowAmount'];
    id_category: BookDocument['id_category'];
};

const bookSchema = new Schema(
    {
        title: {
            type: Schema.Types.String,
            required: [true, 'Judul buku harus diisi'],
        },
        synopsis: {
            type: Schema.Types.String,
            required: false,
        },
        author: {
            type: Schema.Types.String,
            required: [true, 'Author buku harus diisi'],
        },
        year: {
            type: Schema.Types.Number,
            required: [true, 'Tahun buku harus diisi'],
        },
        pageSize: {
            type: Schema.Types.Number,
            required: false,
        },
        publisher: {
            type: Schema.Types.String,
            required: [true, 'Penerbit buku harus diisi'],
        },
        imgUrl: {
            type: Schema.Types.String,
            required: false,
        },
        pdfUrl: {
            type: Schema.Types.String,
            required: false,
        },
        available: {
            type: Schema.Types.Number,
            required: [true, 'Ketersediaan buku harus diisi'],
        },
        borrowAmount: {
            type: Schema.Types.Number,
            required: [true, 'Jumlah dipeminjaman buku harus diisi'],
        },
        id_category: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Category',
                required: false,
                index: false,
                unique: false,
            },
        ],
    },
    {
        collection: 'book',
        timestamps: {currentTime: () => Helper.generateTimeStamp()},
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    }
);

const Book: Model<BookDocument> = mongoose.model<BookDocument>('Book', bookSchema);

export {BookInput, BookDocument};
export default Book;
