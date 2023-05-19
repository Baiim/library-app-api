import {NextFunction, Request, Response} from 'express';

export interface IUserController {
    register(req: Request, resp: Response, next: NextFunction): Promise<void>;
    login(req: Request, resp: Response, next: NextFunction): Promise<void>;
    logout(req: Request, resp: Response, next: NextFunction): void;
    update(req: Request, resp: Response, next: NextFunction): Promise<void>;
    delete(req: Request, resp: Response, next: NextFunction): Promise<void>;
    get(req: Request, resp: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, resp: Response, next: NextFunction): Promise<void>;
    refreshToken(req: Request, resp: Response, next: NextFunction): Promise<void>;
}
