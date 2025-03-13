import musicIcon from '../../assets/icons/music.svg';
import spaIcon from '../../assets/icons/spa.svg';
import swimIcon from '../../assets/icons/swim.svg';
import gymIcon from '../../assets/icons/gym.svg';
import therapyIcon from '../../assets/icons/therapy.svg';
import calendarIcon from '../../assets/icons/calender.svg';

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