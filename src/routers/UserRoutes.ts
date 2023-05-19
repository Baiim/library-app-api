import BaseRouter from './BaseRouter';
import UploadFile from '../middlewares/multer.middleware';
import DuplicateEmail from '../middlewares/duplicateEmail.middleware';
import UserController from '../controllers/UserController';
import NotAllowedController from '../controllers/NotAllowedController';
import AuthMiddleware from '../middlewares/auth.middleware';
import verifyUser from '../middlewares/verifyUser.middleware';
import roleMiddleware from '../middlewares/role.middleware';

class UserRoutes extends BaseRouter {
    routes(): void {
        const authJwt = AuthMiddleware.verifyAccessToken;
        const authRefreshToken = AuthMiddleware.verifyRefreshToken;

        this.router.post(
            '/users/register',
            [new UploadFile('users').uploadSingle(), DuplicateEmail],
            UserController.register
        );
        this.router.post('/users/login', UserController.login);
        this.router.get('/users', authJwt, UserController.getAll);

        this.router.put('/user/:id', [authJwt, new UploadFile('users').uploadSingle()], UserController.update);
        this.router.get('/user/:id', authJwt, UserController.get);
        this.router.delete('/user/:id', authJwt, UserController.delete);

        this.router.get('/refreshToken', authRefreshToken, UserController.refreshToken);
        this.router.put(
            '/user-verify/:id',
            [authJwt, roleMiddleware.verifySuperAdmin, verifyUser],
            UserController.update
        );
        this.router.post('users/logout', UserController.logout);

        //Error 405 handling
        this.router.all('/users/register', NotAllowedController.error);
        this.router.all('/users/login', NotAllowedController.error);
        this.router.all('/users/logout', NotAllowedController.error);
        this.router.all('/users', NotAllowedController.error);
        this.router.all('/user/:id', NotAllowedController.error);
        this.router.all('/refreshToken', NotAllowedController.error);
        this.router.all('/user-verify/:id', NotAllowedController.error);
    }
}

export default UserRoutes;
