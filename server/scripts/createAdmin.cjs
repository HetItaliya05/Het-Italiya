const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin.cjs');

const run = async () => {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'Admin@12345';

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/');
  const passwordHash = await bcrypt.hash(password, 12);
  await Admin.findOneAndUpdate(
    { username },
    { username, passwordHash, role: 'admin' },
    { upsert: true, new: true }
  );

  console.log(`Admin user ready: ${username}`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});