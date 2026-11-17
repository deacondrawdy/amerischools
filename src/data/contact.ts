// Campus contact pages (from the old /<campus>/contact-info/ pages). Address and main phone
// come from the campus record in site.ts; this file adds fax, social and hours.

export interface CampusContact {
  fax: string;
  facebook: { label: string; href: string };
  schoolHours: { label: string; times: string[] }[];
  halfDays: string;
  officeHours: string;
  summerOfficeHours: string;
}

export const contact: Record<string, CampusContact> = {
  tucson: {
    fax: '520.624.4376',
    facebook: { label: 'Tucson Facebook', href: 'https://www.facebook.com/AmeriSchoolsTucson/' },
    schoolHours: [
      { label: 'Elementary School', times: ['8:30 AM – 3:15 PM', '8:30 AM – 1:00 PM Thursdays'] },
      { label: 'Middle School', times: ['8:30 AM – 3:30 PM', '8:30 AM – 1:00 PM Thursdays'] },
    ],
    halfDays: 'Release at 12:30 PM',
    officeHours: '8:00 AM – 4:00 PM, Monday – Friday',
    summerOfficeHours: '9:00 AM – 3:00 PM, Monday – Friday',
  },
  'yuma-north': {
    fax: '928.919.7205',
    facebook: { label: 'Yuma North Facebook', href: 'https://www.facebook.com/amerischoolsyumanorth' },
    schoolHours: [
      { label: 'Readiness – Second Level (K–2)', times: ['8:30 AM – 3:00 PM', '8:30 AM – 1:00 PM Thursdays'] },
      { label: 'Third – Sixth Level (3–6)', times: ['8:30 AM – 3:15 PM', '8:30 AM – 1:00 PM Thursdays'] },
    ],
    halfDays: 'Release at 12:30 PM',
    officeHours: '8:00 AM – 4:00 PM, Monday – Friday',
    summerOfficeHours: '9:00 AM – 3:00 PM, Monday – Friday',
  },
  'yuma-middle': {
    fax: '928.329.9177',
    facebook: { label: 'Yuma Middle Facebook', href: 'https://www.facebook.com/amerischoolsyumasouth' },
    // TODO: confirm — the old page listed the same K–2 / 3–6 level bands as Yuma North.
    schoolHours: [
      { label: 'Readiness – Second Level', times: ['8:30 AM – 3:00 PM', '8:30 AM – 1:00 PM Thursdays'] },
      { label: 'Third – Sixth Level', times: ['8:30 AM – 3:15 PM', '8:30 AM – 1:00 PM Thursdays'] },
    ],
    halfDays: 'Release at 12:30 PM',
    officeHours: '8:00 AM – 4:00 PM, Monday – Friday',
    summerOfficeHours: '9:00 AM – 3:00 PM, Monday – Friday',
  },
};
