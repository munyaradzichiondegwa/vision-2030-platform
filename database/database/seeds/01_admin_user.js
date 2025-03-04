// database/seeds/01_admin_user.js
const adminUser = {
  username: "admin2030",
  email: "admin@vision2030.gov",
  password: bcrypt.hashSync("SecurePass123!", 10),
  role: "SUPER_ADMIN",
  metadata: {
    createdAt: new Date(),
    lastLogin: null,
  },
};

db.users.updateOne(
  { email: adminUser.email },
  { $setOnInsert: adminUser },
  { upsert: true }
);
