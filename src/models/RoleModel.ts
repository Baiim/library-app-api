import mongoose, {Document, Model, Schema} from 'mongoose';
import Helper from '../utils/Helper';

enum codes {
    SuperAdmin = 0,
    Admin,
    Member,
}

type RoleDocument = Document & {
    code: codes;
    desc: string;
};

type RoleInput = Document & {
    code: RoleDocument['code'];
    desc: RoleDocument['desc'];
};

const roleSchema = new Schema(
    {
        code: {
            type: Schema.Types.Number,
            required: [true, 'Nama category harus diisi'],
        },
        desc: {
            type: Schema.Types.String,
            required: [true, 'Nama category harus diisi'],
        },
    },
    {
        collection: 'role',
        timestamps: {currentTime: () => Helper.generateTimeStamp()},
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    }
);

const Role: Model<RoleDocument> = mongoose.model<RoleDocument>('Role', roleSchema);

export {RoleDocument, RoleInput};

export default Role;
