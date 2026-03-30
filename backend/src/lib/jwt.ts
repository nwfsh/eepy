import jwt from "jsonwebtoken";
// token helpers

// these are long random string in .env , stamps only my server knows, making these tokens impossible to fake 
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

// creating a wristband 
export const signAccessToken = (userId: string) => 
    jwt.sign({ sub: userId}, ACCESS_SECRET, { expiresIn: "15m"}); // sub contains userID realise this 

// creating a backup wristband
export const signRefreshToken = (userId: string) =>
    jwt.sign({ sub: userId }, REFRESH_SECRET, { expiresIn: "7d" });

// check if wristband is real
export const verifyAccessToken = (token: string) => 
    jwt.verify(token, ACCESS_SECRET) as { sub: string};

// check if back up wristband is real
export const verifyRefreshToken = (token: string) =>
    jwt.verify(token, REFRESH_SECRET) as { sub: string};

// so when users login they get access token and refresh token 
// open app → refresh token still valid → get new access + new refresh token
// without the refresh token, after 15 mins, it boot you back to the login screen.
// access tokens are always travelling, so its easier to steal, so u want them short
// refresh tokens GIVES YOU a new access token
// refresh is for PRIMARY : gives u new access tokens, SECONDARY: let server know “this user is still authenticated”