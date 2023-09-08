import { userModel } from "../../db/models/user.model.js";
import { tokenModel } from "../../db/models/token.model.js";
import  jwt  from "jsonwebtoken";
import { catchError } from "../utils/catchError.js";

export const isAuthenticated = catchError(async (req, res, next) => {
    // get data from request 
    let { token } = req.headers;
    if(!token) return next(new Error("Authentication token is required", {cause: 401}))

    // check bearer
    if (!token.startsWith(process.env.BEARER)) return next(new Error("Invalid or expired token. Please authenticate with a valid token", {cause: 403}))
    
    // reassign token
    token = token.split(process.env.BEARER)[1]

    // check token exsistance 
    const checkToken = await tokenModel.find({token, isValid: true})
    if (!checkToken) return next(new Error("Token expired", {cause:403}))

    // decode
    const payload = jwt.verify(token, process.env.TOKEN_KEY);
    if(!payload) return next(new Error("Invalid token!"))

    // check user existance
    const user = await userModel.findById(payload.id)
    if (!user) return next(new Error("user not found!", {cause: 404}))

    // pass user 
    req.user = user;

    // return next
    return next();    
});