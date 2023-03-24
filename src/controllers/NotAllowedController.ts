import {NextFunction, Request, Response} from 'express';
import {NotAllowedException} from '../exceptions/ResponseException';

interface INotAllowed {
    error(req: Request, resp: Response, next: NextFunction): void;
}

class NotAllowedController implements INotAllowed {
    error(_req: Request, _resp: Response, next: NextFunction): void {
        next(new NotAllowedException());
    }
}

export default new NotAllowedController();
