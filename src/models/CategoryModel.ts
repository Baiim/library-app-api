import mongoose, {Document, Model, Schema} from 'mongoose';
import Helper from '../utils/Helper';

type CategoryDocument = Document & {
    name: string;
};

type CategoryInput = Document & {
    name: CategoryDocument['name'];
};

const categoryScheme = new Schema(
    {
        name: {
            type: Schema.Types.String,
            required: [true, 'Nama category harus diisi'],
        },
    },
    {
        collection: 'category',
        timestamps: {currentTime: () => Helper.generateTimeStamp()},
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    }
);

const Category: Model<CategoryDocument> = mongoose.model<CategoryDocument>('Category', categoryScheme);

export {CategoryDocument, CategoryInput};

export default Category;
