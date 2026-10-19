// Local content source. Step 4 of the build plan replaces these with Sanity
// GROQ queries; keep the shapes stable so pages don't need to change.

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
}

export const site = {
  name: 'AmeriSchools Academy',
  applyUrl: 'https://amerischools.org/now-enrolling-2025-2026-charter-school/',
  currentFamiliesUrl: '/current-families/',
  preschool: { name: 'Capstone Quest Academy', url: 'https://capstonequestacademy.com/' },
};

export const mainNav = [
  { label: 'Campuses', href: '/campuses/' },
  { label: 'Our Approach', href: '/our-approach/' },
  { label: 'Admissions', href: '/admissions/' },
  { label: 'About', href: '/about/' },
];

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
  },
];

export const gradeBands: { id: GradeBand; label: string; range: [number, number]; title: string; body: string }[] = [
  {
    id: 'kindergarten',
    label: 'Kindergarten',
    range: [0, 0],
    title: 'A joyful, confident start.',
    body: 'Early literacy, number sense, and play-based exploration help every child feel at home in school.',
  },
  {
    id: 'elementary',
    label: 'Elementary',
    range: [1, 5],
    title: 'Learning through connection and discovery.',
    body: "Explore academics, hands-on learning, and school life for your child's grade.",
  },
  {
    id: 'middle',
    label: 'Middle School',
    range: [6, 8],
    title: 'Independence, with support.',
    body: 'Students take on bigger projects and responsibilities, with teachers who know them well.',
  },
];

export const telHref = (phone: string) => `tel:+1${phone.replace(/\D/g, '')}`;
export const directionsHref = (c: Campus) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${c.street}, ${c.cityStateZip}`)}`;
export const gradeLabel = (g: number) => (g === 0 ? 'Kindergarten' : `Grade ${g}`);
