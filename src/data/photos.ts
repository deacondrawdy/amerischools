// Real AmeriSchools photography, keyed so content data can reference photos by
// name (and later by Sanity asset). Alt text lives with the photo.
import type { ImageMetadata } from 'astro';
import classroomHandsUp from '../assets/photos/classroom-hands-up.jpg';
import kinderSlide from '../assets/photos/kinder-slide.jpg';
import phoenixBoyWriting from '../assets/photos/phoenix-boy-writing.jpg';
import phoenixBuildingProject from '../assets/photos/phoenix-building-project.jpg';
import phoenixGirlsWriting from '../assets/photos/phoenix-girls-writing.jpg';
import phoenixHandRaised from '../assets/photos/phoenix-hand-raised.jpg';
import phoenixKayaking from '../assets/photos/phoenix-kayaking.jpg';
import playground from '../assets/photos/playground.jpg';
import studentsGroup from '../assets/photos/students-group.jpg';
import teacherHelpingStudents from '../assets/photos/teacher-helping-students.jpg';
import tucsonFoodDrive from '../assets/photos/tucson-food-drive.jpg';
import tucsonStudent from '../assets/photos/tucson-student.jpg';
import yumaNorthFriends from '../assets/photos/yuma-north-friends.jpg';
import yumaNorthRunning from '../assets/photos/yuma-north-running.jpg';
import yumaNorthThumbsUp from '../assets/photos/yuma-north-thumbs-up.jpg';

export interface Photo {
  src: ImageMetadata;
  alt: string;
  /** CSS object-position to keep the subject in frame when cropped. */
  position?: string;
}

export const photos = {
  classroomHandsUp: { src: classroomHandsUp, alt: 'Students raising their hands during a lesson', position: '40% 50%' },
  kinderSlide: { src: kinderSlide, alt: 'A young student smiling on the playground slide' },
  phoenixBoyWriting: { src: phoenixBoyWriting, alt: 'A student concentrating on a writing assignment' },
  phoenixBuildingProject: { src: phoenixBuildingProject, alt: 'A student building a tower from connecting pieces' },
  phoenixGirlsWriting: { src: phoenixGirlsWriting, alt: 'Two students working together at a classroom table', position: '70% 50%' },
  phoenixHandRaised: { src: phoenixHandRaised, alt: 'A student raising her hand in class', position: '30% 40%' },
  phoenixKayaking: { src: phoenixKayaking, alt: 'Students preparing kayaks on a field trip' },
  playground: { src: playground, alt: 'The shaded campus playground on a sunny day', position: '50% 40%' },
  studentsGroup: { src: studentsGroup, alt: 'Smiling students gathered with a staff member' },
  teacherHelpingStudents: { src: teacherHelpingStudents, alt: 'A teacher helping students with their work' },
  tucsonFoodDrive: { src: tucsonFoodDrive, alt: 'Tucson students with food drive boxes and posters' },
  tucsonStudent: { src: tucsonStudent, alt: 'A Tucson student smiling during a hands-on activity' },
  yumaNorthFriends: { src: yumaNorthFriends, alt: 'Two students giving a thumbs up on the school field' },
  yumaNorthRunning: { src: yumaNorthRunning, alt: 'Students running across the school field' },
  yumaNorthThumbsUp: { src: yumaNorthThumbsUp, alt: 'Two students giving a thumbs up outside' },
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;
