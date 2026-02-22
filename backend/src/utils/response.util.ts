import { Response } from "express";

/**
 * Standardized API Response Structure
 */
interface IApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: any;
}

export class ApiResponse {
    /**
     * Send a success response
     * @param res Express Response object
     * @param message Human-readable message
     * @param data Optional data payload
     * @param statusCode HTTP status code (default: 200)
     */
    static success<T>(
        res: Response,
        message: string,
        data?: T,
        statusCode: number = 200
    ): Response {
        const response: IApiResponse<T> = {
            success: true,
            message,
            data,
        };
        return res.status(statusCode).json(response);
    }

    /**
     * Send an error response
     * @param res Express Response object
     * @param message Human-readable error message
     * @param error Optional error details (object, string, etc.)
     * @param statusCode HTTP status code (default: 500)
     */
    static error(
        res: Response,
        message: string,
        error?: any,
        statusCode: number = 500
    ): Response {
        const response: IApiResponse<null> = {
            success: false,
            message,
            error,
        };
        return res.status(statusCode).json(response);
    }
}
