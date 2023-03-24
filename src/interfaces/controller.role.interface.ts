import {NextFunction, Request, Response} from 'express';

interface IRoleController {
    getAll(req: Request, resp: Response, next: NextFunction): Promise<void>;
}

export default IRoleController;
