import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'user' | 'admin';
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    phone: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    resetPasswordToken: {
      type: String,
      default: undefined
    },
    resetPasswordExpiry: {
      type: Date,
      default: undefined
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function userPreSave() {
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
