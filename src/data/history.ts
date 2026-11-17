// "Our History" timeline on the About page (from the old /about/ page).
// The Phoenix Camelback milestones were removed when that campus stopped being offered.

export type MilestoneIcon = 'school' | 'building' | 'map' | 'sprout' | 'star';

export interface Milestone {
  year: string;
  title: string;
  body: string;
  icon: MilestoneIcon;
}

export const foundedYear = 1997;

export const milestones: Milestone[] = [
  {
    year: '1997',
    title: 'It all begins in Tucson',
    body: 'The AmeriSchools Academies began in Tucson, opening the Tucson AmeriSchools Academy High School.',
    icon: 'star',
  },
  {
    year: '1998',
    title: 'Country Club Academy opens',
    body: 'The Country Club AmeriSchools Academy opens its doors in Tucson.',
    icon: 'school',
  },
  {
    year: '2004',
    title: 'Expanding to Yuma',
    body: 'Yuma South AmeriSchools Academy opens, bringing AmeriSchools to a second Arizona community.',
    icon: 'map',
  },
  {
    year: '2012',
    title: 'Yuma North Campus opens',
    body: 'A second Yuma campus opens to serve more families in the area.',
    icon: 'building',
  },
  {
    year: '2013',
    title: 'Partnering for Pre-K',
    body: 'The Tucson and Yuma campuses begin working closely with Capstone Quest Academy to prepare three- to five-year-olds for kindergarten, including before- and after-school programs for Pre-K students.',
    icon: 'sprout',
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
