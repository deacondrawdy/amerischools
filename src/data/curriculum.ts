// Campus curriculum pages (adapted from the old /<campus>/parent-resources/curriculum/ pages).
// Every section except the hero, focus areas, approach, toolkit and pillars is optional.
import type { PhotoKey } from './photos';

export type CurriculumIcon =
  | 'math' | 'science' | 'book' | 'music' | 'run' | 'palette' | 'laptop' | 'globe'
  | 'handshake' | 'shield' | 'award' | 'star' | 'users' | 'layers' | 'puzzle' | 'trees'
  | 'search' | 'lightbulb' | 'hammer' | 'presentation' | 'chart' | 'heart';

export interface CurriculumPage {
  headline: [string, string];
  lead: string;
  heroPhoto: PhotoKey;
  academics: { label: string; icon: CurriculumIcon }[];
  extracurricular: string[];
  approach: {
    eyebrow: string;
    title: string;
    intro: string;
    tabs: { label: string; body: string; photo: PhotoKey }[];
  };
  wellRounded?: { title: string; body: string; icon: CurriculumIcon }[];
  pbl?: {
    intro: string;
    steps?: { title: string; body: string; icon: CurriculumIcon }[];
    skills?: { label: string; icon: CurriculumIcon }[];
  };
  toolkit: { intro: string; groups: { label: string; icon: CurriculumIcon; items: string[] }[] };
  pillars: {
    eyebrow: string;
    title: string;
    intro: string;
    items: { title: string; body: string; icon: CurriculumIcon }[];
  };
  community?: { intro: string; partners: string[] };
  offerings?: { title: string; intro: string; items: string[]; note?: string };
  goal?: { title: string; body: string };
}

const yumaToolkit: CurriculumPage['toolkit'] = {
  intro: 'Core programs and supplements teachers build from, plus targeted support for students who need it.',
  groups: [
    { label: 'Math', icon: 'math', items: ['Engage NY', 'Imagine Math', 'Excel'] },
    { label: 'Reading & language', icon: 'book', items: ['Reading Street', 'Imagine Reading', 'Imagine Language and Literacy'] },
    { label: 'Science & social studies', icon: 'globe', items: ['Studies Weekly'] },
    { label: 'Technology', icon: 'laptop', items: ['Microsoft Word', 'Excel', 'PowerPoint', 'Teams'] },
    { label: 'Intervention', icon: 'heart', items: ['Sonday Reading System', 'Phonics for Reading', 'STAMS', 'STARS'] },
  ],
};

const yumaWellRounded: CurriculumPage['wellRounded'] = [
  {
    title: 'Art',
    body: 'Skills build by grade level, starting with basics like primary colors and fine motor skills for younger students.',
    icon: 'palette',
  },
  {
    title: 'Music',
    body: 'Pitches, rhythms and melodies on different instruments, plus songs for the Holiday performance and special occasions.',
    icon: 'music',
  },
  {
    title: 'Physical Education',
    body: 'Gross motor skills, hand-eye coordination and good sportsmanship in games and activities.',
    icon: 'run',
  },
];

const yumaTabs = (mathEla: string): CurriculumPage['approach']['tabs'] => [
  { label: 'Math & reading', body: mathEla, photo: 'teacherHelpingStudents' },
  {
    label: 'Science & technology',
    body: 'Studies Weekly is the starting point for science and social studies, and teachers build out from there. Technology is used daily: each child has a netbook and uses Microsoft Word, Excel, PowerPoint and Teams to build their skills.',
    photo: 'illustrativeStudentLaptop',
  },
  {
    label: 'Support',
    body: 'Students work in the classroom, in small groups and one-on-one with teachers and paraprofessionals. The Special Education program is inclusive and also works individually with students, and many teachers stay before and after school to help students master essential skills.',
    photo: 'yumaNorthFriends',
  },
];

