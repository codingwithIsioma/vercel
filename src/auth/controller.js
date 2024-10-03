const {
  signup_public_model,
  signup_private_model,
  signup_private_model2,
  signup_public_model2,
  login_model,
  fetchUserPublicModel,
  updateOTPModel,
  updateDetailsmodel,
} = require("./model");
const {
  fullNameValidation,
  emailValidation,
  passwordValidation,
} = require("../utility/formValidation");
const { responseObject } = require("../utility/index");

const loginController = (req, res) => {
  let { email, password } = req.body;

  // validation
  if (!emailValidation(email)) {
    return res.send(responseObject("Invalid email address", false, null));
  }

  // if email/phone is required
  fetchUserPublicModel(email).then((checkResponse) => {
    if (checkResponse.error) {
      return res.send(responseObject(checkResponse.error, false, null));
    }
    if (checkResponse.data < 1) {
      return res.send(responseObject("User not found", false, null));
    }
    let userData = checkResponse.data[0];
    let actualEmail = userData.email;

    login_model({ email: actualEmail, password })
      .then((loginResponse) => {
        if (loginResponse.error) {
          return res.send(
            responseObject(loginResponse.error.message, false, null)
          );
        }

        res.send(
          responseObject("Success", true, {
            ...loginResponse.data.user.user_metadata,
            accessToken: loginResponse.data.session.access_token,
            UUID: loginResponse.data.user.id,
            refreshToken: loginResponse.data.session.refresh_token,
          })
        );
      })
      .catch((error) => {
        console.log(error);
        responseObject("A server error occured", false, null);
      });
  });
};

const signUpController = (req, res) => {
  let { fullName, password, email, phone_number, data } = req.body;
  let newPhone = `0${phone_number.slice(-10)}`;
  // validation

  if (!emailValidation(email)) {
    return res.send(responseObject("Invalid email address", false, null));
  } else if (!fullNameValidation(fullName)) {
    return res.send(responseObject("Invalid name", false, null));
  } else if (!passwordValidation(password)) {
    return res.send(responseObject("Invalid password", false, null));
  }

  // after validation
  // private signup
  let payload = { email, password, data: { ...data, wallet: 0, newPhone } };
  signup_private_model(payload)
    .then((signUpResponse) => {
      if (signUpResponse.error) {
        return res.send(
          responseObject(signUpResponse.error.message, false, null)
        );
      }
      // public signup
      signup_public_model({
        fullName,
        password,
        email,
        phone: newPhone,
        UUID: signUpResponse.data.user.id,
      })
        .then((response) => {
          if (response.error) {
            return res.send(
              responseObject(response.error.message, false, null)
            );
          } else {
            res.send(
              responseObject("record created", true, {
                ...signUpResponse.data.user.user_metadata,
                accessToken: signUpResponse.data.session.access_token,
                UUID: signUpResponse.data.user.id,
                refreshToken: signUpResponse.data.session.refresh_token,
              })
            );
          }
        })
        .catch((error) => {
          console.log(error);
          res.send(responseObject("a server error occured", false, null));
        });
    })
    .catch((error) => {
      console.log(error);
      return res.send(responseObject("a server error occured", false, null));
    });
};

const requestOTP = (req, res) => {
  const OTP = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

  let { email } = req.body;
  if (!email) {
    return res.send(responseObject("Invalid email", false, null));
  }
  fetchUserPublicModel(email).then((response) => {
    if (response.error) {
      return res.send(responseObject(response.error.message, false, null));
    }
    if (response.data.length < 1) {
      return res.send(responseObject("User does not exist", false, null));
    }

    // send OTP via nodemailer
    let otpObj = { OTP, time: new Date().getTime() };
    updateOTPModel({ email, otp: otpObj })
      .then((response) => {
        if (response.error) {
          return res.send(responseObject(response.error.message, false, null));
        }

        res.send({
          success: true,
          message: "OTP sent",
          data: {
            user: email,
            OTP,
          },
        });
      })
      .catch((error) => {
        console.log(error);
        return res.send(responseObject("a server error occured", false, null));
      });
  });
};

const changeDetails = (req, res) => {
  let { email, newfullName, newphone_number } = req.body;

  fetchUserPublicModel(email).then((response) => {
    if (response.error) {
      // response.error.message
      return res.send(responseObject(response.error.message, false, null));
    }

    // check if there's a user
    if (response.data.length < 1) {
      // no user
      return res.send(responseObject("User does not exist", false, null));
    }

    updateDetailsmodel({
      newfullName: newfullName,
      newphone_number: newphone_number,
      email,
    }).then((response) => {
      if (response.error) {
        // response.error.message
        return res.send(responseObject(response.error.message, false, null));
      }

      res.send({
        success: true,
        message: "Details updated",
        data: {
          newfullName: newfullName,
          newphone_number: newphone_number,
        },
      });
    });
  });
};

const resetPasswordController = (req, res) => {
  let { username, oldPassword, newPassword } = req.body;
  res.send(
    responseObject("password reset!", true, {
      username,
      newPassword,
    })
  );
};

const verifyOTP = (req, res) => {};

const signUpController2 = (req, res) => {
  let { fullName, password, phone_number, data } = req.body;

  // after validation
  // private signup
  let payload = { phone_number, password, data };
  signup_private_model2(payload)
    .then((signUpResponse) => {
      if (signUpResponse.error) {
        return res.send({
          success: false,
          message: signUpResponse.error.message,
          data: null,
        });
      }
      // public signup
      signup_public_model2({ fullName, password, phone_number })
        .then((response) => {
          if (response.error) {
            return res.send(
              responseObject(response.error.message, false, null)
            );
          } else {
            res.send(
              responseObject("record created", true, {
                ...signUpResponse.data.user.user_metadata,
                accessToken: signUpResponse.data.session.access_token,
                UUID: signUpResponse.data.user.id,
                refreshToken: signUpResponse.data.session.refresh_token,
              })
            );
          }
        })
        .catch((error) => {
          console.log(error);
          res.send(responseObject("a server error occured", false, null));
        });
    })
    .catch((error) => {
      console.log(error);
      return res.send(responseObject("a server error occured", false, null));
    });
};



module.exports = {
  loginController,
  signUpController,
  resetPasswordController,
  signUpController2,
  requestOTP,
  verifyOTP,
  changeDetails,
};
