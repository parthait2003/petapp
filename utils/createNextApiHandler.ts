import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware } from '@/utils/runMiddleware';

export const createNextApiHandler = (middleware: any, handler: any) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await runMiddleware(req, res, middleware);
    await handler(req, res);
  };
};
