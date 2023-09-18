import { RedisClient } from '../../../shared/redis';
import {
  EVENT_ACADEMIC_FACULTY_CREATED,
  EVENT_ACADEMIC_FACULTY_DELETED,
  EVENT_ACADEMIC_FACULTY_UPDATED,
} from './academicFaculty.constant';
import { IAcademicFacultyCreatedEvent } from './academicFaculty.interface';
import { AcademicFacultyService } from './academicFaculty.service';

const initAcademicFacultyEvents = () => {
  RedisClient.subscribe(EVENT_ACADEMIC_FACULTY_CREATED, async (e: string) => {
    const data: IAcademicFacultyCreatedEvent = JSON.parse(e);

    console.log(data);

    await AcademicFacultyService.createFacultyFromEvent(data);
  });

  RedisClient.subscribe(EVENT_ACADEMIC_FACULTY_UPDATED, async (e: string) => {
    const data = JSON.parse(e);

    await AcademicFacultyService.updateOneIntoDBFromEvent(data);
  });

  RedisClient.subscribe(EVENT_ACADEMIC_FACULTY_DELETED, async (e: string) => {
    const data = JSON.parse(e);

    await AcademicFacultyService.deleteSemesterFromEvent(data);
  });
};

export default initAcademicFacultyEvents;
