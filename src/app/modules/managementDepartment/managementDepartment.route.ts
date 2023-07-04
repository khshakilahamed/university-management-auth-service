import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { managementDepartmentValidation } from './managementDepartment.validation';
import { ManagementDepartmentController } from './managementDepartment.controller';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../enums/user';
const router = express.Router();

router.post(
  '/',
  validateRequest(
    managementDepartmentValidation.createManagementDepartmentZodSchema
  ),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  ManagementDepartmentController.createManagementDepartment
);

router.get(
  '/:id',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.FACULTY,
    ENUM_USER_ROLE.STUDENT
  ),
  ManagementDepartmentController.getSingleManagementDepartment
);

router.get(
  '/',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.FACULTY,
    ENUM_USER_ROLE.STUDENT
  ),
  ManagementDepartmentController.getAllManagementDepartments
);

router.patch(
  '/:id',
  validateRequest(
    managementDepartmentValidation.updateManagementDepartmentZodSchema
  ),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  ManagementDepartmentController.updateManagementDepartment
);

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  ManagementDepartmentController.deleteManagementDepartment
);

export const ManagementDepartmentRoutes = router;
