// database/migrations/02_create_indexes.js
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ "metadata.createdAt": -1 });
