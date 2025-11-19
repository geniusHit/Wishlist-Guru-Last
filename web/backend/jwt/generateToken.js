import jwt from 'jsonwebtoken';
import { Constants } from '../constants/constant.js';

const { JWT_SECRET } = Constants;

export const generateToken = async (user) => {
    return jwt.sign(
        { id: user },
        JWT_SECRET
        // { expiresIn: "7h" }
    );
}
