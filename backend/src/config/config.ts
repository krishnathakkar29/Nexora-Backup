import "dotenv/config";
const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = process.env.COOKIE_NAME!;

export { JWT_SECRET, COOKIE_NAME };
