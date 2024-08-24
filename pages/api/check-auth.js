import { verifyToken } from "@/lib/auth";// You'll need to implement this

export default async function handler(req, res) {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ isAuthenticated: false });
  }

  try {
    await verifyToken(token);
    res.status(200).json({ isAuthenticated: true });
  } catch (error) {
    res.status(401).json({ isAuthenticated: false });
  }
}