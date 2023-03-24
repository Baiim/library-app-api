import BaseRouter from './BaseRouter';
import NewsController from '../controllers/NewsController';
import authMiddleware from '../middlewares/auth.middleware';
import UploadFile from '../middlewares/multer.middleware';
import NotAllowedController from '../controllers/NotAllowedController';

class NewsRoutes extends BaseRouter {
    routes(): void {
        const authJwt = authMiddleware.verifyAccessToken;

        this.router.post('/news', [authJwt, new UploadFile('news').uploadSingle()], NewsController.create);
        this.router.get('/news', NewsController.get);
        this.router.put('/news/:id', [authJwt, new UploadFile('news').uploadSingle()], NewsController.update);
        this.router.delete('/news/:id', authJwt, NewsController.delete);

        //Handle 405 error
        this.router.all('/news', NotAllowedController.error);
        this.router.all('/news/:id', NotAllowedController.error);
    }
}

export default NewsRoutes;
