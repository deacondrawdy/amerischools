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
// AI-generated illustrative images from the mockup asset pack — not real AmeriSchools
// students or staff. Placeholders only: replace with real campus photography before launch.
// Only 612×482 — request a larger export (1600px+ wide) for a sharp hero.
import illustrativeHeroFourStudents from '../assets/photos/illustrative-hero-four-students.png';
import illustrativeStudentLaptop from '../assets/photos/illustrative-student-laptop.png';
import illustrativeMusicActivity from '../assets/photos/illustrative-music-activity.png';

export interface Photo {
  src: ImageMetadata;
  alt: string;
  /** CSS object-position to keep the subject in frame when cropped. */
  position?: string;
  /** AI-generated placeholder, not a real AmeriSchools photo. */
  illustrative?: boolean;
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
  illustrativeHeroFourStudents: {
    src: illustrativeHeroFourStudents,
    alt: 'A teacher and three students building a small wind turbine model together',
    position: '50% 12%',
    illustrative: true,
  },
  illustrativeMusicActivity: {
    src: illustrativeMusicActivity,
    alt: 'A teacher guiding two students playing a keyboard and tambourine',
    position: '50% 35%',
    illustrative: true,
  },
  illustrativeStudentLaptop: {
    src: illustrativeStudentLaptop,
    alt: 'A smiling student working on a laptop in class',
    position: '45% 40%',
    illustrative: true,
  },
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;
