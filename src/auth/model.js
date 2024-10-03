const supabase = require("../../config/supabase_config");

// inserts the newly created users details into the table
const signup_public_model = ({ fullName, email, password, UUID, phone }) => {
  return supabase
    .from("user_public")
    .insert([
      {
        name: fullName,
        email: email,
        uuid: UUID,
        phone_number: phone,
        data: { password: password },
      },
    ])
    .select();
};

// authenticates the users details using email and passsword
const signup_private_model = (payload) => {
  return supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: payload.data,
    },
  });
};

// logs the user in using their email and password - checks if the email exists in the database table
const login_model = ({ email, password }) => {
  return supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });
};

// fetches and returns a user by filtering through the table if the users email or phone number matches any on the table
const fetchUserPublicModel = (payload) => {
  return supabase
    .from("user_public")
    .select("*")
    .or(`email.eq.${payload}`, `phone_number.eq.${payload}`);
};

// updates the otp column in the table with the new otp value of the user when he tries to generate it
const updateOTPModel = ({ otp, email }) => {
  return supabase.from("user_public").update({ otp }).eq("email", email);
};

// updates the users name or phone number in the table using the email as the filtering condition
const updateDetailsmodel = ({ newfullName, newphone_number, email }) => {
  return supabase
    .from("user_public")
    .update({ name: newfullName, phone_number: newphone_number })
    .eq("email", email);
};

// getting user by id from public table
const getUserById = (id) => {
  return supabase.from("user_public").select("*").eq("uuid", id);
};

// get user by id from authentication table
const getPrivateUserById = (UUID) => {
  return supabase.auth.admin.getUserById(UUID);
};

// update user info model
const updateUserInfoModel = ({ UUID, data }) => {
  return supabase.auth.admin.updateUserById(UUID, { user_metadata: data });
};

// get user by phone number
const getUserByPhoneNumber = (phone) => {
  return supabase.from("user_public").select("*").eq("phone_number", phone);
}

// delete user from private table
const deleteUserPrivateModel = (id) => {
  return supabase.auth.admin.deleteUser(id);
}

// delete user from public table
const deleteUserPublicModel = (id) => {
  return supabase.from("user_public").delete().eq("uuid", id);
}


// for signup 2
const signup_public_model2 = ({ fullName, password, phone_number }) => {
  return supabase
    .from("user_public")
    .insert([
      {
        name: fullName,
        phone_number: phone_number,
        data: { password: password },
      },
    ])
    .select();
};

const signup_private_model2 = (payload) => {
  return supabase.auth.signUp({
    password: payload.password,
    phone: payload.phone_number,
    options: {
      data: payload.data,
    },
  });
};


module.exports = {
  signup_public_model,
  signup_private_model,
  signup_private_model2,
  signup_public_model2,
  login_model,
  fetchUserPublicModel,
  updateOTPModel,
  updateDetailsmodel,
  getUserById,
  getPrivateUserById,
  updateUserInfoModel,
  getUserByPhoneNumber,
  deleteUserPrivateModel,
  deleteUserPublicModel
};
