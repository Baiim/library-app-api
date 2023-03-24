import mongoose, {Document, Model, Schema} from 'mongoose';
import Helper from '../utils/Helper';

type BookmarkDocument = Document & {
    book: Array<{title: string; author: string; imgUrl: string; borrowAmount: number}>;
    id_user: string;
};

type BookmarkInput = {
    book: BookmarkDocument['book'];
    id_user: BookmarkDocument['id_user'];
};

const bookmarkScheme = new Schema(
    {
        book: {
            type: Schema.Types.Array,
            required: [true, 'Data buku harus diisi'],
        },
        id_user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'ID user harus diisi'],
            index: true,
            unique: true,
        },
    },
    {
        collection: 'bookmark',
        timestamps: {currentTime: () => Helper.generateTimeStamp()},
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    }
);

const Bookmark: Model<BookmarkDocument> = mongoose.model<BookmarkDocument>('Bookmark', bookmarkScheme);

export {BookmarkDocument, BookmarkInput};

export default Bookmark;
