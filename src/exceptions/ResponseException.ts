import HttpException from './HttpException';

enum HttpCode {
    OK = 200,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    NOT_FOUND = 404,
    NOT_ALLOWED = 405,
    INTERNAL_SERVER_ERROR = 500,
}

class AuthenticationTokenException extends HttpException {
    constructor(message?: string) {
        super(HttpCode.UNAUTHORIZED, message ?? 'Autentikasi token tidak valid');
    }
}

class WrongCredentialsException extends HttpException {
    constructor() {
        super(HttpCode.UNAUTHORIZED, 'Wrong credentials provided');
    }
}

class NotAllowedException extends HttpException {
    constructor() {
        super(HttpCode.NOT_ALLOWED, 'Method not allowed');
    }
}

class NotFoundException extends HttpException {
    constructor(message?: string) {
        super(HttpCode.NOT_FOUND, message ?? 'Not Found');
    }
}

class DuplicateEmailException extends HttpException {
    constructor() {
        super(HttpCode.BAD_REQUEST, 'Email telah terdaftar, silahkan gunakan email lain');
    }
}

class BadRequestException extends HttpException {
    constructor(message: string) {
        super(HttpCode.BAD_REQUEST, message);
    }
}

class InternalServerErrException extends HttpException {
    constructor(message?: string) {
        super(HttpCode.INTERNAL_SERVER_ERROR, message ?? 'Intenal server error');
    }
}

export {
    AuthenticationTokenException,
    BadRequestException,
    DuplicateEmailException,
    NotFoundException,
    InternalServerErrException,
    NotAllowedException,
    WrongCredentialsException,
};
