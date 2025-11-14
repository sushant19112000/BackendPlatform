const jwt = require('jsonwebtoken');
const secretKey = 'revvknew';





const createToken = (userId, email) => {
    try {
        const token = jwt.sign({
            id: userId,
            email: email
        }, secretKey, { expiresIn: '1h' });
        return token;
    }
    catch (e) {
        console.log(e);
    }
}


const decodeToken = (token) => {
    try {
        const isDecoded=jwt.verify(token, 'revvknew', (err, decoded) => {
            if (err) {
                return null;
            } else {
                return  decoded;
            }
        });
        return isDecoded;
    }
    catch (e) {
        console.log(e)
         return null; // token is invalid or expired
    }
}

module.exports={createToken,decodeToken};