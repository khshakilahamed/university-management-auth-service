import { Model, Types } from 'mongoose';
import { IAcademicFaculty } from '../academicFaculty/academicFaculty.interface';

export type IAcademicDepartment = {
  title: string;
  academicFaculty: Types.ObjectId | IAcademicFaculty;
  syncId: string;
};

export type AcademicDepartmentModel = Model<
  IAcademicDepartment,
  Record<string, unknown>
>;

export type IAcademicDepartmentFilters = {
  searchTerm?: string;
  title?: string;
  academicFaculty?: string;
};

export type IAcademicDepartmentCreatedEvent = {
  title: string;
  academicFacultyId: string | Types.ObjectId | undefined;
  id: string;
};
