
import jwt from 'jsonwebtoken';

export function verifyToken(token) {
    console.log('Verifying token in verifyToken function');
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          console.error('Token verification failed:', err);
          return reject(err);
        }
        console.log('Token verified successfully');
        resolve(decoded);
      });
    });
  }