export const curriculum: Record<string, CurriculumPage> = {
  tucson: {
    headline: ['Skills that matter,', 'learned by doing.'],
    lead: 'Academics at the Tucson – Country Club Campus focus on mathematics, science, language arts and the creative arts, building collaboration, communication and critical thinking alongside content mastery.',
    heroPhoto: 'classroomHandsUp',
    academics: [
      { label: 'Mathematics', icon: 'math' },
      { label: 'Science', icon: 'science' },
      { label: 'Language Arts', icon: 'book' },
      { label: 'Music Program', icon: 'music' },
    ],
    extracurricular: ['Explorations', 'Community Service', 'Grand Canyon Exploration', 'Renaissance Fair'],
    approach: {
      eyebrow: 'FLEX Time',
      title: 'Facilitated Learning Experiences',
      intro: 'During FLEX Time our teachers become the creative masterminds behind highly engaging, hands-on, data-driven lessons that build the foundational skills for future success.',
      tabs: [
        {
          label: 'Elementary',
          body: 'Students are split into smaller mixed-grade groups. Working across grade levels has fostered more positive interactions and motivated students to support their peers. Data drives instruction to close learning gaps, and teachers meet often to share ideas, strategies and hands-on lessons.',
          photo: 'classroomHandsUp',
        },
        {
          label: 'Middle School',
          body: 'Students rotate in small groups between classes built around different themes, each facilitated by a passionate teacher. FLEX creates enriched, hands-on chances to problem solve and develop the skills that matter.',
          photo: 'tucsonStudent',
        },
      ],
    },
    pbl: {
      intro: 'Project Based Learning puts students in charge of their learning as they build problem-solving skills that apply to every area of life.',
      steps: [
        { title: 'Ask a driving question', body: 'Every project starts with a question that has more than one answer.', icon: 'search' },
        { title: 'Explore solutions', body: 'Students investigate and weigh multiple possible solutions.', icon: 'lightbulb' },
        { title: 'Design a product', body: 'They create something that answers the driving question.', icon: 'hammer' },
        { title: 'Showcase the work', body: 'The finished product shows their effort across the whole process.', icon: 'presentation' },
      ],
    },
    toolkit: {
      intro: "Evidence-based resources aligned with the Arizona Department of Education's Academic Standards.",
      groups: [
        { label: 'Reading', icon: 'book', items: ['Pearson Reading Street'] },
        { label: 'Math', icon: 'math', items: ['Eureka Math', 'Carnegie Math'] },
        { label: 'Learning platform', icon: 'laptop', items: ['Imagine Learning'] },
        { label: 'Assessment', icon: 'chart', items: ['Galileo Assessment'] },
      ],
    },
    pillars: {
      eyebrow: 'Our culture',
      title: 'Three pillars',
      intro: 'A learning environment that is safe and free from distractions, built on three pillars every student is expected to uphold. Woven together, they develop individuals with a strong work ethic who are reflective and compassionate.',
      items: [
        { title: 'Respect', body: 'For classmates, teachers and the community around us.', icon: 'handshake' },
        { title: 'Responsibility', body: 'Owning our learning, our choices and our school.', icon: 'shield' },
        { title: 'Hard Work', body: 'Effort every day that builds a lasting work ethic.', icon: 'award' },
      ],
    },
    goal: {
      title: 'Our goal is simple.',
      body: 'Provide a rigorous and well-balanced education in a setting focused on bettering ourselves and the community around us.',
    },
  },

  'yuma-north': {
    headline: ['Whole-child learning,', 'at every level.'],
    lead: 'At Yuma North the focus is all-inclusive for the well-being of the whole child, with skill-level-based instruction that keeps every student challenged wherever they are academically.',
    heroPhoto: 'yumaNorthRunning',
    academics: [
      { label: 'Mathematics', icon: 'math' },
      { label: 'Science', icon: 'science' },
      { label: 'Language Arts', icon: 'book' },
      { label: 'Physical Education', icon: 'run' },
      { label: 'Art Programs', icon: 'palette' },
    ],
    extracurricular: ['Explorations', 'Zumba/Dance', 'Photography', 'Spanish', 'Technology', 'Cheerleading', 'Cooking'],
    approach: {
      eyebrow: 'How we teach',
      title: 'Skill-level based, so every child is challenged',
      intro: 'Instruction meets students where they are, with remediation and advancement in the classroom, in small groups and one-on-one.',
      tabs: yumaTabs(
        'Engage NY anchors math, with Excel and Imagine Math for practice toward mastery. Kindergarten through 3rd level use Reading Street; 4th level and up are novel-based, supplemented by Imagine Reading. Imagine Language and Literacy supports grammar, spelling, reading in context and patterns in language for K–5.',
      ),
    },
    wellRounded: yumaWellRounded,
    toolkit: yumaToolkit,
    pillars: {
      eyebrow: 'Results',
      title: 'A shared vision for excellence',
      intro: 'Staff, parents and administration work together so every child shows growth in academic and social areas.',
      items: [
        { title: 'Performing Plus', body: 'Recognized by the Arizona Department of Education: our students learn and achieve at higher rates than students across Arizona.', icon: 'award' },
        { title: '“A” rated campus', body: 'Yuma North was an “A” campus for the 2019 school year, with students showing growth.', icon: 'star' },
        { title: 'Partners in learning', body: 'Staff, parents and administration share one vision for every child’s success.', icon: 'users' },
      ],
    },
    community: {
      intro: 'Students use the community as a laboratory, learning from everything around them and giving back.',
      partners: [
        'Cocopah Indian Tribe', 'Renaissance Fair', 'Pumpkin Patch', 'The Humane Society', 'Food Bank / The Mission',
        'Habitat for Humanity', 'Yuma Territorial Prison', 'Yuma Historical Crossing Park', 'Yuma County Library',
        'Yuma Conservation Garden', "Betty's Kitchen wildlife area", "Fry's Food Stores",
      ],
    },
    offerings: {
      title: 'Before & after school',
      intro: 'Extracurricular activities before and after school include:',
      items: ['Tutoring', 'Yoga', 'Creating music', 'Computers', 'Arts and crafts', 'Chess', 'Literature and art', 'Cooking', 'Lego Club'],
      note: 'A competitive sports program with surrounding charter and private schools is offered for grades 4–5.',
    },
  },

  'yuma-middle': {
    headline: ['Bigger projects,', 'real-world skills.'],
    lead: 'At Yuma Middle the focus is all-inclusive for the well-being of the whole child, with skill-level-based instruction, project-based learning and a wide range of clubs.',
    heroPhoto: 'teacherHelpingStudents',
    academics: [
      { label: 'Mathematics', icon: 'math' },
      { label: 'Science', icon: 'science' },
      { label: 'Language Arts', icon: 'book' },
      { label: 'Physical Education', icon: 'run' },
      { label: 'Art Programs', icon: 'palette' },
    ],
    extracurricular: ['Explorations', 'Zumba/Dance', 'Photography', 'Spanish', 'Technology', 'Cheerleading', 'Cooking'],
    approach: {
      eyebrow: 'How we teach',
      title: 'Skill-level based, so every student is challenged',
      intro: 'Instruction meets students where they are, with remediation and advancement in the classroom, in small groups and one-on-one.',
      tabs: yumaTabs(
        'Engage NY anchors math, with Excel and Imagine Math for practice toward mastery. Language arts is novel-based, supplemented by Imagine Reading.',
      ),
    },
    wellRounded: yumaWellRounded,
    pbl: {
      intro: 'Students take on projects that show what they understand and offer solutions to realistic problems, building skills they will use for a lifetime.',
      skills: [
        { label: 'Budgeting', icon: 'chart' },
        { label: 'Designing', icon: 'palette' },
        { label: 'Problem-solving', icon: 'puzzle' },
        { label: 'Collaborating', icon: 'users' },
      ],
    },
    toolkit: yumaToolkit,
    pillars: {
      eyebrow: 'Why families choose us',
      title: 'The AmeriSchools difference',
      intro: 'A shared vision between staff, parents and administration so every student shows growth in academic and social areas.',
      items: [
        { title: 'Non-graded', body: 'Students advance by skill, continually challenged wherever they are.', icon: 'layers' },
        { title: 'Community as a laboratory', body: 'Learning from everything around us, and giving back.', icon: 'trees' },
        { title: 'Integrated', body: 'Subjects connect so ideas carry from one class to the next.', icon: 'puzzle' },
        { title: 'Clubs', body: 'Enrichment that grows interests beyond the classroom.', icon: 'star' },
      ],
    },
    community: {
      intro: 'Students use the community as a laboratory, learning from everything around them and giving back.',
      partners: [
        'Cocopah Indian Tribe', 'Renaissance Fair', 'The Humane Society', 'Food Bank / The Mission', 'Yuma Territorial Prison',
        'Yuma Historical Crossing Park', 'Yuma County Library', 'Yuma Conservation Garden', "Fry's Food Stores",
      ],
    },
    offerings: {
      title: 'Clubs & enrichment',
      intro: 'Each site offers activities, clubs and enrichment such as:',
      items: ['Yearbook club', 'After-school tutoring', 'Cross country', 'Yoga', 'Zumba', 'Knitting club', 'Language clubs (Spanish, French)', 'Technology clubs'],
      note: 'Offerings change each year; check with your principal to see which clubs are running.',
    },
  },
};
