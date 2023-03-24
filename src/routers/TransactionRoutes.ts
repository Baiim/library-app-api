import BaseRouter from './BaseRouter';
import NotAllowedController from '../controllers/NotAllowedController';
import TransactionController from '../controllers/TransactionController';
import authMiddleware from '../middlewares/auth.middleware';
import UploadFile from '../middlewares/multer.middleware';

class TransactionRoutes extends BaseRouter {
    routes(): void {
        const authJwt = authMiddleware.verifyAccessToken;

        this.router.post('/transaction', authJwt, TransactionController.create);
        this.router.put(
            '/transaction/:id',
            [authJwt, new UploadFile('transactions').uploadSingle()],
            TransactionController.returnTransaction
        );
        this.router.get('/transactions', authJwt, TransactionController.getAll);
        this.router.get('/transaction/:id', authJwt, TransactionController.get);

        //Error 405 handling
        this.router.all('/transaction', NotAllowedController.error);
        this.router.all('/transactions', NotAllowedController.error);
        this.router.all('/transaction/id', NotAllowedController.error);
    }
}

export default TransactionRoutes;
