import { Request, Response, NextFunction } from 'express';

const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  const cookieToken = req.cookies?.csrfToken as string | undefined;

  if (!cookieToken) {
    next();
    return;
  }

  const headerToken = req.headers['x-csrf-token'] as string | undefined;

  if (!headerToken || headerToken !== cookieToken) {
    res.status(403).json({ message: 'Invalid CSRF token' });
    return;
  }

  next();
};

export { csrfProtection };
