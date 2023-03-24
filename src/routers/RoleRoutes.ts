import BaseRouter from './BaseRouter';
import NotAllowedController from '../controllers/NotAllowedController';
import authMiddleware from '../middlewares/auth.middleware';
import RoleController from '../controllers/RoleController';

class RoleRoutes extends BaseRouter {
    routes(): void {
        const authJwt = authMiddleware.verifyAccessToken;

        this.router.get('/roles', authJwt, RoleController.getAll);

        //Error 405 handling
        this.router.all('/roles', NotAllowedController.error);
    }
}

export default RoleRoutes;
