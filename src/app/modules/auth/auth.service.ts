import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import {
  ILoginUser,
  ILoginUserResponse,
  IRefreshTokenResponse,
} from './auth.interface';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import { jwtHelpers } from '../../../helpers/jwtHelpers';

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { id, password } = payload;

  const isUserExist = await User.isUserExist(id);

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  // Match Password
  const isPasswordMatched =
    isUserExist.password &&
    (await User.isPasswordMatched(password, isUserExist?.password));

  if (!isPasswordMatched) {
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

export const AuthService = {
  loginUser,
  refreshToken,
};
