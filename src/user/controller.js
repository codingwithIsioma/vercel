const {
  deleteUserPrivateModel,
  deleteUserPublicModel,
} = require("../auth/model");
const { isTokenValid } = require("../utility/index");
const {
  getUserByAccessToken,
  refreshByRefreshToken,
  Insert_image_to_public_storage,
} = require("./model");

const getLoggedInUserController = (req, res) => {
  // console.log(req.headers)
  let token = req.headers;
  let authHeader = token["authorization"];

  if (!authHeader) {
    return res.send({
      status: false,
      message: "missing authorization",
    });
  }
  let accessToken = authHeader.split(" ")[1];
  if (isTokenValid(accessToken) == false) {
    return res.send({
      success: false,
      message: "Users session expired",
    });
  }

  getUserByAccessToken(accessToken)
    .then((response) => {
      if (response.error) {
        return res.send({
          success: false,
          message: response.error.message,
        });
      }

      let userData = { ...response.data.user.user_metadata };

      res.send(userData);
    })
    .catch((error) => {
      console.log(error);
      return res.send({
        success: false,
        message: "a server error occured",
        data: null,
      });
    });
};

const refreshAccessController = (req, res) => {
  let { refresh } = req.body;

  refreshByRefreshToken(refresh)
    .then((response) => {
      if (response.error) {
        res.send({
          success: false,
          message: response.error.message,
          data: null,
        });
      }

      res.send({
        accessToken: response.data.session.access_token,
        refreshToken: response.data.session.refresh_token,
      });
    })
    .catch((error) => {
      console.log(error);
      return res.send({
        success: false,
        message: "a server error occured",
        data: null,
      });
    });
};

const deleteUserController = (req, res) => {
  let { userId } = req.body;
  deleteUserPrivateModel(userId)
    .then((response) => {
      if (response.error) {
        return res.send({
          success: false,
          message: response.error.message,
          data: null,
        });
      }
      if (response.data.length < 1) {
        return res.send({
          success: false,
          message: "User id not found",
        });
      }
      deleteUserPublicModel(userId)
        .then((response2) => {
          if (response2.error) {
            return res.send({
              success: false,
              message: response2.error.message,
              data: null,
            });
          }
          res.send({
            success: true,
            message: "User deleted!",
          });
        })
        .catch((error) => {
          console.log(error);
          return res.send({
            success: false,
            message: "a server error occured",
            data: null,
          });
        });
    })
    .catch((error) => {
      console.log(error);
      return res.send({
        success: false,
        message: "a server error occured",
        data: null,
      });
    });
};

const uploadFileController = (req, res) => {
  if (!req.file) {
    return res.send({
      success: false,
      message: "No file uploaded",
    });
  }

  let bufferData = req.file.buffer;
  // convert bufferdata to base64 encoded string
  const base64Image = Buffer.from(bufferData).toString("base64"); // an alphanumeric string would be created
  // retrieve the mimetype, to know the extension type e.g: image/png, video/mp4... of the uploaded file from the request object.
  const fileType = req.file.mimetype;
  // determine the field/file name to check if it is an image or video
  let fieldName = fileType.startsWith("image") ? "image" : "video";
  // extract the file extension
  let fileExtension = fileType.split("/").pop();
  // create a new object to hold the file data
  let fileName = `${Math.random()}.${fileExtension}`;
  // create a function to convert base64 data (base64Image) to a blob data
  const Base64ToBlob = (base64Data, contentType = fileType) => {
    const byteCharacters = atob(base64Data); // atob means a string of bytes
    // create an array with the same length as the bytecharacters, iterate over it, converting each character to its unicode code point(an integer btw 0-65535) using a character code
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    // create a typed array which type is an int8 type which represents an 8-bit unsigned integer. this array is used to construct a blob.
    const byteArray = new Uint8Array(byteNumbers);
    // create a new blobed object from the byteArray and its going to specify the mimetype and the object type.
    return new Blob([byteArray], { type: contentType });
  };

  const blob = Base64ToBlob(base64Image);
  // create a form data object and append the blob as a file
  let formData = new FormData();
  formData.append(fieldName, blob, fileName);

  const payload = { fileName, formData };

  console.log(payload);

  Insert_image_to_public_storage(payload)
    .then((response) => {
      if (response.error) {
        return res.send({
          success: false,
          message: response.error.message,
          data: null,
        });
      }

      return res.send({
        success: true,
        message: "Upload Successful",
        data: response,
      });
    })
    .catch((error) => {
      console.log(error);
      return res.send({
        success: false,
        message: "a server error has occurred 1",
        data: null,
      });
    });
};

module.exports = {
  getLoggedInUserController,
  refreshAccessController,
  deleteUserController,
  uploadFileController,
};
