import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { managementDepartmentValidation } from './managementDepartment.validation';
import { ManagementDepartmentController } from './managementDepartment.controller';
const router = express.Router();

router.post(
  '/',
  validateRequest(
    managementDepartmentValidation.createManagementDepartmentZodSchema
  ),
  ManagementDepartmentController.createManagementDepartment
);

router.get(
  '/:id',
  ManagementDepartmentController.getSingleManagementDepartment
);

router.get('/', ManagementDepartmentController.getAllManagementDepartments);

router.patch(
  '/:id',
  validateRequest(
    managementDepartmentValidation.updateManagementDepartmentZodSchema
  ),
  ManagementDepartmentController.updateManagementDepartment
);

export const ManagementDepartmentRoutes = router;
