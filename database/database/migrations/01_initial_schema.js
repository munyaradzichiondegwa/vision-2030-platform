// database/migrations/01_initial_schema.js
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "password", "role"],
      properties: {
        username: {
          bsonType: "string",
          description: "must be a string and is required",
          minLength: 3,
          maxLength: 30,
        },
        email: {
          bsonType: "string",
          pattern: "^\\S+@\\S+\\.\\S+$",
          description: "must be a valid email address",
        },
        password: {
          bsonType: "string",
          minLength: 8,
          description: "must be a secure password",
        },
        role: {
          enum: ["USER", "ADMIN", "SUPER_ADMIN"],
          description: "must be a valid role",
        },
      },
    },
  },
});
