import musicIcon from "../assets/icons/music.svg";
import spaIcon from "../assets/icons/spa.svg";
import swimIcon from "../assets/icons/swim.svg";
import gymIcon from "../assets/icons/gym.svg";
import therapyIcon from "../assets/icons/therapy.svg";
import calendarIcon from "../assets/icons/calender.svg";
import Avatar from "../assets/images/greyPhoto.png";
import { DropDownItem } from "../components/common/Dropdown";

import {
  DashboardIcon,
  DashboardIconWhite,
  StaffIcon,
  StaffIconWhite,
  ClientsIcon,
  ClientsIconWhite,
  ClassesIcon,
  ClassesIconWhite,
  CalendarIcon,
  CalendarIconWhite,
  SettingsIcon,
  SettingsIconWhite,
  LogoutIcon,
  LogoutIconWhite,
  ProfileIcon,
  ProfileIconWhite,
} from "../assets/icons";

const AuditLogsIcon = (props: any) => (
  <svg
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className='size-6'
    {...props}
  >
    <path
      d='M9 12L11 14L15 10'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M8 2V5M16 2V5M3.5 9H20.5'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const AuditLogsIconWhite = (props: any) => (
  <svg
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className='size-6'
    {...props}
  >
    <path
      d='M9 12L11 14L15 10'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M8 2V5M16 2V5M3.5 9H20.5'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

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

export type ClassLevel = "Beginner" | "Intermediate" | "Advanced";
export type ClassType = "Trial" | "Nomal" | "MakeUp";
export const weekdayNames = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
} as const;

export type WeekdayNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface ClassData {
  id: number;
  class: string;
  classLevel: ClassLevel;
  AssignedTo: string;
  classType: ClassType;
  slots: number;
  date: Date;
  duration: string;
  repeats: WeekdayNumber[];
  profileImage: string;
}

export type Staff = {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  staffNumber: string;
  phoneNumber: string;
  email: string;
  assignedClasses: string;
  status: "Active" | "Inactive";
  profileImage: string;
};

type ClassesType = "Advanced Swimming" | "Beginner" | "Intermediate";
type AvailabilityStatus = "Available" | "Full";

export interface StaffDashboard {
  name: string;
  class: ClassesType;
  capacity: number;
  availability: AvailabilityStatus;
}

export const staffDashboard: StaffDashboard[] = [
  {
    name: "Neil Bahati",
    class: "Advanced Swimming",
    capacity: 10,
    availability: "Available",
  },
  {
    name: "Alice Johnson",
    class: "Beginner",
    capacity: 10,
    availability: "Full",
  },
  {
    name: "Bob Smith",
    class: "Intermediate",
    capacity: 10,
    availability: "Available",
  },
  {
    name: "Charlie Brown",
    class: "Beginner",
    capacity: 10,
    availability: "Available",
  },
  {
    name: "Diana Prince",
    class: "Advanced Swimming",
    capacity: 10,
    availability: "Full",
  },
];

export interface PaymentHistory {
  id: number;
  clientId: number;
  class: "STARfish" | "STAnley" | "Grade" | "Advanced" | "Platinum";
  package: "weekly" | "monthly";
  amount: number;
  status: "overdue" | "paid";
  transactionId: string;
  date: string;
}

