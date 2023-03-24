import {Error} from 'mongoose';
import config, {IConfig} from './config';

const baseUrl = config(process.env.NODE_ENV as keyof IConfig).API_BASE_URl;

type ErrorWithData = {
    name: string;
    errors: {
        [key: string]: {
            message: string;
        };
    };
};
type ErrorWithMessage = {
    name: string;
    message: string;
};

class Helper {
    /** Utility for generating local time stamp */
    public generateTimeStamp(): Date {
        const current = new Date();
        const timeStamp = new Date(
            Date.UTC(
                current.getFullYear(),
                current.getMonth(),
                current.getDate(),
                current.getHours(),
                current.getMinutes(),
                current.getSeconds(),
                current.getMilliseconds()
            )
        );
        return timeStamp;
    }

    /** Utility for generate assets path */
    public getAssetPath(directory: string, reqFile?: Express.Multer.File | undefined) {
        return `${baseUrl}/public/assets/${directory}/${reqFile?.filename}`;
    }

    public getAssetDir(url?: string) {
        const path = url?.split('/');
        return path?.splice(3, path.length)?.join('/');
    }

    /** Utility to get string today date */
    public getTodayDate() {
        let today = '';
        const date = new Date();
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
        const yyyy = date.getFullYear();

        today = `${yyyy}-${mm}-${dd}`;
        return today;
    }

    /** Utility for get differance between two date */
    public getDiffDay(dateFrom: string, dateTo: string) {
        const date1 = new Date(dateFrom);
        const date2 = new Date(dateTo);
        const diffTime = Math.abs((date2 as unknown as number) - (date1 as unknown as number));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    /** Check if error data is object and have name and errors data from mongoose validation */
    private isErrorWithData(error: unknown): error is ErrorWithData {
        return (
            typeof error === 'object' &&
            error !== null &&
            typeof (error as Record<string, unknown>).name === 'string' &&
            typeof (error as Record<string, unknown>).errors === 'object'
        );
    }

    /** Check if error data have message */
    private isErrorWithMessage(error: unknown): error is ErrorWithMessage {
        return (
            typeof error === 'object' &&
            error !== null &&
            'message' in error &&
            typeof (error as Record<string, unknown>).message === 'string'
        );
    }

    /** Return error data ErrorWithMessage */
    private toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
        if (this.isErrorWithMessage(maybeError)) return maybeError;

        try {
            return new Error(JSON.stringify(maybeError));
        } catch {
            // fallback in case there's an error stringifying the maybeError
            // like with circular references for example.
            return new Error(String(maybeError));
        }
    }

    /** Handle error data */
    public getErrorData(errorData: unknown): {name: string; error: Array<string>} | undefined {
        const errors: Array<string> = [];

        if (!this.isErrorWithData(errorData)) {
            const err = this.toErrorWithMessage(errorData);
            errors.push(err.message);
            return {name: err.name, error: errors.length ? errors : ['']};
        }

        if (errorData?.name === 'ValidationError') {
            Object.keys(errorData.errors).forEach((key) => {
                errors.push(errorData.errors[key].message);
            });
            return {name: errorData.name, error: errors.length ? errors : ['']};
        }
    }

    /** Check if there is an error when update data to database */
    public checkError(error: Error.ValidationError | null) {
        if (error?.name === 'ValidationError') {
            const errorsKey = Object.keys(error.errors);
            const newError: Error.ValidationError = {
                name: 'ValidationError',
                errors: {},
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                addError: function (_path: string, _error: Error.ValidatorError | Error.CastError): void {
                    throw new Error('Function not implemented.');
                },
                message: '',
            };

            for (let i = 0; i < errorsKey.length; i++) {
                if (error.errors[errorsKey[i]].value) {
                    newError.errors = {
                        [errorsKey[i]]: {
                            ...error.errors[errorsKey[i]],
                            message: error.errors[errorsKey[i]].message,
                        },
                    };
                    return newError;
                }

                if (error.errors[errorsKey[i]].value === '') {
                    newError.errors = {
                        [errorsKey[i]]: {
                            ...error.errors[errorsKey[i]],
                            message: error.errors[errorsKey[i]].message,
                        },
                    };
                    return newError;
                }
            }
        }
        return null;
    }

    /** Get the error message */
    public getErrorMessage(error: unknown) {
        return this.toErrorWithMessage(error).message;
    }

    public logger(error: unknown) {
        const errInfo = `\x1b[33m[Error Log]: ==> \x1b[31m${this.getErrorMessage(error)}`;
        // eslint-disable-next-line no-console
        console.log('');
        // eslint-disable-next-line no-console
        console.log(errInfo);
        // eslint-disable-next-line no-console
        console.log('');
        return this.toErrorWithMessage(error).message;
    }
}

export default new Helper();
