
import { Constants } from "../constants/constant.js";
import jwt from 'jsonwebtoken';

const { JWT_SECRET } = Constants;

export const authenticateToken = (req, res, next) => {

    const token = req.headers['wg-api-key'];

    // console.log("apiKey ------- ", token)
    // console.log("hhhhhh ", apiKey)

    // if (req.headers['wg-mail']) {

    // const token = apiKey;
    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // return res.status(403).json({ error: "Invalid token" });
            return res.json({ error: "Invalid token" });

        }
        // req?.body?.wgEmail = user; // decoded payload
        // console.log("VERIFYING ------------WITH JWT EMAIL TOKEN-----------");

        next();
    })

    // } else {
    //     if (token !== JWT_SECRET) {
    //         return res.status(401).json({ error: 'Unauthorized' });
    //     }
    //     console.log("VERIFYING ------------STATIC TOKEN-----------");

    //     next();
    // }

}



export function isValidToken(token) {
    try {
        jwt.verify(token, JWT_SECRET); // verifies signature + expiry
        return true;
    } catch (err) {
        return false;
    }
}