import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {BadRequestException} from '../exceptions/ResponseException';
import Role from '../models/RoleModel';

interface DataPayload {
    role: string;
    aud: string;
}

function getRole(req: Request) {
    const bearerHeader = req.headers['authorization'];
    const bearerToken = bearerHeader?.split(' ')[1] as string;
    const payload = jwt.decode(bearerToken, {complete: true})?.payload as DataPayload;
    return payload.role;
}

class RoleMiddleware {
    public async verifySuperAdmin(req: Request, _res: Response, next: NextFunction) {
        const role = await Role.findOne({_id: getRole(req)}, 'code');
        if (role?.code === 0) {
            next();
            return;
        }
        next(new BadRequestException('User tidak memiliki akses perintah'));
    }

    /**
     * If role is Super Admin or role is Admin return true
     */
    public async verify(req: Request, _res: Response, next: NextFunction) {
        const role = await Role.findOne({_id: getRole(req)}, 'code');
        if (role?.code === 0 || role?.code === 1) {
            next();
            return;
        }
        next(new BadRequestException('User tidak memiliki akses perintah'));
    }
}

export default new RoleMiddleware();
