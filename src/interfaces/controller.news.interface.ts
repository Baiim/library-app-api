import {NextFunction, Request, Response} from 'express';

interface INews {
    create(req: Request, resp: Response, next: NextFunction): Promise<void>;
    get(req: Request, resp: Response, next: NextFunction): Promise<void>;
    update(req: Request, resp: Response, next: NextFunction): Promise<void>;
    delete(req: Request, resp: Response, next: NextFunction): Promise<void>;
}

export default INews;
