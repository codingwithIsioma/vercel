const supabase = require("../../config/supabase_config");

const insertNotification = (payload) => {
  return supabase
    .from("notification")
    .insert([
      {
        from: payload.from,
        to: payload.to,
        type: payload.type,
        msg: payload.msg,
        meta_data: payload,
      },
    ])
    .select();
};

const fetchNotificationByUUID = (id) => {
    return supabase.from("notification").select("*").eq("to", id)
}

const fetchNotificationById = (id) => {
    return supabase.from("notification").select("*").eq("id", id);
}

module.exports = { insertNotification, fetchNotificationByUUID, fetchNotificationById };
