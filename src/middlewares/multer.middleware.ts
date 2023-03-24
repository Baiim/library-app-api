import path from 'path';
import {Request} from 'express';
import multer, {StorageEngine, FileFilterCallback} from 'multer';

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

class UploadFile {
    private storage: StorageEngine;

    constructor(storagePath = '') {
        this.storage = this.initializeStorage(storagePath);
    }

    private initializeStorage(storagePath: string) {
        return multer.diskStorage({
            destination: (req: Request, file: Express.Multer.File, cb: DestinationCallback) => {
                cb(null, `public/assets/${storagePath}`);
            },
            filename: (req: Request, file: Express.Multer.File, cb: FileNameCallback) => {
                cb(null, Date.now() + path.extname(file.originalname));
            },
        });
    }

    private checkFileType(file: Express.Multer.File, cb: FileFilterCallback) {
        const fileTypes = /jpeg|jpg|png|gif|pdf/;
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);
        if (mimeType && extName) {
            return cb(null, true);
        } else {
            cb(null, false);
        }
    }

    public uploadSingle(fieldName = 'image') {
        return multer({
            storage: this.storage,
            // limits: { fileSize: 1000000 },
            fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
                this.checkFileType(file, cb);
            },
        }).single(fieldName);
    }

    public uploadMultiple(fieldName = 'image') {
        return multer({
            storage: this.storage,
            // limits: { fileSize: 1000000 },
            fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
                this.checkFileType(file, cb);
            },
        }).array(fieldName);
    }

    public uploads(fields: Array<{name: string; maxCount: number}>) {
        return multer({
            storage: this.storage,
            // limits: { fileSize: 1000000 },
            fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
                this.checkFileType(file, cb);
            },
        }).fields(fields);
    }
}

export default UploadFile;
