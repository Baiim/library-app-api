import mongoose, {Document, Model, Schema} from 'mongoose';
import Helper from '../utils/Helper';

type RatingDocumen = Document & {
    size: number;
    comment: string;
    name: string;
    id_book: string;
};

type RatingInput = {
    size: RatingDocumen['size'];
    comment: RatingDocumen['comment'];
    name: RatingDocumen['name'];
    id_book: RatingDocumen['id_book'];
};

const ratingSchema = new Schema(
    {
        size: {
            type: Schema.Types.Number,
            required: [true, 'Rating harus diisi'],
            validate: {
                validator: function (v: number) {
                    return v < 5;
                },
                message: 'Skor rating yang diberikan maksimum 5',
            },
        },
        comment: {
            type: Schema.Types.String,
            required: false,
        },
        name: {
            type: Schema.Types.String,
            required: false,
        },
        id_book: {
            type: Schema.Types.ObjectId,
            ref: 'Book',
            required: [true, 'ID Buku harus diisi'],
            index: false,
            unique: false,
        },
    },
    {
        collection: 'rating',
        timestamps: {currentTime: () => Helper.generateTimeStamp()},
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    }
);

const Rating: Model<RatingDocumen> = mongoose.model<RatingDocumen>('Rating', ratingSchema);

export {RatingDocumen, RatingInput};

export default Rating;
