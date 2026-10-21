
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const User = require("../models/User");

async function promoteUserToAdmin() {
  const email = (process.argv[2] || "")
    .trim()
    .toLowerCase();

  const confirmed = process.argv.includes(
    "--confirm-admin"
  );

  if (!email || !confirmed) {
    throw new Error(
      "Usage: node scripts/promoteUserToAdmin.js " +
      "user@example.com --confirm-admin"
    );
  }

  if (!process.env.MONGO_URI) {
    throw new Error(
      "MONGO_URI is missing from backend/.env"
    );
  }

  await mongoose.connect(process.env.MONGO_URI);

  console.log(
    `Connected to database: ${mongoose.connection.name}`
  );

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error(
      `No registered user found for ${email}. ` +
      "Register the account first."
    );
  }

  if (user.role === "admin") {
    console.log(
      `${email} already has the admin role.`
    );
    return;
  }

  const previousRole = user.role;

  user.role = "admin";
  await user.save();

  console.log("Admin account configured successfully.");
  console.log(`Email: ${user.email}`);
  console.log(`Previous role: ${previousRole}`);
  console.log(`New role: ${user.role}`);
}

promoteUserToAdmin()
  .catch((error) => {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
