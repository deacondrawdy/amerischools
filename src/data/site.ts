// Local content source. Step 4 of the build plan replaces these with Sanity
// GROQ queries; keep the shapes stable so pages don't need to change.

import type { PhotoKey } from './photos';

export type GradeBand = 'kindergarten' | 'elementary' | 'middle';

export interface Campus {
  slug: string;
  name: string;
  city: string;
  grades: string;
  /** Lowest/highest grade served (K = 0) — drives the campus finder and grade tabs. */
  gradeRange: [number, number];
  street: string;
  cityStateZip: string;
  phone: string;
  headline: [string, string];
  intro: string;
  /** Legacy WordPress path, used for 301 redirects and "more info" links until migrated. */
  legacyPath: string;
  /** Wide hero photo on the campus page. */
  heroPhoto: PhotoKey;
  /** Card photo on the homepage and campus index. */
  cardPhoto: PhotoKey;
}

export const site = {
  name: 'AmeriSchools Academy',
  applyUrl: '/admissions/',
  currentFamiliesUrl: '/current-families/',
  phone: '1-800-379-9083',
  preschool: { name: 'Capstone Quest Academy', url: 'https://capstonequestacademy.com/' },
  /** Until a dedicated page has copy, "Our Approach" is the About page's key-features section. */
  approachUrl: '/about/#key-features-of-our-school-program',
  /** Arizona State Board for Charter Schools performance dashboard (linked from the old site). */
  performanceUrl: 'https://online.asbcs.az.gov/charterholders/view/404/the-charter-foundation-inc#performance-tab',
  taxCreditUrl: 'https://donateamerischools.org/',
};

export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

export const mainNav: NavItem[] = [
  {
    label: 'Campuses',
    href: '/campuses/',
    children: [
      { label: 'Campus Overview', href: '/campuses/' },
      { label: 'Phoenix', href: '/campuses/phoenix/' },
      { label: 'Tucson', href: '/campuses/tucson/' },
      { label: 'Yuma North', href: '/campuses/yuma-north/' },
      { label: 'Yuma Middle', href: '/campuses/yuma-middle/' },
    ],
  },
  { label: 'Our Approach', href: site.approachUrl },
  {
    label: 'Admissions',
    href: '/admissions/',
    children: [
      { label: 'Enroll', href: '/admissions/' },
      { label: 'Student Interest Form', href: '/admissions/interest-form/' },
      { label: 'Tours & Open Houses', href: '/visit/' },
    ],
  },
  {
    label: 'About',
    href: '/about/',
    children: [
      { label: 'About Us', href: '/about/' },
      { label: 'District Information', href: '/district-information/' },
      { label: 'Careers', href: '/careers/' },
      { label: 'Contact', href: '/contact/' },
      { label: 'Tax Credit', href: site.taxCreditUrl },
    ],
  },
];

/** District-wide family portals (from the old site's Portals menus). */
export const portals = [
  { label: 'PowerSchool', note: 'See how my child is doing', href: 'https://amerischools.powerschool.com/public/home.html' },
  { label: 'ParentSquare', note: 'School messages and updates', href: 'https://www.parentsquare.com/' },
  { label: 'ClassDojo', note: 'Homework and classroom updates', href: 'https://www.classdojo.com/' },
  { label: 'Clever', note: 'Student sign-in for learning apps', href: 'https://clever.com/' },
  { label: 'A-Z Reading', note: 'Reading practice', href: 'https://www.readinga-z.com/' },
  { label: 'RAZ Kids', note: 'Leveled reading online', href: 'https://www.raz-kids.com/' },
  { label: 'Khan Academy', note: 'Math and more', href: 'https://www.khanacademy.org/' },
];

export const isExternal = (href: string) => /^https?:\/\//.test(href);

export const campuses: Campus[] = [
  {
    slug: 'phoenix',
    name: 'Phoenix',
    city: 'Phoenix',
    grades: 'K–8',
    gradeRange: [0, 8],
    street: '1333 W Camelback Road',
    cityStateZip: 'Phoenix, AZ 85013',
    phone: '602.532.0100',
    headline: ['Learning by doing.', 'Growing with purpose.'],
    intro: 'Hands-on projects, skill-based instruction, and a community that practices kindness.',
    legacyPath: '/phoenix/',
    heroPhoto: 'phoenixGirlsWriting',
    cardPhoto: 'phoenixHandRaised',
  },
  {
    slug: 'tucson',
    name: 'Tucson',
    city: 'Tucson',
    grades: 'K–8',
    gradeRange: [0, 8],
    street: '1150 N Country Club Road',
    cityStateZip: 'Tucson, AZ 85716',
    phone: '520.620.1100',
    headline: ['Learning by doing.', 'Growing with purpose.'],
    intro: 'Hands-on projects, skill-based instruction, and a community that practices kindness.',
    legacyPath: '/tucson/',
    heroPhoto: 'classroomHandsUp',
    cardPhoto: 'classroomHandsUp',
  },
  {
    // TODO: confirm grades — mockup says K–5, live site says K–8.
    slug: 'yuma-north',
    name: 'Yuma North',
    city: 'Yuma',
    grades: 'K–5',
    gradeRange: [0, 5],
    street: '1220 S 4th Avenue',
    cityStateZip: 'Yuma, AZ 85364',
    phone: '928.919.7203',
    headline: ['Learning by doing.', 'Growing with purpose.'],
    intro: 'Hands-on projects, skill-based instruction, and a community that practices kindness.',
    legacyPath: '/yuma-north/',
    heroPhoto: 'yumaNorthRunning',
    cardPhoto: 'yumaNorthThumbsUp',
  },
  {
    // TODO: confirm grades — mockup says 6–8, live site says K–8.
    slug: 'yuma-middle',
    name: 'Yuma Middle',
    city: 'Yuma',
    grades: '6–8',
    gradeRange: [6, 8],
    street: '2098 S 3rd Avenue',
    cityStateZip: 'Yuma, AZ 85364',
    phone: '928.329.1100',
    headline: ['Learning by doing.', 'Growing with purpose.'],
    intro: 'Hands-on projects, skill-based instruction, and a community that practices kindness.',
    legacyPath: '/yuma-middle-school/',
    heroPhoto: 'teacherHelpingStudents',
    cardPhoto: 'tucsonStudent',
  },
];

export const gradeBands: { id: GradeBand; label: string; range: [number, number]; title: string; body: string; photo: PhotoKey }[] = [
  {
    id: 'kindergarten',
    label: 'Kindergarten',
    range: [0, 0],
    title: 'A joyful, confident start.',
    body: 'Early literacy, number sense, and play-based exploration help every child feel at home in school.',
    photo: 'kinderSlide',
  },
  {
    id: 'elementary',
    label: 'Elementary',
    range: [1, 5],
    title: 'Learning through connection and discovery.',
    body: "Explore academics, hands-on learning, and school life for your child's grade.",
    photo: 'yumaNorthFriends',
  },
  {
    id: 'middle',
    label: 'Middle School',
    range: [6, 8],
    title: 'Independence, with support.',
    body: 'Students take on bigger projects and responsibilities, with teachers who know them well.',
    photo: 'phoenixGirlsWriting',
  },
];

export const telHref = (phone: string) => `tel:+1${phone.replace(/\D/g, '')}`;
export const directionsHref = (c: Campus) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${c.street}, ${c.cityStateZip}`)}`;
export const gradeLabel = (g: number) => (g === 0 ? 'Kindergarten' : `Grade ${g}`);
