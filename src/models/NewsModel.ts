import mongoose, {Document, Model, Schema} from 'mongoose';
import Helper from '../utils/Helper';

type NewsDocument = Document & {
    title: string;
    desc: string;
    imgUrl: string;
    contentUrl: string;
};

type NewsInput = {
    title: NewsDocument['title'];
    desc: NewsDocument['desc'];
    imgUrl: NewsDocument['imgUrl'];
    contentUrl: NewsDocument['contentUrl'];
};

const newsSchema = new Schema(
    {
        title: {
            type: Schema.Types.String,
            required: [true, 'Judul artikel harus diisi'],
        },
        desc: {
            type: Schema.Types.String,
            required: [true, 'Deskripsi artikel harus diisi'],
        },
        imgUrl: {
            type: Schema.Types.String,
            required: false,
        },
        contentUrl: {
            type: Schema.Types.String,
            required: [true, 'Content url harus diisi'],
        },
    },
    {
        collection: 'news',
        timestamps: {currentTime: () => Helper.generateTimeStamp()},
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    }
);

const News: Model<NewsDocument> = mongoose.model<NewsDocument>('News', newsSchema);

export {NewsDocument, NewsInput};

export default News;