export const paymentHistories: PaymentHistory[] = [
  {
    id: 1,
    clientId: 1,
    class: "STARfish",
    package: "weekly",
    amount: 2500,
    status: "paid",
    transactionId: "TXN101A",
    date: "2024-01-05",
  },
  {
    id: 2,
    clientId: 1,
    class: "Platinum",
    package: "monthly",
    amount: 5000,
    status: "overdue",
    transactionId: "TXN102B",
    date: "2024-02-10",
  },

  {
    id: 11,
    clientId: 2,
    class: "Advanced",
    package: "weekly",
    amount: 2200,
    status: "paid",
    transactionId: "TXN201A",
    date: "2024-01-08",
  },
  {
    id: 12,
    clientId: 2,
    class: "STARfish",
    package: "monthly",
    amount: 4800,
    status: "paid",
    transactionId: "TXN202B",
    date: "2024-02-12",
  },
  {
    id: 13,
    clientId: 2,
    class: "Advanced",
    package: "weekly",
    amount: 2700,
    status: "overdue",
    transactionId: "TXN203C",
    date: "2024-03-18",
  },

  {
    id: 14,
    clientId: 3,
    class: "Platinum",
    package: "monthly",
    amount: 5200,
    status: "paid",
    transactionId: "TXN301A",
    date: "2024-01-15",
  },
  {
    id: 15,
    clientId: 3,
    class: "Grade",
    package: "weekly",
    amount: 2300,
    status: "overdue",
    transactionId: "TXN302B",
    date: "2024-02-20",
  },
  {
    id: 16,
    clientId: 3,
    class: "STAnley",
    package: "monthly",
    amount: 4900,
    status: "paid",
    transactionId: "TXN303C",
    date: "2024-03-25",
  },

  {
    id: 17,
    clientId: 4,
    class: "STARfish",
    package: "weekly",
    amount: 2400,
    status: "paid",
    transactionId: "TXN401A",
    date: "2024-01-10",
  },
  {
    id: 18,
    clientId: 4,
    class: "Advanced",
    package: "monthly",
    amount: 4600,
    status: "overdue",
    transactionId: "TXN402B",
    date: "2024-02-15",
  },
  {
    id: 19,
    clientId: 4,
    class: "Advanced",
    package: "weekly",
    amount: 2900,
    status: "paid",
    transactionId: "TXN403C",
    date: "2024-03-20",
  },

  {
    id: 20,
    clientId: 5,
    class: "Grade",
    package: "monthly",
    amount: 5100,
    status: "paid",
    transactionId: "TXN501A",
    date: "2024-01-20",
  },
  {
    id: 21,
    clientId: 5,
    class: "Platinum",
    package: "weekly",
    amount: 3100,
    status: "overdue",
    transactionId: "TXN502B",
    date: "2024-02-25",
  },
  {
    id: 22,
    clientId: 5,
    class: "STAnley",
    package: "monthly",
    amount: 4400,
    status: "paid",
    transactionId: "TXN503C",
    date: "2024-03-30",
  },
];

export const businessOptions: BusinessOption[] = [
  {
    id: "music",
    icon: musicIcon,
    title: "Music School",
    description: "Just the usual music classes I guess",
  },
  {
    id: "spa",
    icon: spaIcon,
    title: "Spa",
    description: "Just the usual spa classes I guess",
  },
  {
    id: "swim",
    icon: swimIcon,
    title: "Swim School",
    description: "Just the usual swim classes I guess",
  },
  {
    id: "gym",
    icon: gymIcon,
    title: "Gym",
    description: "Just the usual gym classes I guess",
  },
  {
    id: "therapy",
    icon: therapyIcon,
    title: "Therapy",
    description: "Just the usual therapy classes I guess",
  },
];

export const monthlyClientOptions: MonthlyClientOption[] = [
  { id: "1", label: "<10" },
  { id: "2", label: "10-20" },
  { id: "3", label: "20-30" },
  { id: "4", label: "30-40" },
  { id: "5", label: ">50" },
];

export const businessPurpose: BusinessPurpose[] = [
  {
    id: "1",
    icon: calendarIcon,
    title: "Scheduling",
    description:
      "Just the usual music classes I guess. Just the usual music classes I guess",
  },
  {
    id: "2",
    icon: calendarIcon,
    title: "Managing",
    description:
      "Just the usual music classes I guess. Just the usual music classes I guess",
  },
  {
    id: "3",
    icon: calendarIcon,
    title: "Store Data",
    description:
      "Just the usual music classes I guess. Just the usual music classes I guess",
  },
];

export const teamOptions: TeamOption[] = [
  { id: "just-me", label: "Just me" },
  { id: "1", label: "1" },
  { id: "2", label: "2" },
  { id: "3", label: "3" },
  { id: "4", label: "4" },
  { id: "5", label: "5" },
  { id: "6", label: "6" },
  { id: "7-plus", label: "7 +" },
];

