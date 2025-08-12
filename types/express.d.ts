import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        // Add other user properties you need
      };
    }
  }
}

export interface DecodedToken extends JwtPayload {
  id: string;
}