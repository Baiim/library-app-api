import {NextFunction, Request, Response} from 'express';

interface IBook {
    create(req: Request, resp: Response, next: NextFunction): Promise<void>;
    update(req: Request, resp: Response, next: NextFunction): Promise<void>;
    getMostPicked(req: Request, resp: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, resp: Response, next: NextFunction): Promise<void>;
    get(req: Request, resp: Response, next: NextFunction): Promise<void>;
    getByCategory(req: Request, resp: Response, next: NextFunction): Promise<void>;
    delete(req: Request, resp: Response, next: NextFunction): Promise<void>;
}

export default IBook;
