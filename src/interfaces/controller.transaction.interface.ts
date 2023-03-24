import {NextFunction, Request, Response} from 'express';

interface ITransaction {
    create(req: Request, resp: Response, next: NextFunction): Promise<void>;
    returnTransaction(req: Request, resp: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, resp: Response, next: NextFunction): Promise<void>;
    get(req: Request, resp: Response, next: NextFunction): Promise<void>;
}

export default ITransaction;
