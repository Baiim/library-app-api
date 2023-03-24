import {NextFunction, Request, Response} from 'express';

interface ICategory {
    create(req: Request, resp: Response, next: NextFunction): Promise<void>;
    update(req: Request, resp: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, resp: Response, next: NextFunction): Promise<void>;
    delete(req: Request, resp: Response, next: NextFunction): Promise<void>;
}

export default ICategory;
