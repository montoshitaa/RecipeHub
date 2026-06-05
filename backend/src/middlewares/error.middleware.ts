import { Request, Response, NextFunction } from 'express';

interface AppError {
  type?: string;
  statusCode?: number;
  message?: string;
}

const notFound = (req: Request, res: Response): void => {
  res.status(404).json({ message: 'Route not found' });
};

const errorHandler = (error: AppError, req: Request, res: Response, next: NextFunction): void => {
  if (error.type === 'entity.parse.failed') {
    res.status(400).json({ message: 'Invalid JSON body' });
    return;
  }

  const statusCode =
    Number.isInteger(error.statusCode) && error.statusCode! >= 400 && error.statusCode! < 600
      ? error.statusCode!
      : 500;

  if (statusCode === 500) {
    res.status(500).json({ message: 'Internal server error' });
    return;
  }

  res.status(statusCode).json({ message: error.message || 'Request failed' });
};

export { notFound, errorHandler };