export const data: Staff[] = [
  {
    id: 1,
    name: "John Doe",
    firstName: "John",
    lastName: "Doe",
    role: "Swim Instructor",
    staffNumber: "SN001",
    phoneNumber: "+1234567890",
    email: "john.doe@example.com",
    assignedClasses: "Beginner Swim, Advanced Swim, MakeUp Swim",
    status: "Active",
    profileImage: Avatar,
  },
  {
    id: 2,
    name: "Jane Smith",
    firstName: "Jane",
    lastName: "Smith",
    role: "Lifeguard",
    staffNumber: "SN002",
    phoneNumber: "+1234567891",
    email: "jane.smith@example.com",
    assignedClasses: "Pool Safety, First Aid",
    status: "Inactive",
    profileImage: Avatar,
  },
  {
    id: 3,
    name: "Alice Johnson",
    firstName: "Alice",
    lastName: "Johnson",
    role: "Swim Coach",
    staffNumber: "SN003",
    phoneNumber: "+1234567892",
    email: "alice.johnson@example.com",
    assignedClasses: "Competitive Swim, Swim Team",
    status: "Active",
    profileImage: Avatar,
  },
  {
    id: 4,
    name: "Bob Brown",
    firstName: "Bob",
    lastName: "Brown",
    role: "Swim Instructor",
    staffNumber: "SN004",
    phoneNumber: "+1234567893",
    email: "bob.brown@example.com",
    assignedClasses: "Kids Swim, Parent-Child Swim",
    status: "Active",
    profileImage: Avatar,
  },
  {
    id: 5,
    name: "Emma Wilson",
    firstName: "Emma",
    lastName: "Wilson",
    role: "Aquatics Director",
    staffNumber: "SN005",
    phoneNumber: "+1234567894",
    email: "emma.wilson@example.com",
    assignedClasses: "Swim Program Management",
    status: "Active",
    profileImage: Avatar,
  },
  {
    id: 6,
    name: "Michael Clark",
    firstName: "Michael",
    lastName: "Clark",
    role: "Water Aerobics Instructor",
    staffNumber: "SN006",
    phoneNumber: "+1234567895",
    email: "michael.clark@example.com",
    assignedClasses: "Water Aerobics, Senior Swim",
    status: "Inactive",
    profileImage: Avatar,
  },
  {
    id: 7,
    name: "Sarah Davis",
    firstName: "Sarah",
    lastName: "Davis",
    role: "Swim Instructor",
    staffNumber: "SN007",
    phoneNumber: "+1234567896",
    email: "sarah.davis@example.com",
    assignedClasses: "Teen Swim, Adult Swim",
    status: "Active",
    profileImage: Avatar,
  },
  {
    id: 8,
    name: "James Wilson",
    firstName: "James",
    lastName: "Wilson",
    role: "Diving Coach",
    staffNumber: "SN008",
    phoneNumber: "+1234567897",
    email: "james.wilson@example.com",
    assignedClasses: "Diving, Springboard Training",
    status: "Active",
    profileImage: Avatar,
  },
  {
    id: 9,
    name: "Sarah Daviss",
    firstName: "Sarah",
    lastName: "Daviss",
    role: "Swim Instructor",
    staffNumber: "SN009",
    phoneNumber: "+1234567898",
    email: "sarah.daviss@example.com",
    assignedClasses: "Private Swim Lessons",
    status: "Active",
    profileImage: Avatar,
  },
  {
    id: 10,
    name: "James Wilsonn",
    firstName: "James",
    lastName: "Wilsonn",
    role: "Swim Team Coordinator",
    staffNumber: "SN010",
    phoneNumber: "+1234567899",
    email: "james.wilsonn@example.com",
    assignedClasses: "Swim Team, Swim Meets",
    status: "Active",
    profileImage: Avatar,
  },
];

