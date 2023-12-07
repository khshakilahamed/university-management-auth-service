import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import {
  IChangePassword,
  ILoginUser,
  ILoginUserResponse,
  IRefreshTokenResponse,
} from './auth.interface';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { Admin } from '../admin/admin.model';
import { Faculty } from '../faculty/faculty.model';
import { Student } from '../student/student.model';
import { sendEmail } from './sendResetMail';
import bcrypt from 'bcrypt';

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { id, password } = payload;

  const isUserExist = await User.isUserExist(id);

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  // Match Password
  if (
    isUserExist.password &&
    !(await User.isPasswordMatched(password, isUserExist.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
  }

  // create access token & refresh token
  const { id: userId, role, needsPasswordChange } = isUserExist;
  const accessToken = jwtHelpers.createToken(
    { userId, role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.createToken(
    { userId, role },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needsPasswordChange,
  };
};

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  // verify token
  // invalid token - synchronous
  let verifiedToken = null;
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret
    );
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid Refresh Token');
  }
  // tmi delete hoye gecho intu tmr refresh token ache
  // checking deleted user's refresh token
  const { userId } = verifiedToken;

  const isUserExist = await User.isUserExist(userId);
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  // generate new token
  const newAccessToken = jwtHelpers.createToken(
    {
      id: isUserExist?.id,
      role: isUserExist?.role,
    },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  return { accessToken: newAccessToken };
};

const changePassword = async (
  user: JwtPayload | null,
  payload: IChangePassword
): Promise<void> => {
  const { oldPassword, newPassword } = payload;

  // const isUserExist = await User.isUserExist(user?.userId);

  // alternative way
  const isUserExist = await User.findOne({ id: user?.userId }).select(
    '+password'
  );

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  // checking old password
  if (
    isUserExist.password &&
    !(await User.isPasswordMatched(oldPassword, isUserExist.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
  }

  //   // hash Password before saving
  //   const newHashedPassword = await bcrypt.hash(
  //     newPassword,
  //     Number(config.bcrypt_salt_rounds)
  //   );

  //   const query = { id: user?.userId };

  //   const updatedData = {
  //     password: newHashedPassword,
  //     needsPasswordChange: false,
  //     passwordChangedAt: new Date(),
  //   };

  //   // update password
  //   await User.findOneAndUpdate(query, updatedData);

  // data update
  isUserExist.password = newPassword;
  isUserExist.needsPasswordChange = false;

  // updating using save()
  isUserExist.save();
};

const forgotPass = async (payload: { id: string }) => {
  const user = await User.findOne({ id: payload.id }, { id: 1, role: 1 });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User does not exist');
  }

  let profile = null;

  if (user.role === ENUM_USER_ROLE.ADMIN) {
    profile = await Admin.findOne({ id: user.id });
  } else if (user.role === ENUM_USER_ROLE.FACULTY) {
    profile = await Faculty.findOne({ id: user.id });
  } else if (user.role === ENUM_USER_ROLE.STUDENT) {
    profile = await Student.findOne({ id: user.id });
  }

  if (!profile) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Profile not found');
  }
  if (!profile.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email not found');
  }

  const passwordResetToken = jwtHelpers.createPassResetToken(
    { id: user.id },
    config.jwt.secret as string,
    '50m'
  );

  const resetLink: string =
    config.reset_link + `id=${user.id}&token=${passwordResetToken}`;
  await sendEmail(
    profile.email,
    `
    <div>
      <p>Hi, ${profile.name.firstName}</p>
      <p>Your Password reset link <a href=${resetLink}>Click Here</a></p>
      <p>Thank you</p>
    </div>
  `
  );

  // return {
  //   message: 'Check your email!',
  // };
};

const resetPassword = async (
  payload: { id: string; newPassword: string },
  token: string
) => {
  const { id, newPassword } = payload;
  const user = await User.findOne({ id }, { id: 1 });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
  }

  const isVerified = await jwtHelpers.verifyToken(
    token,
    config.jwt.secret as string
  );

  if (!isVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, '');
  }

  const password = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await User.updateOne({ id: id }, { password: password });
};

export const AuthService = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPass,
  resetPassword,
};

// const changePassword = async (
//   user: JwtPayload | null,
//   payload: IChangePassword
// ): Promise<void> => {
//   const { oldPassword, newPassword } = payload;

//   const isUserExist = await User.isUserExist(user?.userId);

//   if (!isUserExist) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
//   }

//   // checking old password
//   if (
//     isUserExist.password &&
//     !(await User.isPasswordMatched(oldPassword, isUserExist.password))
//   ) {
//     throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
//   }

//   // hash Password before saving
//   const newHashedPassword = await bcrypt.hash(
//     newPassword,
//     Number(config.bcrypt_salt_rounds)
//   );

//   const query = { id: user?.userId };

//   const updatedData = {
//     password: newHashedPassword,
//     needsPasswordChange: false,
//     passwordChangedAt: new Date(),
//   };

//   // update password
//   await User.findOneAndUpdate(query, updatedData);
// };

// using instance methods
// const loginUser = async (payload: ILoginUser) => {
//   const { id, password } = payload;

//   // creating instance of user
//   const user = new User();
//   // access to our instance methods & check user exist
//   const isUserExist = await user.isUserExist(id);

//   //   const isUserExist = await User.findOne(
//   //     { id },
//   //     { id: 1, password: 1, needsPasswordChange: 1 }
//   //   ).lean();

//   if (!isUserExist) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
//   }

//   // Match Password
//   const isPasswordMatched =
//     isUserExist.password &&
//     user.isPasswordMatched(password, isUserExist?.password);

//   //   const isPasswordMatched = await bcrypt.compare(
//   //     password,
//   //     isUserExist.password
//   //   );

//   if (!isPasswordMatched) {
//     throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
//   }

//   // create access token - JWT Token

//   return {
//     isUserExist?.needsPasswordChange
//   };
// };
