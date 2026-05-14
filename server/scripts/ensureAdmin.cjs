const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin.cjs');

const ADMIN_PHONE = '1111222233';
const ADMIN_PASSWORD = '3344445555';

/**
 * Ensures the real admin user exists in MongoDB.
 * Creates it if missing.
 */
async function ensureAdmin() {
  const username = String(ADMIN_PHONE).replace(/\D/g, '');
  if (!username) throw new Error('ensureAdmin: invalid ADMIN_PHONE');

  const existing = await Admin.findOne({ username });
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  // Admin schema requires: username, passwordHash, role(optional)
  const created = await Admin.create({
    username,
    passwordHash,
    role: 'admin',
  });

  return created;
}

module.exports = { ensureAdmin };

