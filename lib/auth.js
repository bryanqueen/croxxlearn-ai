
import jwt from 'jsonwebtoken';

export function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('Token verification failed:', err);
        return reject(err);
      }
      console.log('Token verified successfully');
      resolve(decoded); // Return the entire decoded token
    });
  });
}