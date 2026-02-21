const bcrypt = require('bcrypt');

(async () => {
  const hash1 = await bcrypt.hash('123456', 10);
  const hash2 = await bcrypt.hash('password', 10);
  console.log('Hash for 123456:', hash1);
  console.log('Hash for password:', hash2);
})();