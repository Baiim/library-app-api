import mongoose, {Document, Model, Schema} from 'mongoose';
import bcrypt from 'bcryptjs';
import Helper from '../utils/Helper';

enum gender {
    Male = 'male',
    Female = 'female',
}

type UserDocument = Document & {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    gender: gender;
    imgUrl: string;
    verified: boolean;
    id_number: string;
    id_role: string;
    bookmark: Array<{title: string; author: string; imgUrl: string; borrowAmount: number}>;
    comparePassword(password: string, next: (err: Error | null, same: boolean | null) => void): void;
};

type UserInput = {
    name: UserDocument['name'];
    email: UserDocument['email'];
    password: UserDocument['password'];
    phoneNumber: UserDocument['phoneNumber'];
    gender: UserDocument['gender'];
    imgUrl: UserDocument['imgUrl'];
    verified: UserDocument['verified'];
    id_number: UserDocument['id_number'];
    id_role: UserDocument['id_role'];
    bookmark: UserDocument['bookmark'];
};

const phoneValidators = [
    {
        validator: function (v: string) {
            return v.length > 9;
        },
        msg: 'Nomor HP tidak kurang dari 9 digit',
    },
    {
        validator: function (v: string) {
            return v.length < 15;
        },
        msg: 'Nomor HP tidak lebih dari 15 digit',
    },
    {
        validator: function (v: string) {
            return /^[0-9]+$/.test(v);
        },
        msg: 'Nomor HP tidak valid',
    },
];

const userSchema = new Schema(
    {
        name: {
            type: Schema.Types.String,
            required: [true, 'Nama harus diisi'],
        },
        email: {
            type: Schema.Types.String,
            unique: true,
            maxlength: 100,
            trim: true,
            validate: {
                validator: function (v: string) {
                    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
                },
                message: 'Email tidak valid, silahkan isi alamat email yang valid',
            },
        },
        password: {
            type: Schema.Types.String,
            required: [true, 'Password harus diisi'],
            minlength: [8, 'Password minimal 8 karakter'],
        },
        phoneNumber: {
            type: Schema.Types.String,
            required: [true, 'Nama harus diisi'],
            validate: phoneValidators,
        },
        gender: {
            type: Schema.Types.String,
            required: [true, 'Gender harus diisi'],
        },
        imgUrl: {
            type: Schema.Types.String,
            required: false,
        },
        verified: {
            type: Schema.Types.Boolean,
            required: [true, 'Verifikasi harus diisi'],
        },
        id_number: {
            type: Schema.Types.String,
            required: [true, 'NIM/NIDN harus diisi'],
            index: true,
            unique: true,
        },
        id_role: {
            type: Schema.Types.String,
            required: [true, 'ID role harus diisi'],
            ref: 'Role',
            index: false,
            unique: false,
        },
        bookmark: {
            type: Schema.Types.Array,
            required: false,
            default: [],
        },
    },
    {
        collection: 'users',
        timestamps: {currentTime: () => Helper.generateTimeStamp()},
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    }
);

userSchema.pre('save', function (this: UserDocument, next: (err?: Error | undefined) => void) {
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, (saltError, salt) => {
            if (saltError) {
                return next(saltError);
            } else {
                bcrypt.hash(this.password, salt, (hashError: Error, hash: string) => {
                    if (hashError) return next(hashError);
                    this.password = hash;
                    next();
                });
            }
        });
    } else next();
});

userSchema.methods.comparePassword = function (
    password: string,
    next: (err: Error | null, same: boolean | null) => void
) {
    bcrypt.compare(password, this.password, function (err: Error, isMatch: boolean) {
        if (err) return next(err, null);
        return next(null, isMatch);
    });
};

const User: Model<UserDocument> = mongoose.model<UserDocument>('User', userSchema);

export {UserDocument, UserInput};

export default User;
