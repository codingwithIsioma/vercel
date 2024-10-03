const {
  getUserByPhoneNumber,
  getPrivateUserById,
  updateUserInfoModel,
  getUserById,
} = require("../auth/model");
const {
  insertNotification,
  fetchNotificationById,
  fetchNotificationByUUID,
} = require("./model");

const sendMoneyController = (req, res) => {
  let { amount, receiver, sender } = req.body;
  // get the sender
  getPrivateUserById(sender)
    .then((response1) => {
      if (response1.error) {
        return res.send({
          success: false,
          message: response1.error.message,
          data: null,
        });
      }

      // check if the UUID exists
      if (response1.data.length < 1) {
        return res.send({
          success: false,
          message: "Invalid sender id",
          data: null,
        });
      }

      // get the receiver
      getPrivateUserById(receiver)
        .then((response2) => {
          if (response2.error) {
            return res.send({
              success: false,
              message: response2.error.message,
              data: null,
            });
          }

          // check if the UUID exists
          if (response2.data.length < 1) {
            return res.send({
              success: false,
              message: "Invalid receiver id",
              data: null,
            });
          }

          // declare two variables
          let senderData = response1.data.user.user_metadata;
          let receiverData = response2.data.user.user_metadata;

          // check if the sender has enough money
          if (senderData.wallet < amount) {
            return res.send({
              success: false,
              message: "Insufficient funds",
              data: null,
            });
          }

          let senderNewWalletBalance = senderData.wallet - amount;
          let receiverNewWalletBalance = receiverData.wallet + parseInt(amount);

          // update sender data
          let senderNewData = { wallet: senderNewWalletBalance };

          // update receiver data
          let receiverNewData = { wallet: receiverNewWalletBalance };

          // updating sender info
          updateUserInfoModel({ UUID: sender, data: senderNewData })
            .then((response3) => {
              if (response3.error) {
                return res.send({
                  success: false,
                  message: response3.error.message,
                  data: null,
                });
              }

              // updating receiver info
              updateUserInfoModel({ UUID: receiver, data: receiverNewData })
                .then((response4) => {
                  if (response4.error) {
                    return res.send({
                      success: false,
                      message: response4.error.message,
                      data: null,
                    });
                  }

                  getUserById(sender)
                    .then((userResponse) => {
                      if (userResponse.error) {
                        return res.send({
                          success: false,
                          message: userResponse.error.message,
                          data: null,
                        });
                      }
                      // get senders name
                      let senderName = userResponse.data[0].name;

                      // creating notification record
                      let payload = {
                        from: sender,
                        to: receiver,
                        type: "CASH TRANSFER",
                        msg: `You received ${amount} from ${senderName}!`,
                        data: {
                          amount,
                          walletBalance: receiverNewWalletBalance,
                        },
                      };

                      insertNotification(payload)
                        .then((response5) => {
                          if (response5.error) {
                            return res.send({
                              success: false,
                              message: response5.error.message,
                              data: null,
                            });
                          }

                          res.send({
                            success: true,
                            message: "Transaction successful",
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

          //   res.send({ senderData, receiverData });
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

const addMoneyController = (req, res) => {
  let { user, amount } = req.body;

  getPrivateUserById(user)
    .then((response1) => {
      if (response1.error) {
        return res.send({
          success: false,
          message: response1.error.message,
          data: null,
        });
      }

      // check if the UUID exists
      if (response1.data.length < 1) {
        return res.send({
          success: false,
          message: "Invalid sender id",
          data: null,
        });
      }

      let userData = response1.data.user.user_metadata;

      let userNewWalletBalance = userData.wallet + parseInt(amount);
      let userNewData = { wallet: userNewWalletBalance };

      updateUserInfoModel({ UUID: user, data: userNewData })
        .then((response2) => {
          if (response2.error) {
            return res.send({
              success: false,
              message: response2.error.message,
              data: null,
            });
          }

          let payload = {
            from: "FINAZ",
            to: user,
            type: "CASH DEPOSIT",
            msg: `You received ${amount}!`,
            data: { amount, walletBalance: userNewWalletBalance },
          };
          insertNotification(payload)
            .then((response3) => {
              if (response3.error) {
                return res.send({
                  success: false,
                  message: response3.error.message,
                  data: null,
                });
              }
              res.send({
                success: true,
                message: `You received ${amount}!`,
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

const requestMoneyController = (req, res) => {
  let { from, amount, user } = req.body;
  let phone_number = `0${from.slice(-10)}`;
  getUserByPhoneNumber(phone_number)
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
          message: "User not found",
          data: null,
        });
      }

      getUserById(user).then((userResponse) => {
        if (userResponse.error) {
          return res.send({
            success: false,
            message: userResponse.error.message,
            data: null,
          });
        }

        let requester = userResponse.data[0].name;
        // insert notification for request A request to ${requester} of ${amount} has been sent.
        let payload = {
          from: user,
          to: response.data[0].uuid,
          type: "CASH REQUEST",
          msg: `${requester} is requesting for ${amount}`,
          data: {
            amount,
          },
        };
        insertNotification(payload)
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
              message: "You've successfully requested!",
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

const fetchNotificationController = (req, res) => {
  let { user } = req.body;
  fetchNotificationByUUID(user)
    .then((response) => {
      if (response.error) {
        return res.send({
          success: false,
          message: response.error.message,
          data: null,
        });
      }

      // check if the UUID exists
      if (response.data.length < 1) {
        return res.send({
          success: false,
          message: "Invalid user id",
          data: null,
        });
      }

      res.send(response.data);
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

const decisionController = (req, res) => {
  let { id, user, status } = req.body;

  fetchNotificationById(id)
    .then((response) => {
      if (response.error) {
        return res.send({
          success: false,
          message: response.error.message,
          data: null,
        });
      }

      // check if the UUID exists
      if (response.data.length < 1) {
        return res.send({
          success: false,
          message: "Invalid notification id",
          data: null,
        });
      }

      let userID = response.data[0].to;
      let requesterID = response.data[0].from;
      let amount = response.data[0].meta_data.data.amount;

      if (user === userID && status === "decline") {
        let payload = {
          from: userID,
          to: requesterID,
          type: "CASH REQUEST DECLINED",
          msg: `Cash request declined.`,
          data: null,
        };

        insertNotification(payload).then((response2) => {
          if (response2.error) {
            return res.send({
              success: false,
              message: response2.error.message,
              data: null,
            });
          }

          res.send({
            message: "Request declined successfully",
          });
        });
      }

      if (user === userID && status === "accept") {
        getPrivateUserById(userID)
          .then((userResponse) => {
            if (userResponse.error) {
              return res.send({
                success: false,
                message: userResponse.error.message,
                data: null,
              });
            }

            // check if the UUID exists
            if (userResponse.data.length < 1) {
              return res.send({
                success: false,
                message: "Invalid user id",
                data: null,
              });
            }

            // get the receiver
            getPrivateUserById(requesterID)
              .then((requesterResponse) => {
                if (requesterResponse.error) {
                  return res.send({
                    success: false,
                    message: requesterResponse.error.message,
                    data: null,
                  });
                }

                // check if the UUID exists
                if (requesterResponse.data.length < 1) {
                  return res.send({
                    success: false,
                    message: "Invalid requester id",
                    data: null,
                  });
                }

                // declare two variables
                let userData = userResponse.data.user.user_metadata;
                let requesterData = requesterResponse.data.user.user_metadata;

                // check if the sender has enough money
                if (userData.wallet < amount) {
                  return res.send({
                    success: false,
                    message: "Insufficient funds",
                    data: null,
                  });
                }

                let userNewWalletBalance = userData.wallet - amount;
                let requesterNewWalletBalance =
                  requesterData.wallet + parseInt(amount);

                // update user data
                let userNewData = { wallet: userNewWalletBalance };

                // update requester data
                let requesterNewData = { wallet: requesterNewWalletBalance };

                // updating user info
                updateUserInfoModel({ UUID: userID, data: userNewData })
                  .then((response5) => {
                    if (response5.error) {
                      return res.send({
                        success: false,
                        message: response5.error.message,
                        data: null,
                      });
                    }

                    // updating receiver info
                    updateUserInfoModel({
                      UUID: requesterID,
                      data: requesterNewData,
                    })
                      .then((response6) => {
                        if (response6.error) {
                          return res.send({
                            success: false,
                            message: response6.error.message,
                            data: null,
                          });
                        }

                        let payload = {
                          from: userID,
                          to: response.data[0].from,
                          type: "CASH REQUEST ACCEPTED",
                          msg: `Cash request accepted, ${amount} has been sent.`,
                          data: {
                            amount: amount,
                          },
                        };

                        insertNotification(payload)
                          .then((response3) => {
                            if (response3.error) {
                              return res.send({
                                success: false,
                                message: response3.error.message,
                                data: null,
                              });
                            }

                            res.send({
                              message: "Request accepted successfully",
                              data: {
                                requesterWallet: requesterData.wallet,
                                userWallet: userData.wallet,
                              },
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
          })
          .catch((error) => {
            console.log(error);
            return res.send({
              success: false,
              message: "a server error occured",
              data: null,
            });
          });
      }
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

module.exports = {
  sendMoneyController,
  addMoneyController,
  requestMoneyController,
  fetchNotificationController,
  decisionController,
};
