import BaseRouter from './BaseRouter';
import NotAllowedController from '../controllers/NotAllowedController';
import RatingController from '../controllers/RatingController';
import authMiddleware from '../middlewares/auth.middleware';

class RatingRoutes extends BaseRouter {
    routes(): void {
        this.router.post('/rating', authMiddleware.verifyAccessToken, RatingController.create);
        this.router.get('/ratings', RatingController.get);
        this.router.get('/rating-average/:id', RatingController.getRatingAverage);

        //Error 405 handling
        this.router.all('/rating', NotAllowedController.error);
        this.router.all('/ratings', NotAllowedController.error);
        this.router.all('/rating-average/:id', NotAllowedController.error);
    }
}

export default RatingRoutes;
