import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { academicDepartmentController } from './academicDepartment.controller';
import { AcademicDepartmentValidation } from './academicDepartment.validation';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../enums/user';
const router = express.Router();

router.post(
  '/create-department',
  validateRequest(
    AcademicDepartmentValidation.createAcademicDepartmentZodSchema
  ),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  academicDepartmentController.createDepartment
);

router.get('/:id', academicDepartmentController.getSingleDepartment);

router.get('/', academicDepartmentController.getAllDepartments);

router.patch(
  '/:id',
  validateRequest(
    AcademicDepartmentValidation.updateAcademicDepartmentZodSchema
  ),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  academicDepartmentController.updateDepartment
);

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  academicDepartmentController.deleteDepartment
);

// export default route
export const AcademicDepartmentRoutes = router;
