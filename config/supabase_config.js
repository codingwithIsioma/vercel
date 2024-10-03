const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://wdzzihhdrvpllbexiept.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkenppaGhkcnZwbGxiZXhpZXB0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMzU0NDUzMSwiZXhwIjoyMDM5MTIwNTMxfQ.huF0WyEBcx5ClYujnP_UAyTEguo7n1v7Q3FqTS2hV4w"
);

module.exports = supabase;
