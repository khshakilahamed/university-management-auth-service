/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';
import { IStudent } from '../student/student.interface';
import { IFaculty } from '../faculty/faculty.interface';
import { IAdmin } from '../admin/admin.interface';

export type IUser = {
  id: string;
  role: string;
  password: string;
  needsPasswordChange: true | false;
  passwordChangedAt?: Date;
  student?: Types.ObjectId | IStudent;
  faculty?: Types.ObjectId | IFaculty; // Future
  admin?: Types.ObjectId | IAdmin; // Future
};

export type UserModel = {
  isUserExist(
    id: string
  ): Promise<Pick<IUser, 'id' | 'role' | 'password' | 'needsPasswordChange'>>;

  isPasswordMatched(
    givenPassword: string,
    savedPassword: string
  ): Promise<boolean>;
} & Model<IUser>;

// export type IUserMethods = {
//   isUserExist(id: string): Promise<Partial<IUser> | null>;
//   isPasswordMatched(
//     givenPassword: string,
//     savedPassword: string
//   ): Promise<boolean>;
// };

// type UserModel = Model<IUser, object>
// export type UserModel = Model<IUser, Record<string, unknown>, IUserMethods>;
