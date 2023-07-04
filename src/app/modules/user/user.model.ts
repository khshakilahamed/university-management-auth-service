/* eslint-disable @typescript-eslint/no-this-alias */
import mongoose, { Schema } from 'mongoose';
import { IUser, UserModel } from './user.interface';
import bcrypt from 'bcrypt';
import config from '../../../config';

// instance method
// const userSchema = new Schema<IUser, Record<string, never>, IUserMethods>(

// static method
const userSchema = new Schema<IUser, UserModel>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: 0,
    },
    needsPasswordChange: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: {
      type: Date,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
    },
    faculty: {
      type: Schema.Types.ObjectId,
      ref: 'Faculty',
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

// userSchema.methods.isUserExist = async function (
//   id: string
// ): Promise<Partial<IUser> | null> {
//   const user = await User.findOne(
//     { id },
//     { id: 1, password: 1, needsPasswordChange: 1 }
//   );

//   return user;
// };

// userSchema.methods.isPasswordMatched = async function (
//   givenPassword: string,
//   savedPassword: string
// ): Promise<boolean> {
//   return await bcrypt.compare(givenPassword, savedPassword);

//   // return isMatched;
// };

userSchema.statics.isUserExist = async function (
  id: string
): Promise<Pick<
  IUser,
  'id' | 'role' | 'password' | 'needsPasswordChange'
> | null> {
  const user = await User.findOne(
    { id },
    { id: 1, role: 1, password: 1, needsPasswordChange: 1 }
  );

  return user;
};

userSchema.statics.isPasswordMatched = async function (
  givenPassword: string,
  savedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(givenPassword, savedPassword);
};

// User.create() / user.save()
userSchema.pre('save', async function (next) {
  // Hash user Password
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds)
  );

  if (!user.needsPasswordChange) {
    user.passwordChangedAt = new Date();
  }

  next();
});

export const User = mongoose.model<IUser, UserModel>('User', userSchema);
