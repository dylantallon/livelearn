import * as logger from "firebase-functions/logger";
import { Request, Response } from "express";

class RequestHandler {
  sendSuccess(res: Response, message?: string, status?: number) {
    logger.log(`A request has been made and proccessed successfully at: ${new Date()}`);
    
    return (data?: any, globalData?: any) => {
      if (!status) {
        status = 200;
      }
      res.status(status).json({
        type: 'success',
        message: message || 'Success result',
        data,
        ...globalData,
      });
    };
  }

  sendRedirect(res: Response, url: string) {
    logger.log(`A redirect has been made to ${url} at: ${new Date()}`);
    res.redirect(302, url);
  }

  sendClientError(req: Request, res: Response, message: string, status?: number) {
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    logger.log(`A request has been returned with client error: ${message}`, {url: url});

    return res.status(status || 400).json({
      type: 'error',
      message: message,
    });
  }

  sendServerError(req: Request, res: Response, message: string, status?: number) {
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    logger.error(message, {url: url});

    return res.status(status || 500).json({
      type: 'error',
      message: message || 'Unhandled server error',
    });
  }
}

export default RequestHandler;
