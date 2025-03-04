// server/src/models/User.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: string;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    default: "USER",
    enum: ["USER", "ADMIN", "SUPER_ADMIN"],
  },
});

export default mongoose.model<IUser>("User", UserSchema);
