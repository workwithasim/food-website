import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus
} from "@nestjs/common";
import { Response, Request } from "express";
import { ApiErrorResponse } from "@restaurant/contracts";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as Record<string, unknown>)?.message || exception.message
        : "Internal server error";

    const errorResponse: ApiErrorResponse = {
      error: {
        code:
          exception instanceof HttpException
            ? `HTTP_${status}`
            : "INTERNAL_SERVER_ERROR",
        message: Array.isArray(message) ? message.join("; ") : String(message),
        requestId: (request.headers["x-request-id"] as string) || undefined
      }
    };

    response.status(status).json(errorResponse);
  }
}
