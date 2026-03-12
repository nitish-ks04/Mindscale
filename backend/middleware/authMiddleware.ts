import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/user.js";

interface JwtPayload {
  id: string;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Bypass authentication for running without login page
  try {
    const user = await User.findOne();
    if (user) {
      req.user = user as IUser;
    } else {
      req.user = {
        _id: "dummy123",
        name: "Guest User",
        email: "guest@example.com",
        isAdmin: false,
      } as unknown as IUser;
    }
    return next();
  } catch (err) {
    req.user = {
      _id: "dummy123",
      name: "Guest User",
      email: "guest@example.com",
      isAdmin: false,
    } as unknown as IUser;
    return next();
  }
};