export const classesData: ClassData[] = [
  {
    id: 1,
    class: "SWM 401",
    classLevel: "Advanced",
    AssignedTo: "Coach Raymond",
    classType: "Trial",
    slots: 24,
    date: new Date("2025-01-12"),
    duration: "10.00am-12.00pm",
    repeats: [1, 3, 5],
    profileImage: Avatar,
  },
  {
    id: 2,
    class: "SWM 201",
    classLevel: "Intermediate",
    AssignedTo: "Coach Sarah",
    classType: "Nomal",
    slots: 20,
    date: new Date("2025-01-15"),
    duration: "2.00pm-4.00pm",
    repeats: [2, 4],
    profileImage: Avatar,
  },
  {
    id: 3,
    class: "SWM 101",
    classLevel: "Beginner",
    AssignedTo: "Coach John",
    classType: "Trial",
    slots: 18,
    date: new Date("2025-01-18"),
    duration: "9.00am-11.00am",
    repeats: [1, 3, 5],
    profileImage: Avatar,
  },
  {
    id: 4,
    class: "SWM 301",
    classLevel: "Intermediate",
    AssignedTo: "Coach Emily",
    classType: "Nomal",
    slots: 22,
    date: new Date("2025-01-20"),
    duration: "3.00pm-5.00pm",
    repeats: [2, 4, 6],
    profileImage: Avatar,
  },
  {
    id: 5,
    class: "SWM 501",
    classLevel: "Advanced",
    AssignedTo: "Coach Michael",
    classType: "Trial",
    slots: 16,
    date: new Date("2025-01-22"),
    duration: "1.00pm-3.00pm",
    repeats: [1, 3, 5],
    profileImage: Avatar,
  },
  {
    id: 6,
    class: "SWM 102",
    classLevel: "Beginner",
    AssignedTo: "Coach Laura",
    classType: "MakeUp",
    slots: 20,
    date: new Date("2025-01-25"),
    duration: "10.00am-12.00pm",
    repeats: [2, 4],
    profileImage: Avatar,
  },
  {
    id: 7,
    class: "SWM 202",
    classLevel: "Intermediate",
    AssignedTo: "Coach David",
    classType: "Trial",
    slots: 18,
    date: new Date("2025-01-28"),
    duration: "2.00pm-4.00pm",
    repeats: [1, 3, 5],
    profileImage: Avatar,
  },
  {
    id: 8,
    class: "SWM 302",
    classLevel: "Intermediate",
    AssignedTo: "Coach Rachel",
    classType: "Nomal",
    slots: 24,
    date: new Date("2025-01-30"),
    duration: "9.00am-11.00am",
    repeats: [2, 4, 6],
    profileImage: Avatar,
  },
  {
    id: 9,
    class: "SWM 402",
    classLevel: "Advanced",
    AssignedTo: "Coach Daniel",
    classType: "Trial",
    slots: 20,
    date: new Date("2025-02-02"),
    duration: "3.00pm-5.00pm",
    repeats: [1, 3, 5],
    profileImage: Avatar,
  },
  {
    id: 10,
    class: "SWM 502",
    classLevel: "Advanced",
    AssignedTo: "Coach Olivia",
    classType: "MakeUp",
    slots: 22,
    date: new Date("2025-02-05"),
    duration: "1.00pm-3.00pm",
    repeats: [2, 4],
    profileImage: Avatar,
  },
  {
    id: 11,
    class: "SWM 103",
    classLevel: "Beginner",
    AssignedTo: "Coach Ethan",
    classType: "Trial",
    slots: 18,
    date: new Date("2025-02-08"),
    duration: "10.00am-12.00pm",
    repeats: [1, 3, 5],
    profileImage: Avatar,
  },
  {
    id: 12,
    class: "SWM 203",
    classLevel: "Intermediate",
    AssignedTo: "Coach Sophia",
    classType: "Nomal",
    slots: 20,
    date: new Date("2025-02-10"),
    duration: "2.00pm-4.00pm",
    repeats: [2, 4, 6],
    profileImage: Avatar,
  },
  {
    id: 13,
    class: "SWM 303",
    classLevel: "Intermediate",
    AssignedTo: "Coach Liam",
    classType: "Trial",
    slots: 24,
    date: new Date("2025-02-12"),
    duration: "9.00am-11.00am",
    repeats: [1, 3, 5],
    profileImage: Avatar,
  },
];

export const sectionsData = [
  {
    title: "Profile",
    description: "Manage this team member's basic information",
  },
  {
    title: "Roles",
    description: "Manage this team member's roles and compensation",
  },
  {
    title: "Permissions",
    description: "Manage what this team member can see and do across FlowKey",
  },
];

export const permissionsData = [
  {
    id: "createEvents",
    label: "Create New Events",
    description: "Add new classes, appointments and personal appointments",
  },
  {
    id: "addClients",
    label: "Add New Clients",
    description: "Onboard new clients.",
  },
  {
    id: "createInvoices",
    label: "Create and Send Client Invoices",
    description: "Generate payment receipts and confirm transactions",
  },
];

export const roleOptions: DropDownItem[] = [
  { label: "Manager", value: "manager" },
  { label: "Supervisor", value: "supervisor" },
  { label: "Staff", value: "staff" },
  { label: "Intern", value: "intern" },
];

export const payTypeOptions: DropDownItem[] = [
  { label: "Hourly", value: "hourly" },
  { label: "Salary", value: "salary" },
  { label: "Commission", value: "commission" },
];

export const categoryOptions = [
  "STARfish",
  "STAnley",
  "Grade",
  "Advanced",
  "Platinum",
];


export const chartData = [
  { day: "Mon", clients: 25 },
  { day: "Tue", clients: 38 },
  { day: "Wed", clients: 45 },
  { day: "Thu", clients: 32 },
  { day: "Fri", clients: 48 },
  { day: "Sat", clients: 15 },
  { day: "Sun", clients: 10 },
];

interface Service {
  id: number;
  day: string;
  date: string;
  title: string;
  time: string;
  schedule: string;
}

