import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export type Role = "user" | "hr" | "superadmin";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & { id?: string; role?: Role };
}

const buildUnauthorized = (message: string = "Unauthorized"): { status: number; body: object } => ({
  status: 401,
  body: { message },
});

const buildForbidden = (message: string = "Forbidden"): { status: number; body: object } => ({
  status: 403,
  body: { message },
});

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const { status, body } = buildUnauthorized("Unauthorized: No token provided");
    res.status(status).json(body);
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded as AuthenticatedRequest["user"];
    next();
    return;
  } catch (err) {
    const { status, body } = buildUnauthorized("Unauthorized: Invalid or expired token");
    res.status(status).json(body);
    return;
  }
};

export const maybeAuthenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  /**
   * Optional auth helper that:
   * - Attaches req.user when a **valid** token exists
   * - Does **not** block anonymous requests
   * - Treats missing or invalid tokens as "guest" (no 401), which is ideal for
   *   public pages like Browse Jobs that should work for everyone.
   */
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // No usable auth header → continue as anonymous/guest
    next();
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded as AuthenticatedRequest["user"];
  } catch (err) {
    // Invalid/expired token → log and continue as guest instead of blocking
    console.warn("maybeAuthenticate: invalid or expired token, continuing as guest");
  }

  next();
};

export const requireRole =
  (roles: Role[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      const { status, body } = buildUnauthorized("Unauthorized: No token provided");
      res.status(status).json(body);
      return;
    }

    if (!roles.includes(req.user.role as Role)) {
      const { status, body } = buildForbidden(`Forbidden: Requires role ${roles.join(", ")}`);
      res.status(status).json(body);
      return;
    }

    next();
  };