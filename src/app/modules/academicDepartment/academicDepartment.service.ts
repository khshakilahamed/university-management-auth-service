import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { AcademicFaculty } from '../academicFaculty/academicFaculty.model';
import { academicSemesterSearchableFields } from './academicDepartment.constant';
import {
  IAcademicDepartment,
  IAcademicDepartmentCreatedEvent,
  IAcademicDepartmentFilters,
} from './academicDepartment.interface';
import { AcademicDepartment } from './academicDepartment.model';
import { SortOrder, Types } from 'mongoose';

const createDepartment = async (
  payload: IAcademicDepartment
): Promise<IAcademicDepartment | null> => {
  const createdDepartment = (await AcademicDepartment.create(payload)).populate(
    'academicFaculty'
  );
  return createdDepartment;
};

const getAllDepartments = async (
  filters: IAcademicDepartmentFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IAcademicDepartment[]>> => {
  const { searchTerm, ...filtersData } = filters;

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: academicSemesterSearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const whereCondition =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const sortConditions: { [key: string]: SortOrder } = {};

  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }

  const result = await AcademicDepartment.find(whereCondition)
    .populate('academicFaculty')
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  const total = await AcademicDepartment.countDocuments();

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleDepartment = async (
  id: string
): Promise<IAcademicDepartment | null> => {
  const result = await AcademicDepartment.findById(id).populate(
    'academicFaculty'
  );
  return result;
};

const updateDepartment = async (
  id: string,
  payload: Partial<IAcademicDepartment>
): Promise<IAcademicDepartment | null> => {
  const result = await AcademicDepartment.findOneAndUpdate(
    { _id: id },
    payload,
    { new: true }
  );
  return result;
};

const deleteDepartment = async (
  id: string
): Promise<IAcademicDepartment | null> => {
  const result = await AcademicDepartment.findByIdAndDelete(id);
  return result;
};

const createDepartmentFromEvent = async (
  e: IAcademicDepartmentCreatedEvent
): Promise<void> => {
  const faculty = await AcademicFaculty.findOne({
    syncId: e.academicFacultyId,
  });

  if (!faculty) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Academic Faculty does not exist');
  }

  await AcademicDepartment.create({
    title: e.title,
    academicFaculty: faculty._id,
    syncId: e.id,
  });
};

const updateOneIntoDBFromEvent = async (
  e: IAcademicDepartmentCreatedEvent
): Promise<void> => {
  if (e.academicFacultyId) {
    const faculty = await AcademicFaculty.findOne({
      syncId: e.academicFacultyId,
    });

    e.academicFacultyId = faculty?._id;
  }
  await AcademicDepartment.findOneAndUpdate(
    { syncId: e.id },
    {
      $set: {
        title: e.title,
        academicFaculty: new Types.ObjectId(e.academicFacultyId),
      },
    }
  );
};

const deleteDepartmentFromEvent = async (
  e: IAcademicDepartmentCreatedEvent
): Promise<void> => {
  await AcademicDepartment.findOneAndDelete({ syncId: e.id });
};

export const AcademicDepartmentService = {
  createDepartment,
  getAllDepartments,
  getSingleDepartment,
  updateDepartment,
  deleteDepartment,
  createDepartmentFromEvent,
  updateOneIntoDBFromEvent,
  deleteDepartmentFromEvent,
};
