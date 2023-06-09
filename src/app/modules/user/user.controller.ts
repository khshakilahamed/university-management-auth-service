import { Request, Response } from 'express';
import { UserService } from './user.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const { user } = req.body;
  const result = await UserService.createUser(user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User Created Successfully',
    data: result,
  });
});

// const createUser: RequestHandler = async (req, res, next) => {
//   try {
//     const { user } = req.body;
//     const result = await UserService.createUser(user);

//     res.status(200).json({
//       success: true,
//       message: 'user created successfully!',
//       data: result,
//     });
//   } catch (error) {
//     next(error);

//     // res.status(400).json({
//     //   success: false,
//     //   message: 'Failed to create user',
//     // })
//   }
// };

export const UserController = {
  createUser,
};
