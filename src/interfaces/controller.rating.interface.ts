import {NextFunction, Request, Response} from 'express';

interface IRating {
    create(req: Request, resp: Response, next: NextFunction): Promise<void>;
    get(req: Request, resp: Response, next: NextFunction): Promise<void>;
    getRatingAverage(req: Request, resp: Response, next: NextFunction): Promise<void>;
}

export default IRating;