export const services: Service[] = [
  {
    id: 1,
    day: "Tuesday",
    date: "17 May",
    title: "Advanced Swimming",
    time: "9:00 AM - 9:30 AM",
    schedule: "Tue, Thur, Sat",
  },
  {
    id: 2,
    day: "Wednesday",
    date: "18 May",
    title: "Beginner Swimming",
    time: "10:00 AM - 10:45 AM",
    schedule: "Wed, Fri",
  },
  {
    id: 3,
    day: "Thursday",
    date: "19 May",
    title: "Competitive Swimming",
    time: "3:00 PM - 4:00 PM",
    schedule: "Thur, Sat",
  },
  {
    id: 4,
    day: "Friday",
    date: "20 May",
    title: "Parent & Child Class",
    time: "4:30 PM - 5:15 PM",
    schedule: "Fri, Sun",
  },
];

export const regionOptions: DropDownItem[] = [
  { label: "Kiambu", value: "Kiambu" },
  { label: "Nairobi", value: "Nairobi" },
  { label: "Mombasa", value: "Mombasa" },
];

export const cityOptions: DropDownItem[] = [
  { label: "Nairobi", value: "Nairobi" },
  { label: "Mombasa", value: "Mombasa" },
  { label: "Kisumu", value: "Kisumu" },
];

export const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const classTypes = [
  { value: "regular", label: "Regular Class" },
  { value: "private", label: "Private Class" },
  { value: "workshop", label: "Workshop" },
];

export const repetition = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly on Tuesday" },
  {
    value: "monthly",
    label: "Monthly on Third Tuesday",
  },
  { value: "custom", label: "Custom ..." },
];

export const assignStaff = [
  { value: "john", label: "John Doe" },
  { value: "jane", label: "Jane Smith" },
  { value: "mike", label: "Mike Johnson" },
];

export const selectClient = [
  { value: "client1", label: "Client 1" },
  { value: "client2", label: "Client 2" },
  { value: "client3", label: "Client 3" },
];

export const selectClass = [
  { value: "class1", label: "Class 1" },
  { value: "class2", label: "Class 2" },
  { value: "class3", label: "Class 3" },
];

export const selectDays = [
  { value: "day", label: "Day(s)" },
  { value: "week", label: "Week(s)" },
  { value: "month", label: "Month(s)" },
];

export const assignCoach = [
  { value: "coach1", label: "Coach 1" },
  { value: "coach2", label: "Coach 2" },
  { value: "coach3", label: "Coach 3" },
];

export const months = [
  { label: "January", value: "01" },
  { label: "February", value: "02" },
  { label: "March", value: "03" },
  { label: "April", value: "04" },
  { label: "May", value: "05" },
  { label: "June", value: "06" },
  { label: "July", value: "07" },
  { label: "August", value: "08" },
  { label: "September", value: "09" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

export const swimClasses = [
  { label: "Beginner Swim Lessons", value: "beginner-swim" },
  { label: "Intermediate Swim Training", value: "intermediate-swim" },
  { label: "Advanced Swim Team", value: "advanced-swim-team" },
  { label: "Adult Swim Fitness", value: "adult-swim-fitness" },
  { label: "Parent & Child Swim", value: "parent-child-swim" },
  { label: "Competitive Swim Training", value: "competitive-swim" },
  { label: "Water Safety Classes", value: "water-safety" },
  { label: "Synchronized Swimming", value: "synchronized-swim" },
  { label: "Open Water Swim Training", value: "open-water-swim" },
  { label: "Aqua Aerobics", value: "aqua-aerobics" },
];

export const menuItems = [
  {
    name: "Dashboard",
    icon: DashboardIcon,
    iconWhite: DashboardIconWhite,
  },
  {
    name: "Staff",
    icon: StaffIcon,
    iconWhite: StaffIconWhite,
  },
  {
    name: "Clients",
    icon: ClientsIcon,
    iconWhite: ClientsIconWhite,
  },
  {
    name: "Sessions",
    icon: ClassesIcon,
    iconWhite: ClassesIconWhite,
  },
  {
    name: "Calendar",
    icon: CalendarIcon,
    iconWhite: CalendarIconWhite,
  },
  {
    name: "Audit Logs",
    icon: AuditLogsIcon,
    iconWhite: AuditLogsIconWhite,
  },
];

export const bottomMenuItems = [
  {
    name: "Profile",
    icon: ProfileIcon,
    iconWhite: ProfileIconWhite,
  },
  {
    name: "Settings",
    icon: SettingsIcon,
    iconWhite: SettingsIconWhite,
  },
  {
    name: "Logout",
    icon: LogoutIcon,
    iconWhite: LogoutIconWhite,
  },
];

export const repeatDays = [0, 1, 2, 3, 4, 5, 6] as const; // 0 = Sunday, 1 = Monday, etc.
