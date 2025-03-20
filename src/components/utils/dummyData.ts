import musicIcon from '../../assets/icons/music.svg';
import spaIcon from '../../assets/icons/spa.svg';
import swimIcon from '../../assets/icons/swim.svg';
import gymIcon from '../../assets/icons/gym.svg';
import therapyIcon from '../../assets/icons/therapy.svg';
import calendarIcon from '../../assets/icons/calender.svg';
import Avatar from '../../assets/images/greyPhoto.png';

interface BusinessOption {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface MonthlyClientOption {
  id: string;
  label: string;
}

interface BusinessPurpose {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface TeamOption {
  id: string;
  label: string;
}

interface Client {
  name: string;
  session: string[];
  phone: string;
  status: 'active' | 'inactive';
}

export type ClassLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type ClassType = 'Trial' | 'Nomal' | 'MakeUp';
export type RepeatDays = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface ClassData {
  id: number;
  class: string;
  classLevel: ClassLevel;
  AssignedTo: string;
  classType: ClassType;
  slots: number;
  date: Date;
  duration: string;
  repeats: RepeatDays[];
  profileImage: string;
}

export type Staff = {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  staffNumber: string;
  idNumber: number;
  phoneNumber: string;
  email: string;
  assignedClasses: string;
  status: 'Active' | 'Inactive';
  profileImage: string;
};

export const clientsData: Client[] = [
  {
    name: 'James Muli',
    session: ['Mon', 'Fri'],
    phone: '+1234567890',
    status: 'active',
  },
  {
    name: 'Alice Johnson',
    session: ['Tue', 'Thu'],
    phone: '+1234567891',
    status: 'active',
  },
  {
    name: 'Michael Brown',
    session: ['Wed', 'Sat'],
    phone: '+1234567892',
    status: 'inactive',
  },
  {
    name: 'Emily Davis',
    session: ['Mon', 'Wed', 'Fri'],
    phone: '+1234567893',
    status: 'active',
  },
  {
    name: 'Daniel Wilson',
    session: ['Tue', 'Thu', 'Sat'],
    phone: '+1234567894',
    status: 'inactive',
  },
  {
    name: 'Sophia Martinez',
    session: ['Mon', 'Tue', 'Wed'],
    phone: '+1234567895',
    status: 'active',
  },
  {
    name: 'Matthew Anderson',
    session: ['Thu', 'Fri', 'Sat'],
    phone: '+1234567896',
    status: 'active',
  },
  {
    name: 'Olivia Taylor',
    session: ['Mon', 'Wed', 'Fri'],
    phone: '+1234567897',
    status: 'inactive',
  },
  {
    name: 'William Thomas',
    session: ['Tue', 'Thu', 'Sat'],
    phone: '+1234567898',
    status: 'active',
  },
  {
    name: 'Ava Hernandez',
    session: ['Mon', 'Tue', 'Thu'],
    phone: '+1234567899',
    status: 'active',
  },
  {
    name: 'Ethan Moore',
    session: ['Wed', 'Fri', 'Sat'],
    phone: '+1234567800',
    status: 'inactive',
  },
  {
    name: 'Mia Jackson',
    session: ['Mon', 'Wed', 'Fri'],
    phone: '+1234567801',
    status: 'active',
  },
];

export const businessOptions: BusinessOption[] = [
  {
    id: 'music',
    icon: musicIcon,
    title: 'Music School',
    description: 'Just the usual music classes I guess',
  },
  {
    id: 'spa',
    icon: spaIcon,
    title: 'Spa',
    description: 'Just the usual spa classes I guess',
  },
  {
    id: 'swim',
    icon: swimIcon,
    title: 'Swim School',
    description: 'Just the usual swim classes I guess',
  },
  {
    id: 'gym',
    icon: gymIcon,
    title: 'Gym',
    description: 'Just the usual gym classes I guess',
  },
  {
    id: 'therapy',
    icon: therapyIcon,
    title: 'Therapy',
    description: 'Just the usual therapy classes I guess',
  },
];

export const monthlyClientOptions: MonthlyClientOption[] = [
  { id: '1', label: '<10' },
  { id: '2', label: '10-20' },
  { id: '3', label: '20-30' },
  { id: '4', label: '30-40' },
  { id: '5', label: '>50' },
];

export const businessPurpose: BusinessPurpose[] = [
  {
    id: '1',
    icon: calendarIcon,
    title: 'Scheduling',
    description:
      'Just the usual music classes I guess. Just the usual music classes I guess',
  },
  {
    id: '2',
    icon: calendarIcon,
    title: 'Scheduling',
    description:
      'Just the usual music classes I guess. Just the usual music classes I guess',
  },
  {
    id: '3',
    icon: calendarIcon,
    title: 'Scheduling',
    description:
      'Just the usual music classes I guess. Just the usual music classes I guess',
  },
];

export const teamOptions: TeamOption[] = [
  { id: 'just-me', label: 'Just me' },
  { id: '1', label: '1' },
  { id: '2', label: '2' },
  { id: '3', label: '3' },
  { id: '4', label: '4' },
  { id: '5', label: '5' },
  { id: '6', label: '6' },
  { id: '7-plus', label: '7 +' },
];

export const data: Staff[] = [
    {
      id: 1,
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      role: 'Swim Instructor',
      staffNumber: 'SN001',
      idNumber: 366357,
      phoneNumber: '+1234567890',
      email: 'john.doe@example.com',
      assignedClasses: 'Beginner Swim, Advanced Swim',
      status: 'Active',
      profileImage: Avatar,
    },
    {
      id: 2,
      name: 'Jane Smith',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'Lifeguard',
      staffNumber: 'SN002',
      idNumber: 366358,
      phoneNumber: '+1234567891',
      email: 'jane.smith@example.com',
      assignedClasses: 'Pool Safety, First Aid',
      status: 'Inactive',
      profileImage: Avatar,
    },
    {
      id: 3,
      name: 'Alice Johnson',
      firstName: 'Alice',
      lastName: 'Johnson',
      role: 'Swim Coach',
      staffNumber: 'SN003',
      idNumber: 366359,
      phoneNumber: '+1234567892',
      email: 'alice.johnson@example.com',
      assignedClasses: 'Competitive Swim, Swim Team',
      status: 'Active',
      profileImage: Avatar,
    },
    {
      id: 4,
      name: 'Bob Brown',
      firstName: 'Bob',
      lastName: 'Brown',
      role: 'Swim Instructor',
      staffNumber: 'SN004',
      idNumber: 366360,
      phoneNumber: '+1234567893',
      email: 'bob.brown@example.com',
      assignedClasses: 'Kids Swim, Parent-Child Swim',
      status: 'Active',
      profileImage: Avatar,
    },
    {
      id: 5,
      name: 'Emma Wilson',
      firstName: 'Emma',
      lastName: 'Wilson',
      role: 'Aquatics Director',
      staffNumber: 'SN005',
      idNumber: 366361,
      phoneNumber: '+1234567894',
      email: 'emma.wilson@example.com',
      assignedClasses: 'Swim Program Management',
      status: 'Active',
      profileImage: Avatar,
    },
    {
      id: 6,
      name: 'Michael Clark',
      firstName: 'Michael',
      lastName: 'Clark',
      role: 'Water Aerobics Instructor',
      staffNumber: 'SN006',
      idNumber: 366362,
      phoneNumber: '+1234567895',
      email: 'michael.clark@example.com',
      assignedClasses: 'Water Aerobics, Senior Swim',
      status: 'Inactive',
      profileImage: Avatar,
    },
    {
      id: 7,
      name: 'Sarah Davis',
      firstName: 'Sarah',
      lastName: 'Davis',
      role: 'Swim Instructor',
      staffNumber: 'SN007',
      idNumber: 366363,
      phoneNumber: '+1234567896',
      email: 'sarah.davis@example.com',
      assignedClasses: 'Teen Swim, Adult Swim',
      status: 'Active',
      profileImage: Avatar,
    },
    {
      id: 8,
      name: 'James Wilson',
      firstName: 'James',
      lastName: 'Wilson',
      role: 'Diving Coach',
      staffNumber: 'SN008',
      idNumber: 366364,
      phoneNumber: '+1234567897',
      email: 'james.wilson@example.com',
      assignedClasses: 'Diving, Springboard Training',
      status: 'Active',
      profileImage: Avatar,
    },
    {
      id: 9,
      name: 'Sarah Daviss',
      firstName: 'Sarah',
      lastName: 'Daviss',
      role: 'Swim Instructor',
      staffNumber: 'SN009',
      idNumber: 366365,
      phoneNumber: '+1234567898',
      email: 'sarah.daviss@example.com',
      assignedClasses: 'Private Swim Lessons',
      status: 'Active',
      profileImage: Avatar,
    },
    {
      id: 10,
      name: 'James Wilsonn',
      firstName: 'James',
      lastName: 'Wilsonn',
      role: 'Swim Team Coordinator',
      staffNumber: 'SN010',
      idNumber: 366366,
      phoneNumber: '+1234567899',
      email: 'james.wilsonn@example.com',
      assignedClasses: 'Swim Team, Swim Meets',
      status: 'Active',
      profileImage: Avatar,
    },
  ];

export const classesData: ClassData[] = [
  {
    id: 1,
    class: 'SWM 401',
    classLevel: 'Advanced',
    AssignedTo: 'Coach Raymond',
    classType: 'Trial',
    slots: 24,
    date: new Date('2025-01-12'),
    duration: '10.00am-12.00pm',
    repeats: ['Mon', 'Wed', 'Fri'],
    profileImage: Avatar,
  },
  {
    id: 2,
    class: 'SWM 201',
    classLevel: 'Intermediate',
    AssignedTo: 'Coach Sarah',
    classType: 'Nomal',
    slots: 20,
    date: new Date('2025-01-15'),
    duration: '2.00pm-4.00pm',
    repeats: ['Tue', 'Thu'],
    profileImage: Avatar,
  },
  {
    id: 3,
    class: 'SWM 101',
    classLevel: 'Beginner',
    AssignedTo: 'Coach John',
    classType: 'Trial',
    slots: 18,
    date: new Date('2025-01-18'),
    duration: '9.00am-11.00am',
    repeats: ['Mon', 'Wed', 'Fri'],
    profileImage: Avatar,
  },
  {
    id: 4,
    class: 'SWM 301',
    classLevel: 'Intermediate',
    AssignedTo: 'Coach Emily',
    classType: 'Nomal',
    slots: 22,
    date: new Date('2025-01-20'),
    duration: '3.00pm-5.00pm',
    repeats: ['Tue', 'Thu', 'Sat'],
    profileImage: Avatar,
  },
  {
    id: 5,
    class: 'SWM 501',
    classLevel: 'Advanced',
    AssignedTo: 'Coach Michael',
    classType: 'Trial',
    slots: 16,
    date: new Date('2025-01-22'),
    duration: '1.00pm-3.00pm',
    repeats: ['Mon', 'Wed', 'Fri'],
    profileImage: Avatar,
  },
  {
    id: 6,
    class: 'SWM 102',
    classLevel: 'Beginner',
    AssignedTo: 'Coach Laura',
    classType: 'MakeUp',
    slots: 20,
    date: new Date('2025-01-25'),
    duration: '10.00am-12.00pm',
    repeats: ['Tue', 'Thu'],
    profileImage: Avatar,
  },
  {
    id: 7,
    class: 'SWM 202',
    classLevel: 'Intermediate',
    AssignedTo: 'Coach David',
    classType: 'Trial',
    slots: 18,
    date: new Date('2025-01-28'),
    duration: '2.00pm-4.00pm',
    repeats: ['Mon', 'Wed', 'Fri'],
    profileImage: Avatar,
  },
  {
    id: 8,
    class: 'SWM 302',
    classLevel: 'Intermediate',
    AssignedTo: 'Coach Rachel',
    classType: 'Nomal',
    slots: 24,
    date: new Date('2025-01-30'),
    duration: '9.00am-11.00am',
    repeats: ['Tue', 'Thu', 'Sat'],
    profileImage: Avatar,
  },
  {
    id: 9,
    class: 'SWM 402',
    classLevel: 'Advanced',
    AssignedTo: 'Coach Daniel',
    classType: 'Trial',
    slots: 20,
    date: new Date('2025-02-02'),
    duration: '3.00pm-5.00pm',
    repeats: ['Mon', 'Wed', 'Fri'],
    profileImage: Avatar,
  },
  {
    id: 10,
    class: 'SWM 502',
    classLevel: 'Advanced',
    AssignedTo: 'Coach Olivia',
    classType: 'MakeUp',
    slots: 22,
    date: new Date('2025-02-05'),
    duration: '1.00pm-3.00pm',
    repeats: ['Tue', 'Thu'],
    profileImage: Avatar,
  },
  {
    id: 11,
    class: 'SWM 103',
    classLevel: 'Beginner',
    AssignedTo: 'Coach Ethan',
    classType: 'Trial',
    slots: 18,
    date: new Date('2025-02-08'),
    duration: '10.00am-12.00pm',
    repeats: ['Mon', 'Wed', 'Fri'],
    profileImage: Avatar,
  },
  {
    id: 12,
    class: 'SWM 203',
    classLevel: 'Intermediate',
    AssignedTo: 'Coach Sophia',
    classType: 'Nomal',
    slots: 20,
    date: new Date('2025-02-10'),
    duration: '2.00pm-4.00pm',
    repeats: ['Tue', 'Thu', 'Sat'],
    profileImage: Avatar,
  },
  {
    id: 13,
    class: 'SWM 303',
    classLevel: 'Intermediate',
    AssignedTo: 'Coach Liam',
    classType: 'Trial',
    slots: 24,
    date: new Date('2025-02-12'),
    duration: '9.00am-11.00am',
    repeats: ['Mon', 'Wed', 'Fri'],
    profileImage: Avatar,
  },
];

export const sectionsData = [
  {
    title: 'Profile',
    description: 'Manage this team member’s basic information',
  },
  {
    title: 'Roles',
    description: 'Manage this team member’s roles and compensation',
  },
  {
    title: 'Permissions',
    description: 'Manage what this team member can see and do across FlowKey',
  },
];

export const permissionsData = [
  {
    id: 'createEvents',
    label: 'Create New Events',
    description: 'Add new classes, appointments and personal appointments',
  },
  {
    id: 'addClients',
    label: 'Add New Clients',
    description: 'Onboard new clients.',
  },
  {
    id: 'createInvoices',
    label: 'Create and Send Client Invoices',
    description: 'Generate payment receipts and confirm transactions',
  },
];

export const roleOptions = [
  { label: 'Manager', value: 'manager' },
  { label: 'Supervisor', value: 'supervisor' },
  { label: 'Staff', value: 'staff' },
  { label: 'Intern', value: 'intern' },
];

export const payTypeOptions = [
  { label: 'Hourly', value: 'hourly' },
  { label: 'Salary', value: 'salary' },
  { label: 'Commission', value: 'commission' },
];

export const categoryOptions = [
  'STARfish',
  'STAnley',
  'Grade',
  'Advanced',
  'Platinum',
];
