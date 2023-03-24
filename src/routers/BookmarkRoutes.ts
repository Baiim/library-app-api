import BaseRouter from './BaseRouter';
import BookmarkController from '../controllers/BookmarkController';
import NotAllowedController from '../controllers/NotAllowedController';
import authMiddleware from '../middlewares/auth.middleware';

class BookmarkRoutes extends BaseRouter {
    routes(): void {
        const authJwt = authMiddleware.verifyAccessToken;

        this.router.put('/bookmark/:id', authJwt, BookmarkController.addItem);
        this.router.get('/bookmark/:id', authJwt, BookmarkController.getAll);
        this.router.put('/remove-bookmark', authJwt, BookmarkController.removeItem);

        //Error 405 handling
        this.router.all('/bookmark/:id', NotAllowedController.error);
        this.router.all('/remove-bookmark', NotAllowedController.error);
    }
}

export default BookmarkRoutes;
