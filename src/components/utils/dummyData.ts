import musicIcon from '../../assets/icons/music.svg';
import spaIcon from '../../assets/icons/spa.svg';
import swimIcon from '../../assets/icons/swim.svg';
import gymIcon from '../../assets/icons/gym.svg';
import therapyIcon from '../../assets/icons/therapy.svg';
import calendarIcon from '../../assets/icons/calender.svg';
import Avatar from '../../assets/images/avatar.png';

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

export type Staff = {
  id: number;
  name: string;
  staffNumber: string;
  idNumber: number;
  phoneNumber: string;
  email: string;
  assignedClasses: string;
  status: 'Active' | 'Inactive';
  profileImage: string;
};

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
    staffNumber: 'SN001',
    idNumber: 366357,
    phoneNumber: '+1234567890',
    email: 'john.doe@example.com',
    assignedClasses: 'Math, Science',
    status: 'Active',
    profileImage: Avatar,
  },
  {
    id: 2,
    name: 'Jane Smith',
    staffNumber: 'SN002',
    idNumber: 366358,
    phoneNumber: '+1234567891',
    email: 'jane.smith@example.com',
    assignedClasses: 'English, History',
    status: 'Inactive',
    profileImage: Avatar,
  },
  {
    id: 3,
    name: 'Alice Johnson',
    staffNumber: 'SN003',
    idNumber: 366359,
    phoneNumber: '+1234567892',
    email: 'alice.johnson@example.com',
    assignedClasses: 'Physics, Chemistry',
    status: 'Active',
    profileImage: Avatar,
  },
  {
    id: 4,
    name: 'Bob Brown',
    staffNumber: 'SN004',
    idNumber: 366360,
    phoneNumber: '+1234567893',
    email: 'bob.brown@example.com',
    assignedClasses: 'Biology, Geography',
    status: 'Active',
    profileImage: Avatar,
  },
  {
    id: 5,
    name: 'Emma Wilson',
    staffNumber: 'SN005',
    idNumber: 366361,
    phoneNumber: '+1234567894',
    email: 'emma.wilson@example.com',
    assignedClasses: 'Art, Music',
    status: 'Active',
    profileImage: Avatar,
  },
  {
    id: 6,
    name: 'Michael Clark',
    staffNumber: 'SN006',
    idNumber: 366362,
    phoneNumber: '+1234567895',
    email: 'michael.clark@example.com',
    assignedClasses: 'Physical Education, Health',
    status: 'Inactive',
    profileImage: Avatar,
  },
  {
    id: 7,
    name: 'Sarah Davis',
    staffNumber: 'SN007',
    idNumber: 366363,
    phoneNumber: '+1234567896',
    email: 'sarah.davis@example.com',
    assignedClasses: 'Computer Science, Robotics',
    status: 'Active',
    profileImage: Avatar,
  },
  {
    id: 8,
    name: 'James Wilson',
    staffNumber: 'SN008',
    idNumber: 366364,
    phoneNumber: '+1234567897',
    email: 'james.wilson@example.com',
    assignedClasses: 'Literature, Drama',
    status: 'Active',
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
  ]