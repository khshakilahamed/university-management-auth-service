import mongoose, { Schema } from 'mongoose';
import {
  IManagementDepartment,
  ManagementDepartmentModel,
} from './managementDepartment.interface';

export const managementDepartmentSchema = new Schema<IManagementDepartment>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const ManagementDepartment = mongoose.model<
  IManagementDepartment,
  ManagementDepartmentModel
>('ManagementDepartment', managementDepartmentSchema);
