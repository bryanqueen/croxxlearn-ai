export default function handler(req, res) {
    res.setHeader(
      'Set-Cookie',
      'authToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict'
    );
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  }