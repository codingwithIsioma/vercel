const jwt = require("jsonwebtoken");

let JWTSecret =
  "pIJ01mXx9HqYcNNMts3dFtcuue35uGB/GAxGkkSdBkIWvwNYa2JtKJ/My7Xp04ALdYH2JJb7nMEvNCNLW2G1Ig==";


function responseObject(message, type, data) {
  return {
    success: type,
    message,
    data,
  };
}

const isTokenValid = (token, JWTtoken = JWTSecret) => {
  try {
    const decodedToken = jwt.decode(token, { complete: true }); // decodes the token
    const expirationTime = decodedToken.payload.exp // this is to check if the token has expired
    // compare with current time
    const currentTime = Math.floor(Date.now( ) / 1000);
    if (expirationTime > currentTime) {
      if (JWTtoken) {
        jwt.verify(token, JWTtoken)
      }
      return true;
    }
    else {
      return false
    }

  } catch (error) {
    return false
  }
}

module.exports = { responseObject, isTokenValid};
