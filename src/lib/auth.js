import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.WC_CONSUMER_SECRET;

export const getUserFromToken = (req) => {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return null;

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded?.data?.user?.id;
    } catch (err) {
        console.error("JWT verification failed:", err.message);
        return null;
    }
}