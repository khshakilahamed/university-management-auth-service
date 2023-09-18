import { RedisClient } from '../../../shared/redis';
import {
  EVENT_ACADEMIC_DEPARTMENT_CREATED,
  EVENT_ACADEMIC_DEPARTMENT_DELETED,
  EVENT_ACADEMIC_DEPARTMENT_UPDATED,
} from './academicDepartment.constant';
import { IAcademicDepartmentCreatedEvent } from './academicDepartment.interface';
import { AcademicDepartmentService } from './academicDepartment.service';

const initAcademicDepartmentEvents = () => {
  RedisClient.subscribe(
    EVENT_ACADEMIC_DEPARTMENT_CREATED,
    async (e: string) => {
      const data: IAcademicDepartmentCreatedEvent = JSON.parse(e);

      await AcademicDepartmentService.createDepartmentFromEvent(data);
    }
  );

  RedisClient.subscribe(
    EVENT_ACADEMIC_DEPARTMENT_UPDATED,
    async (e: string) => {
      const data = JSON.parse(e);

      await AcademicDepartmentService.updateOneIntoDBFromEvent(data);
    }
  );

  RedisClient.subscribe(
    EVENT_ACADEMIC_DEPARTMENT_DELETED,
    async (e: string) => {
      const data = JSON.parse(e);

      await AcademicDepartmentService.deleteDepartmentFromEvent(data);
    }
  );
};

export default initAcademicDepartmentEvents;
