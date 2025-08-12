import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { DecodedToken } from '../types/express'; // Adjust path as needed
dotenv.config();




export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token : string | undefined;
  
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string) as DecodedToken;
      
      // Add user to request
      req.user = { id: decoded.id };
      next();
    } catch (err) {
      res.status(401).json({ error: 'Not authorized, access token failed' });
    }
  }
  
  if (!token) {
    res.status(401).json({ error: 'Not authorized, no access token' });
  }
};