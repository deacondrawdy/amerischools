// About page copy (adapted from the old /about/ page). The history timeline lives in history.ts.
import type { PhotoKey } from './photos';

export const mission =
  'Our goal is to develop lifelong learners who are compassionate, culturally sensitive, effective and responsible citizens.';

export const intro =
  'AmeriSchools Academy™ strives to create and maintain a safe and inviting learning community to support both students and families.';

export const values = [
  { icon: 'heart', label: 'Compassionate' },
  { icon: 'globe', label: 'Culturally sensitive' },
  { icon: 'target', label: 'Effective' },
  { icon: 'shield', label: 'Responsible' },
] as const;

export const pillars = [
  {
    icon: 'eye',
    title: 'Our Vision',
    body: 'Our staff are committed to fostering and enhancing student growth by providing effective instructional support dedicated to superior achievements. We share this goal to maintain high academic and social standards, to motivate, inspire and model for our students as we work together to learn and become active participants in our community.',
  },
  {
    icon: 'compass',
    title: 'Our Commitment',
    body: 'We are dedicated to fostering academic excellence through individualized, tuition-free instruction of core curriculum supported by enrichment and acceleration opportunities. To accomplish this mission, we teach an integrated curriculum using multi-age ability groups for instruction.',
  },
] as const;

export type FeatureIcon = 'layers' | 'users' | 'heart' | 'trees' | 'laptop' | 'palette' | 'mountain';

export const features: { title: string; body: string; icon: FeatureIcon; photo: PhotoKey }[] = [
  {
    title: 'Multi-age, skill-based instruction',
    body: 'A challenging environment where students drive their own advancement, taking the time they need to meet academic requirements.',
    icon: 'layers',
    photo: 'phoenixBoyWriting',
  },
  {
    title: 'Low student-to-staff ratio',
    body: 'Small instructional groups and minimal staff turnover allow for more direct instruction and the acceleration of students.',
    icon: 'users',
    photo: 'teacherHelpingStudents',
  },
  {
    title: 'Nurturing student behavior',
    body: 'Positive social development and anti-bullying policies ensure students receive the best education possible in a comfortable, consistent environment.',
    icon: 'heart',
    photo: 'studentsGroup',
  },
  {
    title: 'Community as laboratory',
    body: 'Creative schooling activities use the wider community as a place to learn, and instill the satisfaction of giving back.',
    icon: 'trees',
    photo: 'tucsonFoodDrive',
  },
  {
    title: 'Technology in the classroom',
    body: 'Classroom instruction is supported by technology and internet resources.',
    icon: 'laptop',
    photo: 'illustrativeStudentLaptop',
  },
  {
    title: 'Non-graded, integrated curriculum',
    body: 'Students express themselves through their creative abilities, building a positive self-image.',
    icon: 'palette',
    photo: 'illustrativeMusicActivity',
  },
  {
    title: 'Enriched curricular content',
    body: 'Learning reaches beyond the classroom with resources such as the Grand Canyon, San Diego Wildlife Refuge and oceanography at Catalina Island.',
    icon: 'mountain',
    photo: 'phoenixKayaking',
  },
];

export const faculty = [
  { name: 'Dee Kidd', role: 'Executive Director / CEO' },
  { name: 'Karen Rogers', role: 'Director of Curriculum and Instruction' },
  { name: 'Regina Frausto', role: 'Marketing Director' },
  { name: 'Monica Kern', role: 'HR Director' },
  { name: 'Charissa Goodrum', role: 'Finance and Accounting Director' },
  { name: 'Tammie Rohr', role: 'Grants and Student Records Specialist' },
  { name: 'Nick Brangwin', role: 'Staff Accountant' },
  { name: 'Patricia Martinez', role: '' },
];
