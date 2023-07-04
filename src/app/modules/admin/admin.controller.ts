import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import pick from '../../../shared/pick';
import { paginationFields } from '../../../constants/pagination';
import { adminFilterableFields } from './admin.constant';
import { AdminService } from './admin.service';
import { IAdmin } from './admin.interface';

const getAllAdmins = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, adminFilterableFields);

  const paginationOptions = pick(req.query, paginationFields);

  const result = await AdminService.getAllAdmins(filters, paginationOptions);

  sendResponse<IAdmin[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admins retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  const result = await AdminService.getSingleAdmin(id);

  sendResponse<IAdmin>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin retrieved successfully',
    data: result,
  });
});

const updateAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const updatedData = req.body;

  const result = await AdminService.updateAdmin(id, updatedData);

  sendResponse<IAdmin>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin updated successfully',
    data: result,
  });
});

const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  const result = await AdminService.deleteAdmin(id);

  sendResponse<IAdmin>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin deleted successfully !',
    data: result,
  });
});

export const AdminController = {
  getAllAdmins,
  getSingleAdmin,
  updateAdmin,
  deleteAdmin,
};

// const createSemester: RequestHandler = async (req, res, next) => {
//   try {
//     const { ...academicSemesterData } = req.body;
//     const result = await AcademicSemesterService.createSemester(
//       academicSemesterData
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Academic semester is created successfully!',
//       data: result,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
