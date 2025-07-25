import React from 'react';

declare module 'react' {
  interface SVGProps<T> extends React.SVGAttributes<T> {}

  interface IntrinsicElements {
    defs: React.SVGProps<SVGDefsElement>;
    clipPath: React.SVGProps<SVGClipPathElement>;
    mask: React.SVGProps<SVGMaskElement>;
  }
}

export const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth='1.5'
    stroke='currentColor'
    className='size-6'
    {...props}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M12 4.5v15m7.5-7.5h-15'
    />
  </svg>
);

export const FlowKeyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width='37'
    height='32'
    viewBox='0 0 37 32'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className='size-6'
    {...props}
  >
    <path
      d='M9.35795 0L0 32H9.23693L12.6772 20.2251H22.2772L29.2254 12.0792H18.0556L13.4638 17.6338L16.1833 8.15484H31.0959C31.3308 8.15484 31.7348 7.83092 32.3008 7.18487C32.8667 6.54594 33.4452 5.77709 34.0503 4.89611C34.6572 4.00801 35.216 3.11101 35.741 2.21046C36.2661 1.301 36.6487 0.567742 36.8925 0.00177976H9.35795V0Z'
      fill='#1D9B5E'
    />
  </svg>
);

export const FlowKeyOnboardingIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width='37'
    height='32'
    viewBox='0 0 37 32'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className='size-6'
    {...props}
  >
    <path
      d='M9.35795 0L0 32H9.23693L12.6772 20.2251H22.2772L29.2254 12.0792H18.0556L13.4638 17.6338L16.1833 8.15484H31.0959C31.3308 8.15484 31.7348 7.83092 32.3008 7.18487C32.8667 6.54594 33.4452 5.77709 34.0503 4.89611C34.6572 4.00801 35.216 3.11101 35.741 2.21046C36.2661 1.301 36.6487 0.567742 36.8925 0.00177976H9.35795V0Z'
      fill='#1D9B5E'
    />
  </svg>
);

export const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width='25'
    height='24'
    viewBox='0 0 25 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className='size-6'
    {...props}
  >
    <path
      d='M12.5 18V15'
      stroke='#0F2028'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M10.57 2.81997L3.64002 8.36997C2.86002 8.98997 2.36002 10.3 2.53002 11.28L3.86002 19.24C4.10002 20.66 5.46002 21.81 6.90002 21.81H18.1C19.53 21.81 20.9 20.65 21.14 19.24L22.47 11.28C22.63 10.3 22.13 8.98997 21.36 8.36997L14.43 2.82997C13.36 1.96997 11.63 1.96997 10.57 2.81997Z'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const DashboardIconWhite = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width='25'
    height='24'
    viewBox='0 0 25 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className='size-6'
    {...props}
  >
    <path
      d='M12.5 18V15'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M10.57 2.81997L3.64002 8.36997C2.86002 8.98997 2.36002 10.3 2.53002 11.28L3.86002 19.24C4.10002 20.66 5.46002 21.81 6.90002 21.81H18.1C19.53 21.81 20.9 20.65 21.14 19.24L22.47 11.28C22.63 10.3 22.13 8.98997 21.36 8.36997L14.43 2.82997C13.36 1.96997 11.63 1.96997 10.57 2.81997Z'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const StaffIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d='M9.16006 10.87C9.06006 10.86 8.94006 10.86 8.83006 10.87C6.45006 10.79 4.56006 8.84 4.56006 6.44C4.56006 3.99 6.54006 2 9.00006 2C11.4501 2 13.4401 3.99 13.4401 6.44C13.4301 8.84 11.5401 10.79 9.16006 10.87Z'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M16.41 4C18.35 4 19.91 5.57 19.91 7.5C19.91 9.39 18.41 10.93 16.54 11C16.46 10.99 16.37 10.99 16.28 11'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M4.15997 14.56C1.73997 16.18 1.73997 18.82 4.15997 20.43C6.90997 22.27 11.42 22.27 14.17 20.43C16.59 18.81 16.59 16.17 14.17 14.56C11.43 12.73 6.91997 12.73 4.15997 14.56Z'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M18.34 20C19.06 19.85 19.74 19.56 20.3 19.13C21.86 17.96 21.86 16.03 20.3 14.86C19.75 14.44 19.08 14.16 18.37 14'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const StaffIconWhite = (props: React.SVGProps<SVGSVGElement>) => (
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
      d='M9.16006 10.87C9.06006 10.86 8.94006 10.86 8.83006 10.87C6.45006 10.79 4.56006 8.84 4.56006 6.44C4.56006 3.99 6.54006 2 9.00006 2C11.4501 2 13.4401 3.99 13.4401 6.44C13.4301 8.84 11.5401 10.79 9.16006 10.87Z'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M16.41 4C18.35 4 19.91 5.57 19.91 7.5C19.91 9.39 18.41 10.93 16.54 11C16.46 10.99 16.37 10.99 16.28 11'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M4.15997 14.56C1.73997 16.18 1.73997 18.82 4.15997 20.43C6.90997 22.27 11.42 22.27 14.17 20.43C16.59 18.81 16.59 16.17 14.17 14.56C11.43 12.73 6.91997 12.73 4.15997 14.56Z'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M18.34 20C19.06 19.85 19.74 19.56 20.3 19.13C21.86 17.96 21.86 16.03 20.3 14.86C19.75 14.44 19.08 14.16 18.37 14'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const ClientsIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d='M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M20.59 22C20.59 18.13 16.74 15 12 15C7.26003 15 3.41003 18.13 3.41003 22'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const ClientsIconWhite = (props: React.SVGProps<SVGSVGElement>) => (
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
      d='M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M20.59 22C20.59 18.13 16.74 15 12 15C7.26003 15 3.41003 18.13 3.41003 22'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const ClassesIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d='M3.5 18V7C3.5 3 4.5 2 8.5 2H15.5C19.5 2 20.5 3 20.5 7V17C20.5 17.14 20.5 17.28 20.49 17.42'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M6.35 15H20.5V18.5C20.5 20.43 18.93 22 17 22H7C5.07 22 3.5 20.43 3.5 18.5V17.85C3.5 16.28 4.78 15 6.35 15Z'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M8 7H16'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M8 10.5H13'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const ClassesIconWhite = (props: React.SVGProps<SVGSVGElement>) => (
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
      d='M3.5 18V7C3.5 3 4.5 2 8.5 2H15.5C19.5 2 20.5 3 20.5 7V17C20.5 17.14 20.5 17.28 20.49 17.42'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M6.35 15H20.5V18.5C20.5 20.43 18.93 22 17 22H7C5.07 22 3.5 20.43 3.5 18.5V17.85C3.5 16.28 4.78 15 6.35 15Z'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M8 7H16'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M8 10.5H13'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const TransactionsIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d='M22 6V8.42C22 10 21 11 19.42 11H16V4.01C16 2.9 16.91 2 18.02 2C19.11 2.01 20.11 2.45 20.83 3.17C21.55 3.9 22 4.9 22 6Z'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M2 7V21C2 21.83 2.93998 22.3 3.59998 21.8L5.31 20.52C5.71 20.22 6.27 20.26 6.63 20.62L8.28998 22.29C8.67998 22.68 9.32002 22.68 9.71002 22.29L11.39 20.61C11.74 20.26 12.3 20.22 12.69 20.52L14.4 21.8C15.06 22.29 16 21.82 16 21V4C16 2.9 16.9 2 18 2H7H6C3 2 2 3.79 2 6V7Z'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M6 9H12'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M6.75 13H11.25'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const TransactionsIconWhite = (props: React.SVGProps<SVGSVGElement>) => (
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
      d='M22 6V8.42C22 10 21 11 19.42 11H16V4.01C16 2.9 16.91 2 18.02 2C19.11 2.01 20.11 2.45 20.83 3.17C21.55 3.9 22 4.9 22 6Z'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M2 7V21C2 21.83 2.93998 22.3 3.59998 21.8L5.31 20.52C5.71 20.22 6.27 20.26 6.63 20.62L8.28998 22.29C8.67998 22.68 9.32002 22.68 9.71002 22.29L11.39 20.61C11.74 20.26 12.3 20.22 12.69 20.52L14.4 21.8C15.06 22.29 16 21.82 16 21V4C16 2.9 16.9 2 18 2H7H6C3 2 2 3.79 2 6V7Z'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M6 9H12'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M6.75 13H11.25'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d='M8 2V5'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M16 2V5'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M3.5 9.08997H20.5'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M15.6947 13.7H15.7037'
      stroke='#6D7172'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M15.6947 16.7H15.7037'
      stroke='#6D7172'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M11.9955 13.7H12.0045'
      stroke='#6D7172'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M11.9955 16.7H12.0045'
      stroke='#6D7172'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M8.29431 13.7H8.30329'
      stroke='#6D7172'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M8.29431 16.7H8.30329'
      stroke='#6D7172'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const CalendarIconWhite = (props: React.SVGProps<SVGSVGElement>) => (
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
      d='M8 2V5'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M16 2V5'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M3.5 9.08997H20.5'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M15.6947 13.7H15.7037'
      stroke='#ffffff'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M15.6947 16.7H15.7037'
      stroke='#ffffff'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M11.9955 13.7H12.0045'
      stroke='#ffffff'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M11.9955 16.7H12.0045'
      stroke='#ffffff'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M8.29431 13.7H8.30329'
      stroke='#ffffff'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M8.29431 16.7H8.30329'
      stroke='#ffffff'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const ChatsIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d='M22 10V13C22 17 20 19 16 19H15.5C15.19 19 14.89 19.15 14.7 19.4L13.2 21.4C12.54 22.28 11.46 22.28 10.8 21.4L9.3 19.4C9.14 19.18 8.77 19 8.5 19H8C4 19 2 18 2 13V8C2 4 4 2 8 2H14'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M19.5 7C20.8807 7 22 5.88071 22 4.5C22 3.11929 20.8807 2 19.5 2C18.1193 2 17 3.11929 17 4.5C17 5.88071 18.1193 7 19.5 7Z'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M15.9965 11H16.0054'
      stroke='#6D7172'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M11.9955 11H12.0045'
      stroke='#6D7172'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M7.99451 11H8.00349'
      stroke='#6D7172'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const ChatsIconWhite = (props: React.SVGProps<SVGSVGElement>) => (
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
      d='M22 10V13C22 17 20 19 16 19H15.5C15.19 19 14.89 19.15 14.7 19.4L13.2 21.4C12.54 22.28 11.46 22.28 10.8 21.4L9.3 19.4C9.14 19.18 8.77 19 8.5 19H8C4 19 2 18 2 13V8C2 4 4 2 8 2H14'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M19.5 7C20.8807 7 22 5.88071 22 4.5C22 3.11929 20.8807 2 19.5 2C18.1193 2 17 3.11929 17 4.5C17 5.88071 18.1193 7 19.5 7Z'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M15.9965 11H16.0054'
      stroke='#ffffff'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M11.9955 11H12.0045'
      stroke='#ffffff'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M7.99451 11H8.00349'
      stroke='#ffffff'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const ProfileIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d='M12.12 12.78C12.05 12.77 11.96 12.77 11.88 12.78C10.12 12.72 8.71997 11.28 8.71997 9.50998C8.71997 7.69998 10.18 6.22998 12 6.22998C13.81 6.22998 15.28 7.69998 15.28 9.50998C15.27 11.28 13.88 12.72 12.12 12.78Z'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M18.74 19.3801C16.96 21.0101 14.6 22.0001 12 22.0001C9.40001 22.0001 7.04001 21.0101 5.26001 19.3801C5.36001 18.4401 5.96001 17.5201 7.03001 16.8001C9.77001 14.9801 14.25 14.9801 16.97 16.8001C18.04 17.5201 18.64 18.4401 18.74 19.3801Z'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const ProfileIconWhite = (props: React.SVGProps<SVGSVGElement>) => (
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
      d='M12.12 12.78C12.05 12.77 11.96 12.77 11.88 12.78C10.12 12.72 8.71997 11.28 8.71997 9.50998C8.71997 7.69998 10.18 6.22998 12 6.22998C13.81 6.22998 15.28 7.69998 15.28 9.50998C15.27 11.28 13.88 12.72 12.12 12.78Z'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M18.74 19.3801C16.96 21.0101 14.6 22.0001 12 22.0001C9.40001 22.0001 7.04001 21.0101 5.26001 19.3801C5.36001 18.4401 5.96001 17.5201 7.03001 16.8001C9.77001 14.9801 14.25 14.9801 16.97 16.8001C18.04 17.5201 18.64 18.4401 18.74 19.3801Z'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d='M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M2 12.8799V11.1199C2 10.0799 2.85 9.21994 3.9 9.21994C5.71 9.21994 6.45 7.93994 5.54 6.36994C5.02 5.46994 5.33 4.29994 6.24 3.77994L7.97 2.78994C8.76 2.31994 9.78 2.59994 10.25 3.38994L10.36 3.57994C11.26 5.14994 12.74 5.14994 13.65 3.57994L13.76 3.38994C14.23 2.59994 15.25 2.31994 16.04 2.78994L17.77 3.77994C18.68 4.29994 18.99 5.46994 18.47 6.36994C17.56 7.93994 18.3 9.21994 20.11 9.21994C21.15 9.21994 22.01 10.0699 22.01 11.1199V12.8799C22.01 13.9199 21.16 14.7799 20.11 14.7799C18.3 14.7799 17.56 16.0599 18.47 17.6299C18.99 18.5399 18.68 19.6999 17.77 20.2199L16.04 21.2099C15.25 21.6799 14.23 21.3999 13.76 20.6099L13.65 20.4199C12.75 18.8499 11.27 18.8499 10.36 20.4199L10.25 20.6099C9.78 21.3999 8.76 21.6799 7.97 21.2099L6.24 20.2199C5.33 19.6999 5.02 18.5299 5.54 17.6299C6.45 16.0599 5.71 14.7799 3.9 14.7799C2.85 14.7799 2 13.9199 2 12.8799Z'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const SettingsIconWhite = (props: React.SVGProps<SVGSVGElement>) => (
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
      d='M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M2 12.8799V11.1199C2 10.0799 2.85 9.21994 3.9 9.21994C5.71 9.21994 6.45 7.93994 5.54 6.36994C5.02 5.46994 5.33 4.29994 6.24 3.77994L7.97 2.78994C8.76 2.31994 9.78 2.59994 10.25 3.38994L10.36 3.57994C11.26 5.14994 12.74 5.14994 13.65 3.57994L13.76 3.38994C14.23 2.59994 15.25 2.31994 16.04 2.78994L17.77 3.77994C18.68 4.29994 18.99 5.46994 18.47 6.36994C17.56 7.93994 18.3 9.21994 20.11 9.21994C21.15 9.21994 22.01 10.0699 22.01 11.1199V12.8799C22.01 13.9199 21.16 14.7799 20.11 14.7799C18.3 14.7799 17.56 16.0599 18.47 17.6299C18.99 18.5399 18.68 19.6999 17.77 20.2199L16.04 21.2099C15.25 21.6799 14.23 21.3999 13.76 20.6099L13.65 20.4199C12.75 18.8499 11.27 18.8499 10.36 20.4199L10.25 20.6099C9.78 21.3999 8.76 21.6799 7.97 21.2099L6.24 20.2199C5.33 19.6999 5.02 18.5299 5.54 17.6299C6.45 16.0599 5.71 14.7799 3.9 14.7799C2.85 14.7799 2 13.9199 2 12.8799Z'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const LogoutIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d='M8.90002 7.55999C9.21002 3.95999 11.06 2.48999 15.11 2.48999H15.24C19.71 2.48999 21.5 4.27999 21.5 8.74999V15.27C21.5 19.74 19.71 21.53 15.24 21.53H15.11C11.09 21.53 9.24002 20.08 8.91002 16.54'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M15 12H3.62'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M5.85 8.6499L2.5 11.9999L5.85 15.3499'
      stroke='#6D7172'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const LogoutIconWhite = (props: React.SVGProps<SVGSVGElement>) => (
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
      d='M8.90002 7.55999C9.21002 3.95999 11.06 2.48999 15.11 2.48999H15.24C19.71 2.48999 21.5 4.27999 21.5 8.74999V15.27C21.5 19.74 19.71 21.53 15.24 21.53H15.11C11.09 21.53 9.24002 20.08 8.91002 16.54'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M15 12H3.62'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M5.85 8.6499L2.5 11.9999L5.85 15.3499'
      stroke='#ffffff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width='16'
    height='16'
    viewBox='0 0 16 16'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className='size-6'
    {...props}
  >
    <path
      d='M14.4842 12.8608L11.8881 10.2647C11.771 10.1475 11.6121 10.0824 11.4455 10.0824H11.021C11.7397 9.16322 12.1667 8.00708 12.1667 6.74939C12.1667 3.75749 9.74251 1.33325 6.75061 1.33325C3.75871 1.33325 1.33447 3.75749 1.33447 6.74939C1.33447 9.74129 3.75871 12.1655 6.75061 12.1655C8.0083 12.1655 9.16444 11.7385 10.0836 11.0198V11.4442C10.0836 11.6109 10.1487 11.7697 10.2659 11.8869L12.862 14.483C13.1068 14.7278 13.5026 14.7278 13.7447 14.483L14.4816 13.7461C14.7264 13.5013 14.7264 13.1055 14.4842 12.8608ZM6.75061 10.0824C4.90964 10.0824 3.4176 8.59296 3.4176 6.74939C3.4176 4.90842 4.90704 3.41638 6.75061 3.41638C8.59158 3.41638 10.0836 4.90582 10.0836 6.74939C10.0836 8.59036 8.59418 10.0824 6.75061 10.0824Z'
      fill='#6A778B'
    />
  </svg>
);

export const MessageNotificationIcon = (
  props: React.SVGProps<SVGSVGElement>
) => (
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
      d='M22 10V13C22 17 20 19 16 19H15.5C15.19 19 14.89 19.15 14.7 19.4L13.2 21.4C12.54 22.28 11.46 22.28 10.8 21.4L9.3 19.4C9.14 19.18 8.77 19 8.5 19H8C4 19 2 18 2 13V8C2 4 4 2 8 2H14'
      stroke='#1D9B5E'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M19.5 7C20.8807 7 22 5.88071 22 4.5C22 3.11929 20.8807 2 19.5 2C18.1193 2 17 3.11929 17 4.5C17 5.88071 18.1193 7 19.5 7Z'
      stroke='#1D9B5E'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M15.9965 11H16.0054'
      stroke='#1D9B5E'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M11.9955 11H12.0045'
      stroke='#1D9B5E'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M7.99451 11H8.00349'
      stroke='#1D9B5E'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export const NotificationBingIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d='M12 6.43994V9.76994'
      stroke='#1D9B5E'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
    />
    <path
      d='M12.02 2C8.34002 2 5.36002 4.98 5.36002 8.66V10.76C5.36002 11.44 5.08002 12.46 4.73002 13.04L3.46002 15.16C2.68002 16.47 3.22002 17.93 4.66002 18.41C9.44002 20 14.61 20 19.39 18.41C20.74 17.96 21.32 16.38 20.59 15.16L19.32 13.04C18.97 12.46 18.69 11.43 18.69 10.76V8.66C18.68 5 15.68 2 12.02 2Z'
      stroke='#1D9B5E'
      strokeWidth='1.5'
      strokeMiterlimit='10'
      strokeLinecap='round'
    />
    <path
      d='M15.33 18.8201C15.33 20.6501 13.83 22.1501 12 22.1501C11.09 22.1501 10.25 21.7701 9.65004 21.1701C9.05004 20.5701 8.67004 19.7301 8.67004 18.8201'
      stroke='#1D9B5E'
      strokeWidth='1.5'
      strokeMiterlimit='10'
    />
  </svg>
);

export const RegistrationFlowkeyIcon = (
  props: React.SVGProps<SVGSVGElement>
) => (
  <svg
    width='54'
    height='47'
    viewBox='0 0 54 47'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className='size-6'
    {...props}
  >
    <path
      d='M13.6973 0L0 47H13.5202L18.5557 29.7057H32.6074L42.7775 17.7413H26.4282L19.7072 25.8997L23.6877 11.9774H45.5154C45.8592 11.9774 46.4506 11.5017 47.279 10.5528C48.1074 9.61435 48.954 8.4851 49.8397 7.19116C50.7281 5.88676 51.546 4.5693 52.3145 3.24661C53.083 1.91085 53.6431 0.833871 54 0.00261402H13.6973V0Z'
      fill='#D2F801'
    />
  </svg>
);

export const RegistrationIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width='402'
    height='402'
    viewBox='0 0 402 402'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className='size-6'
    {...props}
  >
    <path
      d='M78.7349 47.4707H50.4679V56.4675H78.7349V47.4707Z'
      fill='#EBEBEB'
    />
    <path
      d='M351.532 118.641H323.265V127.637H351.532V118.641Z'
      stroke='#EBEBEB'
      strokeMiterlimit='10'
    />
    <path
      d='M62.9671 36.126C58.2725 36.2056 46.235 36.4058 41.7037 36.4581L34.7001 36.4927L35.0667 36.126L35.1021 45.1228L34.7009 44.7216C39.3946 44.7361 51.3654 44.7795 55.9007 44.8446L62.9671 44.9323L62.7765 45.1228L62.9671 36.126ZM62.9671 36.126L63.1576 45.1228L63.1617 45.3117L62.9663 45.3142C59.4399 45.3608 52.3575 45.442 48.8328 45.4701L34.6993 45.5248L34.2964 45.5264L34.2981 45.1228L34.3334 36.126L34.335 35.7578L34.7001 35.7594L41.8299 35.794C46.3331 35.8438 58.3168 36.0464 62.9671 36.126Z'
      fill='#EBEBEB'
    />
    <path
      d='M110.209 250.65C105.515 250.73 93.4771 250.93 88.9457 250.983L81.9421 251.017L82.3087 250.65L82.3441 259.647L81.9429 259.246C86.6366 259.261 98.6082 259.304 103.143 259.369L110.209 259.457L110.019 259.647L110.209 250.65ZM110.209 250.65L110.4 259.647L110.404 259.836L110.209 259.839C106.683 259.885 99.6003 259.966 96.0756 259.995L81.9421 260.049L81.5393 260.051L81.5409 259.647L81.5763 250.65L81.5779 250.282L81.9429 250.284L89.0728 250.318C93.5752 250.368 105.558 250.571 110.209 250.65Z'
      fill='#EBEBEB'
    />
    <path
      d='M94.4411 239.306C89.7465 239.385 77.709 239.586 73.1777 239.638L66.174 239.672L66.5407 239.306L66.576 248.302L66.1748 247.901C70.8686 247.916 82.8393 247.959 87.3747 248.024L94.4411 248.112L94.2505 248.302L94.4411 239.306ZM94.4411 239.306L94.6316 248.302L94.6356 248.491L94.4403 248.493C90.9139 248.54 83.8315 248.621 80.3067 248.649L66.1732 248.704L65.7696 248.705L65.7712 248.302L65.8066 239.306L65.8082 238.938L66.1732 238.939L73.3031 238.974C77.8071 239.024 89.7907 239.226 94.4411 239.306Z'
      fill='#EBEBEB'
    />
    <path d='M78.7349 250.65H50.4679V259.647H78.7349V250.65Z' fill='#EBEBEB' />
    <path d='M367.299 36.126H339.033V45.1227H367.299V36.126Z' fill='#EBEBEB' />
    <path
      d='M351.532 351.261H323.265V360.258H351.532V351.261Z'
      fill='#EBEBEB'
    />
    <path
      d='M367.299 339.917C362.605 339.997 350.567 340.197 346.036 340.249L339.032 340.284L339.399 339.917L339.434 348.914L339.033 348.513C343.727 348.527 355.698 348.571 360.233 348.636L367.299 348.723L367.109 348.914L367.299 339.917ZM367.299 339.917L367.49 348.914L367.494 349.102L367.299 349.104C363.772 349.151 356.691 349.232 353.165 349.26L339.032 349.315L338.628 349.317L338.63 348.914L338.665 339.917L338.667 339.549L339.032 339.55L346.161 339.585C350.666 339.635 362.649 339.837 367.299 339.917Z'
      fill='#EBEBEB'
    />
    <path
      d='M62.9669 351.261C58.2723 351.34 46.2348 351.541 41.7035 351.593L34.6998 351.627L35.0665 351.261L35.1018 360.258L34.7006 359.856C39.3944 359.871 51.3652 359.914 55.9005 359.979L62.9669 360.067L62.7763 360.258L62.9669 351.261ZM62.9669 351.261L63.1574 360.258L63.1614 360.446L62.9661 360.448C59.4397 360.495 52.3573 360.576 48.8326 360.604L34.699 360.659L34.2954 360.66L34.297 360.258L34.3324 351.261L34.334 350.893L34.699 350.894L41.8289 350.929C46.3329 350.978 58.3165 351.181 62.9669 351.261Z'
      fill='#EBEBEB'
    />
    <path
      d='M35.811 369.881C141.641 369.389 260.359 369.385 366.189 369.881C260.359 370.377 141.641 370.374 35.811 369.881Z'
      fill='#0F2028'
    />
    <path
      d='M94.5311 346.129V48.5886C94.5311 42.8633 99.1718 38.2227 104.897 38.2227H297.102C302.827 38.2227 307.468 42.8633 307.468 48.5886V346.129C307.468 351.854 302.827 356.495 297.102 356.495H104.897C99.1726 356.495 94.5311 351.854 94.5311 346.129Z'
      fill='#37474F'
    />
    <path d='M298.484 60.498H103.762V334.412H298.484V60.498Z' fill='white' />
    <path
      d='M177.828 51.7994V50.5001C177.828 49.9446 178.278 49.4951 178.833 49.4951H223.163C223.719 49.4951 224.168 49.9454 224.168 50.5001V51.7994C224.168 52.3541 223.718 52.8044 223.163 52.8044H178.834C178.278 52.8044 177.828 52.3541 177.828 51.7994Z'
      fill='#0F2028'
    />
    <path
      d='M205.233 349.411C207.574 347.07 207.574 343.276 205.233 340.935C202.893 338.595 199.098 338.595 196.758 340.935C194.418 343.276 194.418 347.07 196.758 349.411C199.098 351.751 202.893 351.751 205.233 349.411Z'
      fill='#0F2028'
    />
    <path d='M298.484 60.498H103.762V334.413H298.484V60.498Z' fill='white' />
    <path d='M298.484 60.499H103.762V67.1891H298.484V60.499Z' fill='#0F2028' />
    <path
      d='M109.747 63.8434C109.747 64.6185 109.119 65.2464 108.344 65.2464C107.569 65.2464 106.941 64.6185 106.941 63.8434C106.941 63.0683 107.569 62.4404 108.344 62.4404C109.118 62.4404 109.747 63.0683 109.747 63.8434Z'
      fill='#C7C7C7'
    />
    <path
      d='M115.475 63.8434C115.475 64.6185 114.847 65.2464 114.072 65.2464C113.297 65.2464 112.669 64.6185 112.669 63.8434C112.669 63.0683 113.297 62.4404 114.072 62.4404C114.847 62.4404 115.475 63.0683 115.475 63.8434Z'
      fill='white'
    />
    <path
      d='M121.204 63.8434C121.204 64.6185 120.576 65.2464 119.801 65.2464C119.026 65.2464 118.398 64.6185 118.398 63.8434C118.398 63.0683 119.026 62.4404 119.801 62.4404C120.576 62.4404 121.204 63.0683 121.204 63.8434Z'
      fill='#D2F801'
    />
    <path
      d='M228.211 121.866C226.149 123.001 223.773 123.652 221.25 123.652C213.268 123.652 206.796 117.175 206.796 109.194C206.796 101.212 213.269 94.7354 221.25 94.7354V109.194L228.211 121.866Z'
      fill='#0F2028'
    />
    <path
      d='M229.822 97.558L221.25 109.194V94.7344C224.461 94.7344 227.423 95.782 229.822 97.558Z'
      fill='#D2F801'
    />
    <path
      d='M235.704 109.193C235.704 112.981 234.25 116.418 231.87 118.992L221.25 109.193L229.822 97.5576C233.392 100.188 235.704 104.423 235.704 109.193Z'
      fill='#DBDBDB'
    />
    <path
      d='M237.071 125.701C236.02 126.849 234.783 127.818 233.413 128.575L226.451 115.901L237.071 125.701Z'
      fill='#1D9B5E'
    />
    <path
      d='M182.228 95.2885L178.256 109.194V123.652C170.274 123.652 163.801 117.175 163.801 109.194C163.801 101.212 170.274 94.7354 178.256 94.7354C179.635 94.7345 180.968 94.9331 182.228 95.2885Z'
      fill='#DBDBDB'
    />
    <path
      d='M186.818 120.838C184.424 122.609 181.462 123.652 178.256 123.652V109.193L186.818 120.838Z'
      fill='#0F2028'
    />
    <path
      d='M192.714 109.193C192.714 113.973 190.394 118.207 186.818 120.837L178.256 109.193L189.499 100.104C191.51 102.586 192.714 105.752 192.714 109.193Z'
      fill='#1D9B5E'
    />
    <path
      d='M192.714 95.4222L181.471 104.511L185.443 90.6055C188.341 91.436 190.869 93.1389 192.714 95.4222Z'
      fill='#D2F801'
    />
    <path
      d='M135.262 94.7344V109.193L125.528 119.878C122.626 117.229 120.808 113.423 120.808 109.193C120.807 101.211 127.28 94.7344 135.262 94.7344Z'
      fill='#1D9B5E'
    />
    <path
      d='M145.614 99.0985L135.262 109.193V94.7344C139.322 94.7344 142.984 96.4091 145.614 99.0985Z'
      fill='#D2F801'
    />
    <path
      d='M149.72 109.193C149.72 113.71 147.649 117.746 144.396 120.399L135.262 109.193L145.614 99.0986C148.151 101.705 149.72 105.267 149.72 109.193Z'
      fill='#DBDBDB'
    />
    <path
      d='M144.396 124.189C141.909 126.224 138.726 127.442 135.262 127.442C131.511 127.442 128.097 126.006 125.528 123.668L135.262 112.982L144.396 124.189Z'
      fill='#0F2028'
    />
    <path
      d='M264.243 94.7354V123.652C256.257 123.652 249.789 117.175 249.789 109.194C249.79 101.212 256.258 94.7354 264.243 94.7354Z'
      fill='#D2F801'
    />
    <path
      d='M267.893 95.2017L264.243 109.194V94.7354C265.503 94.7354 266.726 94.901 267.893 95.2017Z'
      fill='#0F2028'
    />
    <path
      d='M281.192 108.362C281.192 110.23 280.836 112.02 280.191 113.663L266.738 108.362L270.388 94.3691C276.602 95.9844 281.192 101.636 281.192 108.362Z'
      fill='#1D9B5E'
    />
    <path
      d='M277.697 114.494C275.579 119.855 270.357 123.652 264.244 123.652V109.193L277.697 114.494Z'
      fill='#DBDBDB'
    />
    <path
      d='M147.598 133.856H130.719V135.477H147.598V133.856Z'
      fill='#EBEBEB'
    />
    <path
      d='M141.921 137.242H130.719V138.863H141.921V137.242Z'
      fill='#EBEBEB'
    />
    <path
      d='M127.982 133.833H122.929V138.885H127.982V133.833Z'
      fill='#1D9B5E'
    />
    <path
      d='M190.592 133.856H173.713V135.477H190.592V133.856Z'
      fill='#EBEBEB'
    />
    <path
      d='M184.915 137.242H173.713V138.863H184.915V137.242Z'
      fill='#EBEBEB'
    />
    <path
      d='M170.975 133.833H165.923V138.885H170.975V133.833Z'
      fill='#DBDBDB'
    />
    <path
      d='M234.268 133.856H217.389V135.477H234.268V133.856Z'
      fill='#EBEBEB'
    />
    <path
      d='M228.591 137.242H217.389V138.863H228.591V137.242Z'
      fill='#EBEBEB'
    />
    <path
      d='M214.651 133.833H209.599V138.885H214.651V133.833Z'
      fill='#0F2028'
    />
    <path
      d='M277.825 133.856H260.946V135.477H277.825V133.856Z'
      fill='#EBEBEB'
    />
    <path
      d='M272.148 137.242H260.946V138.863H272.148V137.242Z'
      fill='#EBEBEB'
    />
    <path
      d='M258.209 133.833H253.156V138.885H258.209V133.833Z'
      fill='#D2F801'
    />
    <path
      d='M166.357 270.196C166.357 279.038 160.983 286.648 153.311 289.91L144.941 270.196H166.357Z'
      fill='#D2F801'
    />
    <path
      d='M142.203 268.725L150.573 288.439C150.553 288.439 150.553 288.459 150.532 288.459C149.875 288.726 149.219 288.972 148.563 289.177C146.491 289.813 144.357 290.141 142.203 290.141C139.988 290.141 137.855 289.792 135.845 289.177C129.137 287.085 123.844 281.792 121.773 275.084C121.157 273.074 120.809 270.94 120.809 268.725C120.809 266.509 121.158 264.376 121.773 262.366C123.845 255.659 129.137 250.366 135.845 248.294C137.855 247.678 139.988 247.33 142.203 247.33C144.419 247.33 146.552 247.679 148.563 248.294C155.291 250.366 160.563 255.658 162.656 262.366C163.271 264.376 163.62 266.51 163.62 268.725H142.203Z'
      fill='#D2F801'
    />
    <path
      d='M142.203 268.725L150.573 288.439C150.553 288.439 150.553 288.459 150.532 288.459C149.875 288.726 149.219 288.972 148.563 289.177C146.491 289.813 144.357 290.141 142.203 290.141C139.988 290.141 137.855 289.792 135.845 289.177C129.178 287.064 123.885 281.751 121.773 275.084C121.157 273.074 120.809 270.94 120.809 268.725C120.809 266.509 121.158 264.376 121.773 262.366C123.886 255.7 129.178 250.407 135.845 248.294C137.855 247.678 139.988 247.33 142.203 247.33C144.419 247.33 146.552 247.679 148.563 248.294C155.23 250.407 160.543 255.7 162.656 262.366C163.271 264.376 163.62 266.51 163.62 268.725H142.203Z'
      fill='#DBDBDB'
    />
    <path
      d='M142.211 268.73L128.259 284.959C123.531 280.896 120.808 274.963 120.808 268.73C120.808 256.989 130.47 247.327 142.211 247.327C153.952 247.327 163.613 256.989 163.613 268.73H142.211Z'
      fill='#1D9B5E'
    />
    <path
      d='M177.431 297.094H161.259L141.232 277.067L141.524 276.774L161.43 296.681H177.431V297.094Z'
      fill='#0F2028'
    />
    <path
      d='M142.503 275.795H140.252V278.046H142.503V275.795Z'
      fill='#0F2028'
    />
    <path
      d='M177.431 281.6H159.206L150.555 272.949L150.848 272.657L159.377 281.187H177.431V281.6Z'
      fill='#0F2028'
    />
    <path
      d='M151.827 271.678H149.576V273.929H151.827V271.678Z'
      fill='#0F2028'
    />
    <path
      d='M177.431 266.268H149.874V266.681H177.431V266.268Z'
      fill='#0F2028'
    />
    <path d='M150.701 265.349H148.45V267.6H150.701V265.349Z' fill='#0F2028' />
    <path
      d='M203.718 264.215H183.699V266.077H203.718V264.215Z'
      fill='#EBEBEB'
    />
    <path
      d='M209.674 268.104H183.699V269.966H209.674V268.104Z'
      fill='#EBEBEB'
    />
    <path
      d='M197.585 271.993H183.699V273.855H197.585V271.993Z'
      fill='#EBEBEB'
    />
    <path
      d='M179.691 264.215H175.172V268.734H179.691V264.215Z'
      fill='#1D9B5E'
    />
    <path
      d='M206.153 279.262H183.699V281.124H206.153V279.262Z'
      fill='#EBEBEB'
    />
    <path d='M202.425 283.15H183.699V285.012H202.425V283.15Z' fill='#EBEBEB' />
    <path d='M209.674 287.04H183.699V288.902H209.674V287.04Z' fill='#EBEBEB' />
    <path
      d='M179.691 279.262H175.172V283.781H179.691V279.262Z'
      fill='#D2F801'
    />
    <path d='M206.153 294.308H183.699V296.17H206.153V294.308Z' fill='#EBEBEB' />
    <path
      d='M202.425 298.197H183.699V300.059H202.425V298.197Z'
      fill='#EBEBEB'
    />
    <path
      d='M209.674 302.086H183.699V303.948H209.674V302.086Z'
      fill='#EBEBEB'
    />
    <path
      d='M179.691 294.308H175.172V298.827H179.691V294.308Z'
      fill='#DBDBDB'
    />
    <path
      d='M120.807 155.849L175.315 155.717C193.483 155.763 211.652 155.734 229.822 155.849C211.653 155.964 193.484 155.935 175.315 155.982L120.807 155.849Z'
      fill='#DBDBDB'
    />
    <path
      d='M120.807 159.921L175.315 159.788C193.483 159.835 211.652 159.806 229.822 159.921C211.653 160.035 193.484 160.007 175.315 160.053L120.807 159.921Z'
      fill='#DBDBDB'
    />
    <path
      d='M120.807 163.993L175.315 163.86C193.483 163.907 211.652 163.878 229.822 163.993C211.653 164.108 193.484 164.078 175.315 164.126L120.807 163.993Z'
      fill='#DBDBDB'
    />
    <path
      d='M120.807 168.065L175.315 167.933C193.483 167.979 211.652 167.95 229.822 168.065C211.653 168.179 193.484 168.151 175.315 168.198L120.807 168.065Z'
      fill='#DBDBDB'
    />
    <path
      d='M120.807 172.137L175.315 172.004C193.483 172.051 211.652 172.022 229.822 172.137C211.653 172.252 193.484 172.223 175.315 172.269L120.807 172.137Z'
      fill='#DBDBDB'
    />
    <path
      d='M120.807 176.208L175.315 176.075C193.483 176.122 211.652 176.093 229.822 176.208C211.653 176.322 193.484 176.293 175.315 176.341L120.807 176.208Z'
      fill='#DBDBDB'
    />
    <path
      d='M120.807 180.279L175.315 180.146C193.483 180.193 211.652 180.164 229.822 180.279C211.653 180.394 193.484 180.364 175.315 180.412L120.807 180.279Z'
      fill='#DBDBDB'
    />
    <path
      d='M120.807 184.35L175.315 184.218C193.483 184.264 211.652 184.235 229.822 184.35C211.653 184.465 193.484 184.436 175.315 184.483L120.807 184.35Z'
      fill='#DBDBDB'
    />
    <path
      d='M120.807 188.423L175.315 188.29C193.483 188.337 211.652 188.309 229.822 188.423C211.653 188.538 193.484 188.508 175.315 188.555L120.807 188.423Z'
      fill='#DBDBDB'
    />
    <path
      d='M120.807 192.494L175.315 192.361C193.483 192.408 211.652 192.379 229.822 192.494C211.653 192.608 193.484 192.58 175.315 192.627L120.807 192.494Z'
      fill='#DBDBDB'
    />
    <path
      d='M120.807 196.565L175.315 196.433C193.483 196.479 211.652 196.45 229.822 196.565C211.653 196.679 193.484 196.65 175.315 196.698L120.807 196.565Z'
      fill='#DBDBDB'
    />
    <path
      d='M120.807 200.637L175.315 200.504C193.483 200.551 211.652 200.522 229.822 200.637C211.653 200.752 193.484 200.723 175.315 200.769L120.807 200.637Z'
      fill='#DBDBDB'
    />
    <path
      d='M120.807 204.708L175.315 204.575C193.483 204.622 211.652 204.593 229.822 204.708C211.653 204.822 193.484 204.793 175.315 204.841L120.807 204.708Z'
      fill='#DBDBDB'
    />
    <path
      d='M120.807 208.779L175.315 208.646C193.483 208.694 211.652 208.665 229.822 208.779C211.653 208.893 193.484 208.865 175.315 208.912L120.807 208.779Z'
      fill='#DBDBDB'
    />
    <path
      d='M120.807 212.851L175.315 212.719C193.483 212.765 211.652 212.736 229.822 212.851C211.653 212.966 193.484 212.937 175.315 212.984L120.807 212.851Z'
      fill='#DBDBDB'
    />
    <path
      d='M140.602 184.351H132.335V217.598H140.602V184.351Z'
      fill='#D2F801'
    />
    <path
      d='M155.938 170.287H147.672V217.598H155.938V170.287Z'
      fill='#0F2028'
    />
    <path d='M171.274 180.42H163.007V217.598H171.274V180.42Z' fill='#DBDBDB' />
    <path
      d='M186.609 168.065H178.342V217.599H186.609V168.065Z'
      fill='#D2F801'
    />
    <path
      d='M201.945 174.708H193.678V217.599H201.945V174.708Z'
      fill='#0F2028'
    />
    <path d='M217.281 199.01H209.014V217.599H217.281V199.01Z' fill='#DBDBDB' />
    <path
      d='M123.766 152.993L123.991 169.145L124.146 185.296C124.253 196.063 124.284 206.831 124.303 217.599L123.766 217.107L150.28 217.086L176.793 217.144L203.307 217.306L229.82 217.598L203.307 217.89L176.793 218.052L150.28 218.11L123.766 218.089H123.228L123.229 217.597C123.248 206.83 123.28 196.062 123.386 185.295L123.541 169.143L123.766 152.993Z'
      fill='#DBDBDB'
    />
    <path
      d='M140.602 221.012H132.335V221.696H140.602V221.012Z'
      fill='#DBDBDB'
    />
    <path
      d='M155.938 221.012H147.672V221.696H155.938V221.012Z'
      fill='#DBDBDB'
    />
    <path
      d='M171.274 221.012H163.007V221.696H171.274V221.012Z'
      fill='#DBDBDB'
    />
    <path
      d='M186.609 221.012H178.342V221.696H186.609V221.012Z'
      fill='#DBDBDB'
    />
    <path
      d='M201.945 221.012H193.678V221.696H201.945V221.012Z'
      fill='#DBDBDB'
    />
    <path
      d='M217.281 221.012H209.014V221.696H217.281V221.012Z'
      fill='#DBDBDB'
    />
    <path d='M280.136 158.37H250.297V159.991H280.136V158.37Z' fill='#EBEBEB' />
    <path
      d='M274.459 161.756H250.297V163.377H274.459V161.756Z'
      fill='#EBEBEB'
    />
    <path d='M246.71 158.348H241.657V163.4H246.71V158.348Z' fill='#D2F801' />
    <path
      d='M280.136 174.987H250.297V176.608H280.136V174.987Z'
      fill='#EBEBEB'
    />
    <path
      d='M274.459 178.373H250.297V179.994H274.459V178.373Z'
      fill='#EBEBEB'
    />
    <path d='M246.71 174.965H241.657V180.017H246.71V174.965Z' fill='#0F2028' />
    <path
      d='M280.136 191.604H250.297V193.225H280.136V191.604Z'
      fill='#EBEBEB'
    />
    <path d='M274.459 194.99H250.297V196.611H274.459V194.99Z' fill='#EBEBEB' />
    <path d='M246.71 191.582H241.657V196.634H246.71V191.582Z' fill='#DBDBDB' />
    <path
      d='M249.456 250.281C249.456 250.747 249.421 251.208 249.353 251.656C248.692 256.187 244.787 259.665 240.072 259.665C234.89 259.665 230.688 255.463 230.688 250.281C230.688 245.099 234.89 240.896 240.072 240.896C243.554 240.896 246.594 242.794 248.217 245.615C249.004 246.99 249.456 248.584 249.456 250.281Z'
      fill='#1D9B5E'
    />
    <path
      d='M249.455 250.281C249.455 250.747 249.421 251.208 249.353 251.656L240.072 250.281V240.896C243.554 240.896 246.594 242.794 248.217 245.615C249.004 246.99 249.455 248.584 249.455 250.281Z'
      fill='#D2F801'
    />
    <path
      d='M240.07 256.771C243.655 256.771 246.56 253.865 246.56 250.281C246.56 246.697 243.655 243.791 240.07 243.791C236.486 243.791 233.581 246.697 233.581 250.281C233.581 253.865 236.486 256.771 240.07 256.771Z'
      fill='white'
    />
    <path
      d='M242.772 248.839H237.369V249.602H242.772V248.839Z'
      fill='#0F2028'
    />
    <path d='M244.11 250.959H236.03V251.722H244.11V250.959Z' fill='#A6A6A6' />
    <path
      d='M249.455 274.512C249.455 278.507 246.957 281.923 243.434 283.273C242.388 283.677 241.255 283.897 240.071 283.897C234.889 283.897 230.687 279.694 230.687 274.512C230.687 269.33 234.889 265.128 240.071 265.128C243.557 265.128 246.596 267.025 248.216 269.847C249.004 271.221 249.455 272.815 249.455 274.512Z'
      fill='#1D9B5E'
    />
    <path
      d='M249.455 274.512C249.455 278.507 246.957 281.923 243.434 283.273L240.071 274.512V265.128C243.557 265.128 246.596 267.025 248.216 269.847C249.004 271.221 249.455 272.815 249.455 274.512Z'
      fill='#D2F801'
    />
    <path
      d='M240.071 281.002C243.655 281.002 246.561 278.097 246.561 274.512C246.561 270.928 243.655 268.022 240.071 268.022C236.487 268.022 233.581 270.928 233.581 274.512C233.581 278.097 236.487 281.002 240.071 281.002Z'
      fill='white'
    />
    <path d='M242.773 273.07H237.37V273.833H242.773V273.07Z' fill='#0F2028' />
    <path d='M244.111 275.19H236.031V275.953H244.111V275.19Z' fill='#A6A6A6' />
    <path
      d='M249.455 298.746C249.455 300.74 248.832 302.59 247.771 304.109C246.077 306.539 243.259 308.13 240.071 308.13C237.748 308.13 235.619 307.284 233.981 305.882C231.964 304.163 230.687 301.605 230.687 298.746C230.687 293.563 234.889 289.361 240.071 289.361C243.553 289.361 246.593 291.259 248.216 294.08C249.004 295.455 249.455 297.049 249.455 298.746Z'
      fill='#1D9B5E'
    />
    <path
      d='M249.455 298.746C249.455 300.74 248.832 302.59 247.771 304.109C246.077 306.539 243.259 308.13 240.071 308.13C237.748 308.13 235.619 307.284 233.981 305.882L240.071 298.746V289.361C243.553 289.361 246.593 291.259 248.216 294.08C249.004 295.455 249.455 297.049 249.455 298.746Z'
      fill='#D2F801'
    />
    <path
      d='M246.49 299.533C246.927 295.975 244.397 292.737 240.84 292.3C237.282 291.863 234.044 294.393 233.607 297.95C233.17 301.508 235.7 304.746 239.257 305.183C242.815 305.62 246.053 303.09 246.49 299.533Z'
      fill='white'
    />
    <path
      d='M242.772 297.304H237.369V298.067H242.772V297.304Z'
      fill='#0F2028'
    />
    <path d='M244.11 299.424H236.03V300.187H244.11V299.424Z' fill='#A6A6A6' />
    <path
      d='M281.192 247.392H255.174V248.114H281.192V247.392Z'
      fill='#EBEBEB'
    />
    <path
      d='M281.192 249.919H255.174V250.642H281.192V249.919Z'
      fill='#EBEBEB'
    />
    <path
      d='M281.192 252.446H255.174V253.168H281.192V252.446Z'
      fill='#EBEBEB'
    />
    <path
      d='M281.192 271.625H255.174V272.348H281.192V271.625Z'
      fill='#EBEBEB'
    />
    <path
      d='M281.192 274.152H255.174V274.875H281.192V274.152Z'
      fill='#EBEBEB'
    />
    <path d='M281.192 276.68H255.174V277.402H281.192V276.68Z' fill='#EBEBEB' />
    <path
      d='M281.192 295.858H255.174V296.581H281.192V295.858Z'
      fill='#EBEBEB'
    />
    <path
      d='M281.192 298.386H255.174V299.109H281.192V298.386Z'
      fill='#EBEBEB'
    />
    <path
      d='M281.192 300.913H255.174V301.636H281.192V300.913Z'
      fill='#EBEBEB'
    />
    <path
      d='M79.2205 300.349C78.4246 303.733 77.5836 307.062 77.4204 310.534C77.512 310.705 77.4944 311.334 77.393 311.163C77.3729 311.723 76.5215 311.62 76.5207 311.069C76.5296 310.709 76.5384 310.348 76.5553 310C74.5654 307.529 71.6758 305.963 69.3402 303.816C67.4516 302.078 66.1009 300.007 65.3861 297.523C63.4485 290.846 65.2647 283.771 62.9347 277.112C60.9263 271.37 57.3236 266.379 54.274 261.176C51.0564 255.674 48.6822 249.892 48.4442 243.449C48.2545 238.515 48.843 231.94 52.6009 228.243C56.5839 224.32 61.5213 227.26 64.5741 230.758C73.4173 240.908 77.5096 253.734 79.1635 266.849C80.0752 274.107 81.0223 281.41 80.8044 288.737C80.6806 292.675 80.1146 296.524 79.2205 300.349Z'
      fill='#D2F801'
    />
    <path
      d='M77.459 313.2C77.9165 306.34 77.8875 299.469 77.2162 292.637C77.2274 292.612 77.2491 292.595 77.2499 292.562C77.3617 287.004 77.8031 281.467 77.5852 275.902C77.348 269.856 76.462 263.93 75.137 258.032C75.1218 257.964 75.0164 257.98 75.0293 258.05C76.1195 263.803 76.7531 269.673 76.9629 275.525C77.0755 278.665 77.0538 281.808 76.8881 284.945C76.8343 285.967 76.7394 286.995 76.6719 288.025C76.6711 288.022 76.6711 288.018 76.6711 288.015C74.4295 272.373 68.656 257.533 60.1336 244.253C60.0178 244.072 59.6978 244.265 59.8104 244.45C65.9473 254.471 70.4722 265.478 73.2709 276.899C69.0178 269.02 62.5954 262.541 57.8293 254.97C57.8036 254.929 57.7344 254.971 57.757 255.014C62.0383 263.442 69.111 270.089 73.6191 278.394C74.4014 281.778 75.0414 285.194 75.5181 288.632C76.1726 293.351 76.4797 298.1 76.544 302.855C73.9543 298.012 71.265 293.381 69.1464 288.26C69.0901 288.124 68.8948 288.218 68.9398 288.353C70.7424 293.672 73.1664 299.402 76.5585 303.939C76.577 307.305 76.4773 310.674 76.2787 314.037C75.7497 323.014 74.2164 331.872 73.5073 340.82C73.4864 341.09 73.8651 341.121 73.9182 340.864C75.7818 331.832 76.8455 322.397 77.459 313.2Z'
      fill='#0F2028'
    />
    <path
      d='M67.926 243.966C67.8986 243.9 67.8029 243.945 67.8263 244.011C69.4664 248.545 70.3926 253.139 71.5769 257.787C71.6308 257.999 71.9379 257.954 71.9154 257.732C71.433 253.016 69.7502 248.312 67.926 243.966Z'
      fill='#0F2028'
    />
    <path
      d='M109.564 262.97C108.501 265.633 107.182 268.212 105.793 270.717C102.84 276.079 99.7603 280.992 99.2023 287.236C98.9531 290.024 98.8647 292.825 98.0148 295.511C97.2808 297.836 96.0893 299.982 94.7168 301.989C91.5169 306.651 87.5162 310.668 84.5511 315.505C81.4653 320.532 79.1892 326.064 77.7966 331.792C77.7235 332.106 77.2282 332.022 77.3022 331.709C77.3134 331.684 77.3167 331.664 77.3207 331.637C77.3094 331.622 77.2925 331.605 77.2917 331.571C76.8222 318.184 77.8899 304.691 81.9734 291.866C83.7599 286.259 85.9621 280.681 88.4609 275.35C90.6478 270.7 93.375 266.229 97.2149 262.755C99.7065 260.511 105.111 256.257 108.657 258.507C110.362 259.59 110.235 261.299 109.564 262.97Z'
      fill='#D2F801'
    />
    <path
      d='M96.1094 293.319C93.8131 297.244 91.0908 300.897 88.3291 304.503C87.033 306.195 85.7185 307.873 84.4248 309.568C83.813 310.369 83.128 311.165 82.5668 312.026C82.9205 310.618 83.2655 309.208 83.6241 307.801C85.351 301.037 87.0121 294.214 89.5849 287.709C92.0998 281.352 95.4445 275.382 98.8799 269.487C98.97 269.332 98.72 269.22 98.6283 269.369C95.7998 274.021 92.9287 278.668 90.5505 283.572C89.2215 286.312 88.1039 289.131 87.1214 292C88.2784 285.851 89.6637 279.946 91.6858 273.993C91.7034 273.94 91.6279 273.901 91.6054 273.955C89.1387 279.793 87.3626 286.358 86.869 292.685C86.8682 292.697 86.8738 292.705 86.8778 292.715C86.2982 294.453 85.7643 296.209 85.2666 297.978C83.1577 305.467 81.3061 313.036 79.5888 320.631C79.6185 315.616 79.9337 310.692 80.8808 305.743C80.9025 305.63 80.7321 305.603 80.7055 305.713C79.4609 310.809 78.8989 316.172 79.4127 321.407C78.7639 324.295 78.1319 327.187 77.5153 330.079C76.1991 336.25 74.5823 342.531 73.8136 348.797C73.7935 348.959 74.0195 348.993 74.0613 348.838C74.9794 345.461 75.5334 341.959 76.2843 338.54C77.0377 335.11 77.8135 331.684 78.6119 328.264C79.7745 323.283 80.9926 318.315 82.2331 313.353C83.0621 311.534 84.666 309.918 85.8664 308.392C87.1842 306.718 88.5027 305.043 89.7851 303.341C92.173 300.171 94.3647 296.879 96.2267 293.372C96.2678 293.3 96.1512 293.248 96.1094 293.319Z'
      fill='#0F2028'
    />
    <path
      d='M96.6802 287.594C93.777 291.32 91.1414 295.446 89.0671 299.692C89.0406 299.746 89.125 299.803 89.1588 299.75C91.7211 295.734 94.2409 291.689 96.7984 287.669C96.8418 287.601 96.7292 287.531 96.6802 287.594Z'
      fill='#0F2028'
    />
    <path
      d='M39.6911 275.662C41.4261 278.651 43.4064 282.239 42.661 285.827C42.1891 288.097 40.5264 289.941 40.2265 292.258C39.5544 297.372 44.6501 300.75 48.3381 303.166C57.5302 309.198 70.1386 314.575 71.8101 326.892C71.8736 327.328 72.6277 327.22 72.5731 326.793C72.5731 326.765 72.5642 326.738 72.5546 326.711C72.5731 326.683 72.6004 326.675 72.6004 326.638C73.7903 320.398 73.763 314.04 72.4275 307.826C71.0559 301.477 68.2853 295.773 65.0155 290.195C59.4831 280.758 53.6252 271.093 45.2588 263.863C42.9424 261.864 38.2005 258.268 36.3569 262.782C34.568 267.17 37.5653 272.02 39.6911 275.662Z'
      fill='#D2F801'
    />
    <path
      d='M48.1049 295.672C54.1992 302.271 63.8891 305.969 69.136 313.36C66.0269 302.033 60.8821 291.847 52.9723 282.999C52.7697 282.771 53.0865 282.449 53.3084 282.663C59.0996 288.229 63.3874 294.735 66.5165 301.793C65.1095 296.754 63.1413 291.987 60.829 287.247C60.7414 287.069 60.9955 286.914 61.0984 287.09C64.045 292.112 66.0028 297.752 67.2289 303.44C74.1417 320.174 74.7825 339.802 73.3336 357.441C73.3127 357.691 72.9284 357.699 72.9365 357.441C73.3336 343.54 73.1085 329.396 69.7776 315.821C69.7076 315.537 69.6304 315.258 69.5589 314.976C63.8513 307.02 54.2033 303.332 47.9996 295.778C47.9393 295.705 48.0382 295.601 48.1049 295.672Z'
      fill='#0F2028'
    />
    <path
      d='M46.6923 290.006C49.8922 292.942 53.0415 295.944 56.2462 298.877C56.2784 298.906 56.2358 298.963 56.1988 298.938C52.7102 296.578 49.1678 293.458 46.501 290.196C46.3932 290.064 46.5621 289.887 46.6923 290.006Z'
      fill='#0F2028'
    />
    <path
      d='M46.1866 277.288C49.0922 281.946 52.1394 286.313 55.759 290.455C55.8064 290.51 55.7317 290.587 55.6786 290.536C51.7929 286.794 48.3421 282.268 46.0145 277.389C45.9607 277.275 46.1182 277.179 46.1866 277.288Z'
      fill='#0F2028'
    />
    <path
      d='M60.5919 369.88H88.6161L84.8397 332.175H64.9077L60.5919 369.88Z'
      fill='#455A64'
    />
    <path
      d='M64.2042 338.304H85.4564L84.8413 332.175H64.9053L64.2042 338.304Z'
      fill='#0F2028'
    />
    <path
      d='M61.4687 334.019H87.7386V327.998H61.4687V334.019Z'
      fill='#455A64'
    />
    <path d='M337.399 204.002H262.246V276.781H337.399V204.002Z' fill='white' />
    <path
      d='M337.399 204.002C337.399 204.199 337.596 276.797 337.596 276.977C337.556 277.08 262.34 277.004 262.246 277.077H261.95L261.95 276.781C261.959 276.573 262.041 203.993 262.048 203.804C262.14 203.651 337.264 204.112 337.399 204.002ZM337.399 204.002L262.246 204.201C262.744 202.947 262.4 277.06 262.541 276.78L262.246 276.485L337.399 276.584C336.924 277.806 337.522 203.74 337.399 204.002Z'
      fill='#0F2028'
    />
    <path
      d='M337.399 204.002H262.246V208.615H337.399V204.002Z'
      fill='#0F2028'
    />
    <path
      d='M266.605 206.308C266.605 206.792 266.212 207.184 265.729 207.184C265.245 207.184 264.854 206.791 264.854 206.308C264.854 205.825 265.246 205.433 265.729 205.433C266.213 205.433 266.605 205.824 266.605 206.308Z'
      fill='#C7C7C7'
    />
    <path
      d='M270.181 206.308C270.181 206.792 269.789 207.184 269.305 207.184C268.821 207.184 268.43 206.791 268.43 206.308C268.43 205.825 268.822 205.433 269.305 205.433C269.789 205.433 270.181 205.824 270.181 206.308Z'
      fill='white'
    />
    <path
      d='M273.757 206.308C273.757 206.792 273.365 207.184 272.882 207.184C272.398 207.184 272.006 206.791 272.006 206.308C272.006 205.825 272.398 205.433 272.882 205.433C273.365 205.433 273.757 205.824 273.757 206.308Z'
      fill='#D2F801'
    />
    <path
      d='M302.731 220.208L297.789 237.509V255.499C287.858 255.499 279.804 247.44 279.804 237.509C279.804 227.578 287.858 219.519 297.789 219.519C299.505 219.519 301.164 219.765 302.731 220.208Z'
      fill='#D2F801'
    />
    <path
      d='M308.443 251.997C305.463 254.2 301.778 255.498 297.789 255.498V237.508L308.443 251.997Z'
      fill='#C7C7C7'
    />
    <path
      d='M315.779 237.508C315.779 243.456 312.892 248.725 308.443 251.997L297.789 237.508L311.778 226.2C314.28 229.288 315.779 233.226 315.779 237.508Z'
      fill='#37474F'
    />
    <path
      d='M315.779 220.374L301.79 231.682L306.732 214.381C310.337 215.414 313.483 217.533 315.779 220.374Z'
      fill='#0F2028'
    />
    <path
      d='M282.333 264.225H279.428V267.129H282.333V264.225Z'
      fill='#0F2028'
    />
    <path d='M316.155 264.225H284.35V265.082H316.155V264.225Z' fill='#455A64' />
    <path d='M304.901 266.271H284.35V267.129H304.901V266.271Z' fill='#455A64' />
    <path d='M129.439 115.183H35.811V187.962H129.439V115.183Z' fill='white' />
    <path
      d='M129.439 115.183C129.44 115.38 129.636 187.977 129.636 188.158C129.61 188.251 35.8962 188.192 35.811 188.258H35.5143L35.5151 187.962C35.5255 187.754 35.6051 115.173 35.6124 114.984C35.6984 114.846 129.311 115.282 129.439 115.183ZM129.439 115.183L35.811 115.382C36.2942 114.127 35.9766 188.241 36.1068 187.961L35.811 187.666L129.439 187.765C128.986 188.986 129.549 114.921 129.439 115.183Z'
      fill='#0F2028'
    />
    <path d='M67.1662 175.36H64.2613V178.265H67.1662V175.36Z' fill='#D2F801' />
    <path d='M100.989 175.36H69.1834V176.218H100.989V175.36Z' fill='#455A64' />
    <path
      d='M89.7345 177.407H69.1834V178.265H89.7345V177.407Z'
      fill='#455A64'
    />
    <path
      d='M46.2501 134.499C58.3752 134.425 70.4995 134.444 82.6247 134.413C94.7498 134.444 106.874 134.425 118.999 134.499C106.874 134.573 94.7498 134.555 82.6247 134.585C70.4995 134.555 58.3752 134.573 46.2501 134.499Z'
      fill='#455A64'
    />
    <path
      d='M46.2501 141.553C58.3752 141.479 70.4995 141.497 82.6247 141.467C94.7498 141.497 106.874 141.479 118.999 141.553C106.874 141.627 94.7498 141.608 82.6247 141.639C70.4995 141.608 58.3752 141.627 46.2501 141.553Z'
      fill='#455A64'
    />
    <path
      d='M46.2501 148.607C58.3752 148.533 70.4995 148.551 82.6247 148.521C94.7498 148.551 106.874 148.532 118.999 148.607C106.874 148.68 94.7498 148.662 82.6247 148.693C70.4995 148.662 58.3752 148.68 46.2501 148.607Z'
      fill='#455A64'
    />
    <path
      d='M46.2501 155.659C58.3752 155.585 70.4995 155.604 82.6247 155.573C94.7498 155.604 106.874 155.584 118.999 155.659C106.874 155.733 94.7498 155.715 82.6247 155.745C70.4995 155.715 58.3752 155.733 46.2501 155.659Z'
      fill='#455A64'
    />
    <path
      d='M46.2501 162.712C58.3752 162.638 70.4995 162.657 82.6247 162.626C94.7498 162.657 106.874 162.638 118.999 162.712C106.874 162.786 94.7498 162.767 82.6247 162.798C70.4995 162.767 58.3752 162.786 46.2501 162.712Z'
      fill='#455A64'
    />
    <path
      d='M60.8974 129.914C61.0043 136.504 60.977 143.095 61.0212 149.685C60.977 156.276 61.0043 162.866 60.8974 169.456C60.7896 162.866 60.817 156.276 60.7727 149.685C60.8178 143.095 60.7904 136.504 60.8974 129.914Z'
      fill='#455A64'
    />
    <path
      d='M73.4775 129.914C73.5845 136.504 73.5571 143.095 73.6022 149.685C73.5579 156.276 73.5853 162.866 73.4775 169.456C73.3706 162.866 73.3971 156.276 73.3537 149.685C73.3979 143.095 73.3714 136.504 73.4775 129.914Z'
      fill='#455A64'
    />
    <path
      d='M86.0585 129.914C86.1655 136.504 86.1381 143.095 86.1824 149.685C86.1381 156.276 86.1655 162.866 86.0585 169.456C85.9516 162.866 85.9781 156.276 85.9339 149.685C85.979 143.095 85.9516 136.504 86.0585 129.914Z'
      fill='#455A64'
    />
    <path
      d='M98.6387 129.914C98.7457 136.504 98.7183 143.095 98.7633 149.685C98.7191 156.276 98.7465 162.866 98.6387 169.456C98.5318 162.866 98.5583 156.276 98.5141 149.685C98.5591 143.095 98.5318 136.504 98.6387 129.914Z'
      fill='#455A64'
    />
    <path
      d='M111.22 129.914C111.327 136.504 111.299 143.095 111.344 149.685C111.299 156.276 111.327 162.866 111.22 169.456C111.112 162.866 111.139 156.276 111.096 149.685C111.14 143.095 111.113 136.504 111.22 129.914Z'
      fill='#455A64'
    />
    <path
      opacity='0.5'
      d='M48.0832 157.596C50.3039 157.596 51.628 150.432 54.7733 150.432C57.9185 150.432 58.2498 155.66 60.8982 155.66C63.5465 155.66 63.4637 146.477 67.023 146.477C70.5823 146.477 69.7542 150.203 73.4783 150.203C77.2033 150.203 75.7955 141.553 79.686 141.553C83.5758 141.553 82.0032 153.469 86.0585 153.469C88.6241 153.469 89.6178 149.684 92.6795 149.684C94.7072 149.684 95.9027 151.578 98.5535 151.578C101.245 151.578 101.784 144.298 105.094 144.298C108.405 144.298 108.783 148.605 111.219 148.605C113.654 148.605 114.53 141.552 118.998 141.552V169.455H48.0832V157.596Z'
      fill='#D2F801'
    />
    <path
      d='M48.0832 157.942V157.252C48.7554 157.252 49.6816 155.578 50.3585 154.356C51.5203 152.257 52.7223 150.087 54.7733 150.087C56.7423 150.087 57.7199 151.676 58.5834 153.078C59.2588 154.177 59.9591 155.314 60.8974 155.314C61.7263 155.314 62.4434 153.109 62.9677 151.499C63.8263 148.86 64.7139 146.133 67.023 146.133C69.0845 146.133 69.8933 147.203 70.6057 148.149C71.2987 149.066 71.8969 149.858 73.4783 149.858C74.9095 149.858 75.4699 147.837 76.0118 145.883C76.6493 143.585 77.3086 141.209 79.686 141.209C82.0434 141.209 82.6464 144.202 83.2855 147.371C83.8017 149.935 84.4433 153.126 86.0593 153.126C87.0249 153.126 87.8145 152.339 88.649 151.506C89.6669 150.491 90.8206 149.34 92.6795 149.34C93.7962 149.34 94.6686 149.81 95.5128 150.265C96.3964 150.741 97.3113 151.234 98.5543 151.234C99.4733 151.234 100.311 149.503 100.985 148.111C101.974 146.068 102.996 143.954 105.096 143.954C107.18 143.954 108.207 145.329 109.113 146.541C109.774 147.425 110.399 148.262 111.221 148.262C111.922 148.262 112.714 146.921 113.414 145.739C114.609 143.721 116.096 141.208 119.002 141.208V141.897C116.764 141.897 115.474 144.077 114.336 146.001C113.361 147.649 112.59 148.951 111.222 148.951C109.794 148.951 109.034 147.934 108.23 146.857C107.417 145.769 106.576 144.644 105.097 144.644C103.714 144.644 102.766 146.602 101.929 148.33C100.996 150.258 100.19 151.923 98.5559 151.923C96.9712 151.923 95.8722 151.331 94.9033 150.809C94.1275 150.39 93.4577 150.029 92.6819 150.029C91.344 150.029 90.3905 150.98 89.4683 151.899C88.5244 152.84 87.5475 153.815 86.0609 153.815C83.579 153.815 82.9583 150.731 82.3006 147.466C81.8022 144.986 81.1799 141.898 79.6884 141.898C78.1335 141.898 77.5273 144.085 76.991 146.014C76.3446 148.345 75.7336 150.547 73.48 150.547C71.2955 150.547 70.4609 149.443 69.7253 148.468C69.0588 147.585 68.4831 146.822 67.0246 146.822C65.5123 146.822 64.6408 149.499 63.9405 151.651C63.1494 154.083 62.5239 156.004 60.899 156.004C59.303 156.004 58.5095 154.714 57.6693 153.349C56.8902 152.085 56.0862 150.777 54.7749 150.777C53.4081 150.777 52.2335 152.899 51.2896 154.603C50.2548 156.469 49.4396 157.942 48.0832 157.942Z'
      fill='#D2F801'
    />
    <path
      d='M48.0832 130.343C48.1636 136.862 48.2336 143.38 48.24 149.899L48.3156 169.456L48.0832 169.295L83.542 169.336L101.271 169.368L119 169.457L101.271 169.545L83.542 169.577L48.0832 169.618H47.8501L47.8509 169.457L47.9264 149.9C47.9329 143.38 48.002 136.862 48.0832 130.343Z'
      fill='#455A64'
    />
    <path d='M129.439 115.183H35.811V119.795H129.439V115.183Z' fill='#0F2028' />
    <path
      d='M40.1702 117.489C40.1702 117.973 39.7779 118.364 39.2947 118.364C38.8107 118.364 38.4191 117.972 38.4191 117.489C38.4191 117.005 38.8115 116.613 39.2947 116.613C39.7787 116.613 40.1702 117.006 40.1702 117.489Z'
      fill='#C7C7C7'
    />
    <path
      d='M43.7464 117.489C43.7464 117.973 43.3541 118.364 42.8709 118.364C42.3877 118.364 41.9953 117.972 41.9953 117.489C41.9953 117.005 42.3877 116.613 42.8709 116.613C43.3541 116.613 43.7464 117.006 43.7464 117.489Z'
      fill='white'
    />
    <path
      d='M47.3218 117.489C47.3218 117.973 46.9295 118.364 46.4463 118.364C45.9623 118.364 45.5707 117.972 45.5707 117.489C45.5707 117.005 45.9631 116.613 46.4463 116.613C46.9303 116.613 47.3218 117.006 47.3218 117.489Z'
      fill='#D2F801'
    />
    <path
      d='M360.871 315.321C360.871 315.321 361.43 350.513 361.431 350.537C361.345 357.132 361.152 362.912 360.773 365.894C360.774 365.91 360.774 365.926 360.766 365.942C360.625 367.067 360.457 367.784 360.253 367.973C360.238 367.989 360.23 368.006 360.214 368.014C358.233 369.318 305.51 370.168 303.662 369.578C301.806 368.997 303.348 363.674 305.367 362.009C307.403 360.343 327.435 350.989 327.435 350.989L327.21 315.32L360.871 315.321Z'
      fill='#F7A9A0'
    />
    <path
      d='M361.56 343.457C361.56 343.457 361.43 350.513 361.431 350.536C361.345 357.131 361.152 362.911 360.773 365.893C360.774 365.909 360.774 365.925 360.766 365.941C360.559 367.051 360.377 367.784 360.253 367.972C360.238 367.988 360.23 368.005 360.214 368.013C358.233 369.317 305.51 370.168 303.662 369.577C301.806 368.996 303.348 363.673 305.367 362.008C307.403 360.342 327.435 350.988 327.435 350.988L327.468 343.802L361.56 343.457Z'
      fill='white'
    />
    <path
      d='M324.206 350.976C327.722 350.433 331.98 351.103 334.574 353.676C334.675 353.776 334.532 353.917 334.419 353.878C331.004 352.683 327.804 351.886 324.205 351.418C323.952 351.386 323.953 351.015 324.206 350.976Z'
      fill='#0F2028'
    />
    <path
      d='M321.635 352.419C325.15 351.875 329.41 352.545 332.003 355.119C332.103 355.218 331.96 355.36 331.849 355.32C328.433 354.126 325.234 353.328 321.635 352.861C321.381 352.828 321.383 352.457 321.635 352.419Z'
      fill='#0F2028'
    />
    <path
      d='M319.064 353.86C322.58 353.317 326.84 353.986 329.433 356.56C329.533 356.66 329.39 356.801 329.277 356.762C325.862 355.567 322.664 354.769 319.063 354.302C318.811 354.269 318.813 353.899 319.064 353.86Z'
      fill='#0F2028'
    />
    <path
      d='M303.661 369.579C305.513 370.17 358.209 370.285 360.194 368.977C360.957 368.493 361.304 359.839 361.429 350.537C361.429 350.44 361.43 350.343 361.43 350.246L327.412 350.415L327.434 350.991C327.434 350.991 307.4 360.343 305.367 362.011C303.351 363.673 301.809 368.996 303.661 369.579Z'
      fill='#D2F801'
    />
    <path
      d='M304.225 367.526C313.108 367.164 348.972 366.545 357.781 366.862C357.852 366.865 357.853 366.914 357.782 366.918C348.985 367.469 313.117 367.798 304.227 367.672C304.039 367.668 304.037 367.533 304.225 367.526Z'
      fill='#0F2028'
    />
    <path
      opacity='0.1'
      d='M330.107 350.503L310.317 369.873C306.548 369.802 304.04 369.699 303.659 369.58C301.81 368.993 303.349 363.676 305.365 362.009C307.397 360.342 327.433 350.987 327.433 350.987L327.409 350.415L330.004 350.399L330.107 350.503Z'
      fill='black'
    />
    <path
      d='M362.644 350.093L324.205 350.545C324.205 350.545 323.321 285.491 323.359 264.779C323.403 241.123 326.946 170.535 326.946 170.535L355.462 170.815C355.462 170.815 359.98 180.822 361.669 193.096C362.122 196.393 361.604 206 360.467 210.389L359.449 267.883L362.644 350.093Z'
      fill='#0F2028'
    />
    <path
      d='M329.502 309.012C329.158 298.74 328.961 286.126 328.781 275.85C328.42 255.294 328.481 234.734 328.941 214.18C329.2 202.649 329.621 191.122 330.079 179.596C330.085 179.465 329.884 179.47 329.876 179.6C328.58 200.227 327.962 220.901 327.735 241.566C327.509 262.124 327.707 285.023 328.52 305.567C328.977 317.098 329.564 328.635 330.536 340.136C330.544 340.236 330.696 340.235 330.693 340.134C330.332 329.759 329.848 319.389 329.502 309.012Z'
      fill='#37474F'
    />
    <path
      d='M329.267 343.125C336.931 342.608 344.638 342.595 352.314 342.742C354.485 342.783 356.654 342.845 358.822 342.952C358.901 342.956 358.896 343.069 358.819 343.074C351.154 343.544 343.446 343.637 335.77 343.482C333.601 343.439 331.43 343.374 329.263 343.253C329.181 343.248 329.187 343.131 329.267 343.125Z'
      fill='#37474F'
    />
    <path
      d='M308.665 317.92C308.665 317.92 308.536 351.02 308.537 351.043C308.451 357.638 308.258 363.418 307.879 366.4C307.88 366.416 307.88 366.432 307.872 366.448C307.731 367.573 307.564 368.289 307.36 368.479C307.343 368.495 307.336 368.511 307.32 368.52C305.34 369.824 252.616 370.674 250.768 370.085C248.912 369.504 250.454 364.18 252.474 362.515C254.509 360.85 274.542 351.496 274.542 351.496L276.48 318.015L308.665 317.92Z'
      fill='#F7A9A0'
    />
    <path
      d='M308.665 343.964C308.665 343.964 308.536 351.019 308.537 351.043C308.451 357.638 308.258 363.418 307.879 366.399C307.88 366.416 307.88 366.432 307.872 366.448C307.666 367.558 307.483 368.291 307.36 368.479C307.343 368.495 307.336 368.511 307.32 368.52C305.34 369.824 252.616 370.674 250.768 370.085C248.912 369.504 250.454 364.18 252.474 362.515C254.509 360.849 274.542 351.496 274.542 351.496L274.575 344.31L308.665 343.964Z'
      fill='white'
    />
    <path
      d='M271.311 351.483C274.826 350.94 279.086 351.609 281.679 354.183C281.779 354.283 281.636 354.424 281.524 354.385C278.108 353.19 274.91 352.392 271.31 351.925C271.057 351.892 271.059 351.522 271.311 351.483Z'
      fill='#0F2028'
    />
    <path
      d='M268.74 352.926C272.256 352.382 276.516 353.052 279.109 355.625C279.209 355.725 279.066 355.867 278.954 355.827C275.539 354.632 272.34 353.835 268.74 353.368C268.487 353.335 268.489 352.964 268.74 352.926Z'
      fill='#0F2028'
    />
    <path
      d='M266.17 354.367C269.686 353.823 273.945 354.493 276.538 357.067C276.639 357.166 276.496 357.308 276.383 357.269C272.968 356.074 269.769 355.276 266.17 354.809C265.916 354.776 265.918 354.406 266.17 354.367Z'
      fill='#0F2028'
    />
    <path
      d='M250.766 370.086C252.617 370.677 305.519 371.004 307.504 369.696C308.267 369.212 308.409 360.345 308.533 351.044C308.533 350.947 308.534 350.849 308.534 350.752L274.516 350.921L274.539 351.498C274.539 351.498 254.505 360.849 252.472 362.518C250.456 364.18 248.914 369.503 250.766 370.086Z'
      fill='#D2F801'
    />
    <path
      d='M251.329 367.873C260.214 367.564 296.08 367.157 304.887 367.527C304.959 367.53 304.96 367.579 304.888 367.583C296.088 368.081 260.219 368.197 251.33 368.018C251.142 368.014 251.141 367.88 251.329 367.873Z'
      fill='#0F2028'
    />
    <path
      d='M338.56 207.158C338.552 207.181 317.488 257.058 315.62 265.039C313.858 272.566 310.74 351.044 310.74 351.044L273.17 350.753C273.17 350.753 278.697 271.43 279.395 263.381C280.311 252.812 289.513 228.71 299.266 202.943C303.4 192.025 308.958 181.321 311.874 170.388L354.578 170.807C354.578 170.807 354.017 190.091 345.109 203.953C345.109 203.953 341.118 205.752 338.56 207.158Z'
      fill='#0F2028'
    />
    <path
      d='M276.637 343.712C284.31 343.34 292.015 343.474 299.688 343.766C301.857 343.849 304.025 343.952 306.191 344.101C306.269 344.106 306.263 344.219 306.185 344.222C298.513 344.547 290.804 344.493 283.133 344.192C280.964 344.107 278.795 344.001 276.631 343.84C276.548 343.833 276.556 343.716 276.637 343.712Z'
      fill='#37474F'
    />
    <path
      d='M328.755 208.013C330.728 207.997 332.696 207.882 334.642 207.538C336.607 207.19 338.445 206.557 340.357 206.014C342.171 205.499 344.096 205.435 345.954 205.155C347.839 204.871 349.721 204.398 351.447 203.578C351.528 203.539 351.595 203.661 351.514 203.702C349.801 204.558 348.077 205.367 346.242 205.925C344.358 206.499 342.394 206.561 340.484 207.009C338.518 207.47 336.624 208.088 334.606 208.301C332.649 208.508 330.673 208.482 328.732 208.144C328.656 208.131 328.683 208.014 328.755 208.013Z'
      fill='#37474F'
    />
    <path
      d='M325.08 239.178C325.492 238.012 325.882 236.841 326.318 235.679C327.199 233.329 328.094 230.976 329.069 228.647C331.008 224.017 332.841 219.358 334.889 214.755C336.051 212.144 337.095 209.499 338.453 206.941C338.486 206.879 338.607 206.907 338.588 206.973C337.895 209.363 336.923 211.699 336.051 214.055C335.18 216.408 334.249 218.75 333.315 221.091C331.461 225.741 329.645 230.401 327.624 235.013C327.057 236.306 326.475 237.595 325.864 238.876C325.239 240.185 324.744 241.537 323.998 242.812C323.958 242.881 323.83 242.85 323.848 242.776C324.143 241.559 324.658 240.374 325.08 239.178Z'
      fill='#37474F'
    />
    <path
      d='M317.254 173.008C317.276 172.877 317.39 172.96 317.381 173.058C317.053 176.504 316.457 180.231 315.248 183.495L311.621 193.554L304.344 213.664C298.946 228.763 293.329 243.79 288.327 259.018C287.724 260.699 287.526 262.406 287.387 264.186C285.669 283.528 283.148 318.99 281.513 338.763C281.507 338.834 281.328 338.919 281.324 338.766C281.316 338.454 282.722 317.446 282.722 317.446C283.605 304.751 284.757 287.253 285.767 274.778C286.05 271.223 286.324 267.67 286.653 264.115C286.783 262.329 287 260.497 287.605 258.797C294.684 237.417 303.405 214.631 311.268 193.423L315.072 183.428C316.368 180.111 316.863 176.532 317.254 173.008Z'
      fill='#37474F'
    />
    <path
      d='M323.155 122.286C320.022 131.485 311.734 150.493 304.283 152.925C295.4 155.822 271.065 139.698 262.986 130.869C260.053 127.664 273.632 114.591 277.111 116.422C280.6 118.258 300.239 133.739 301.424 133.096C303.424 132.012 307.717 127.505 315.308 120.164C322.936 112.786 324.654 117.885 323.155 122.286Z'
      fill='#F7A9A0'
    />
    <path
      d='M270.432 135.547C272.95 135.971 282.258 122.491 281.059 120.158C279.978 118.055 277.982 111.522 278.217 106.366C278.407 102.035 279.184 95.6251 276.859 95.4362C273.469 95.1507 271.512 103.137 270.667 107.79C268.689 106.149 266.831 104.922 265.487 104.603C261.023 103.547 253.774 122.873 256.645 126.549C259.413 130.095 267.913 135.122 270.432 135.547Z'
      fill='#F7A9A0'
    />
    <path
      d='M263.834 121.407L267.708 123.312L276.085 106.283L272.211 104.378L263.834 121.407Z'
      fill='#C7C7C7'
    />
    <path
      d='M278.564 104.27C277.975 104.162 277.412 104.002 276.877 103.796C276.746 103.75 276.618 103.692 276.49 103.636C276.372 103.588 276.259 103.533 276.146 103.479C276.066 103.446 275.985 103.406 275.911 103.367L272.468 101.582C272.778 101.745 273.099 101.89 273.431 102.015C273.708 102.122 273.994 102.215 274.285 102.293C274.553 102.371 274.834 102.436 275.122 102.49C282.214 103.826 290.25 97.4558 293.061 88.2693C295.236 81.1885 293.676 74.5024 289.599 71.1956C289.094 70.7839 288.551 70.4254 287.966 70.123L291.412 71.9047C291.422 71.9071 291.428 71.9128 291.438 71.9208C291.586 71.994 291.732 72.0768 291.875 72.1628C292.002 72.2352 292.122 72.3075 292.24 72.3895C292.296 72.4249 292.351 72.4595 292.404 72.4981C292.496 72.5576 292.584 72.6211 292.67 72.687C292.72 72.7224 292.773 72.761 292.819 72.8004C295.387 74.7581 297.008 78.024 297.396 81.888C297.417 82.0866 297.434 82.2819 297.445 82.4789C297.609 84.8467 297.316 87.4219 296.507 90.0518C293.696 99.2383 285.66 105.608 278.564 104.27Z'
      fill='#37474F'
    />
    <path
      d='M265.146 83.0263C262.286 92.364 264.956 101.117 271.131 104.31L274.574 106.088C268.4 102.902 265.733 94.1456 268.588 84.8048C271.894 74.036 281.324 66.5604 289.646 68.1209C290.336 68.2536 290.997 68.4377 291.624 68.6797C292.014 68.8293 292.386 68.9973 292.752 69.1838L289.31 67.4054C288.943 67.2189 288.567 67.0484 288.177 66.8989C287.551 66.6569 286.889 66.4727 286.203 66.3425C277.877 64.7787 268.448 72.2551 265.146 83.0263Z'
      fill='#37474F'
    />
    <path
      d='M298.732 90.4639C301.605 81.0957 298.909 72.3104 292.684 69.1474C292.545 69.0767 292.404 69.0091 292.263 68.9472C292.224 68.9263 292.186 68.911 292.144 68.8934C291.971 68.8162 291.798 68.7454 291.622 68.6779C291.307 68.5605 290.988 68.4536 290.66 68.3595C290.328 68.2686 289.991 68.1842 289.647 68.1223C281.322 66.5601 271.893 74.0398 268.587 84.8053C267.564 88.1443 267.249 91.4086 267.551 94.3745C267.594 94.8304 267.656 95.2774 267.732 95.7212C267.805 96.1618 267.895 96.5944 267.999 97.0261C268.101 97.4458 268.218 97.8607 268.349 98.2651C268.413 98.4661 268.483 98.6663 268.556 98.8697C268.768 99.4614 269.017 100.031 269.293 100.573C269.293 100.573 269.29 100.577 269.293 100.58C269.473 100.94 269.67 101.292 269.879 101.631C270.823 103.169 272.022 104.462 273.451 105.421C273.553 105.495 273.654 105.563 273.765 105.627C273.938 105.738 274.117 105.843 274.298 105.944C274.312 105.955 274.328 105.963 274.341 105.968C274.778 106.21 275.232 106.419 275.704 106.599C276.335 106.84 276.993 107.028 277.679 107.155C286.007 108.718 295.436 101.244 298.732 90.4639ZM278.564 104.269C277.975 104.162 277.412 104.002 276.877 103.796C276.746 103.749 276.618 103.692 276.49 103.636C276.372 103.588 276.259 103.533 276.146 103.478C275.476 103.155 274.852 102.757 274.285 102.293C270.204 98.9895 268.645 92.3042 270.813 85.2234C273.628 76.0393 281.666 69.6724 288.765 71.0006C289.049 71.0529 289.33 71.1172 289.598 71.1952C289.889 71.274 290.171 71.3632 290.449 71.471C290.78 71.5956 291.102 71.7395 291.412 71.9035C291.422 71.9059 291.428 71.9116 291.438 71.9196C291.586 71.9928 291.732 72.0756 291.875 72.1616C292.002 72.234 292.122 72.3063 292.24 72.3883C292.296 72.4237 292.351 72.4583 292.404 72.4969C292.496 72.5564 292.584 72.6199 292.67 72.6858C292.72 72.7212 292.773 72.7598 292.819 72.7992C295.387 74.7569 297.008 78.0228 297.396 81.8868C297.417 82.0854 297.434 82.2808 297.445 82.4777C297.609 84.8455 297.316 87.4207 296.507 90.0506C293.696 99.2379 285.66 105.608 278.564 104.269Z'
      fill='#455A64'
    />
    <path
      opacity='0.4'
      d='M275.122 102.491C274.833 102.436 274.553 102.372 274.285 102.294C270.204 98.9902 268.645 92.305 270.813 85.2241C273.628 76.0401 281.666 69.6732 288.765 71.0014C289.049 71.0536 289.33 71.118 289.598 71.196C293.676 74.5028 295.235 81.1881 293.06 88.2697C290.25 97.4562 282.214 103.826 275.122 102.491Z'
      fill='white'
    />
    <g opacity='0.3'>
      <path
        d='M293.662 78.2785L273.075 80.1012C273.699 79.0439 274.395 78.0582 275.15 77.1497L292.819 75.5859C293.177 76.4229 293.463 77.325 293.662 78.2785Z'
        fill='#EBEBEB'
      />
      <path
        d='M290.87 72.4363L279.121 73.4766C282.147 71.3782 285.553 70.4013 288.765 71.0019C289.05 71.0542 289.331 71.1185 289.599 71.1965C290.053 71.5647 290.481 71.9804 290.87 72.4363Z'
        fill='#EBEBEB'
      />
      <path
        d='M293.981 80.421L271.889 82.3763C272.116 81.8818 272.353 81.3954 272.608 80.9291L293.814 79.0518C293.887 79.498 293.942 79.9522 293.981 80.421Z'
        fill='#EBEBEB'
      />
      <path
        d='M286.969 98.2148C286.375 98.7825 285.755 99.2994 285.115 99.7658L272.84 100.853C272.499 100.448 272.186 100.011 271.905 99.5487L286.969 98.2148Z'
        fill='#EBEBEB'
      />
      <path
        d='M290.826 93.3512L270.208 95.1763C269.83 93.4099 269.733 91.4763 269.945 89.4518L293.311 87.3799C293.236 87.6733 293.151 87.97 293.06 88.2683C292.506 90.087 291.745 91.7938 290.826 93.3512Z'
        fill='#EBEBEB'
      />
    </g>
    <path
      d='M257.04 132.697L262.898 135.578L270.325 120.48L264.467 117.599L257.04 132.697Z'
      fill='#0F2028'
    />
    <path
      d='M272.036 107.606C272.32 109.973 269.369 108.954 269.369 108.954C269.369 108.954 273.265 111.445 272.616 113.998C271.983 116.457 268.46 115.101 268.206 115.007C268.411 115.141 271.931 117.523 271.014 120.022C270.059 122.618 266.756 120.649 266.543 120.521C266.696 120.707 268.69 123.213 267.562 124.953C265.622 127.941 260.348 121.676 257.465 121.551C257.465 121.551 256.694 126.412 256.642 126.548C256.642 126.548 251.502 120.69 251.889 116.811C252.093 114.767 254.039 114.553 254.039 114.553C254.039 114.553 252.173 112.847 252.833 110.858C253.175 109.837 255.111 109.476 255.111 109.476C255.111 109.476 253.673 108.048 254.371 106.314C254.923 104.929 256.78 104.782 256.78 104.782C256.78 104.782 256.036 102.77 257.061 101.538C259.12 99.0485 271.421 102.539 272.036 107.606Z'
      fill='#F7A9A0'
    />
    <path
      d='M257.07 104.712C257.028 104.704 257.032 104.644 257.076 104.646C261.401 104.806 266.105 106.308 269.534 108.992C269.646 109.08 269.552 109.301 269.41 109.228C265.347 107.137 261.573 105.606 257.07 104.712Z'
      fill='#0F2028'
    />
    <path
      d='M255.057 109.432C255.008 109.423 255.023 109.341 255.076 109.344C259.533 109.534 264.784 111.371 268.372 114.93C268.495 115.052 268.483 115.285 268.331 115.155C265.765 112.97 259.115 110.217 255.057 109.432Z'
      fill='#0F2028'
    />
    <path
      d='M266.708 120.855C263.135 117.576 258.87 115.772 254.224 114.549C254.164 114.533 254.192 114.449 254.247 114.449C256.683 114.428 259.563 115.515 261.733 116.552C263.81 117.545 265.486 118.858 266.823 120.729C266.874 120.803 266.784 120.925 266.708 120.855Z'
      fill='#0F2028'
    />
    <path
      d='M269.447 108.932C269.582 109.038 269.279 109.118 269.41 109.228C269.963 109.691 273.054 112.762 272.335 114.14C271.756 115.243 269.872 115.229 269.151 114.941L267.336 114.215L268.788 115.528C269.422 116.101 270.011 116.795 270.421 117.539C270.831 118.281 271.044 119.129 270.778 119.85C270.516 120.609 269.886 121.088 269.096 121.032C268.313 121.009 267.463 120.643 266.762 120.202L264.801 118.97L266.245 120.768C266.635 121.255 266.992 121.825 267.247 122.403C267.498 122.981 267.656 123.608 267.547 124.163C267.443 124.709 267.038 125.204 266.521 125.327C265.979 125.464 265.322 125.296 264.718 125.076C263.487 124.611 262.34 123.876 261.167 123.203C260.581 122.862 259.994 122.518 259.389 122.202C258.786 121.901 258.152 121.576 257.464 121.55C258.14 121.647 258.719 122.03 259.296 122.366C259.869 122.723 260.424 123.107 260.982 123.493C262.098 124.263 263.23 125.027 264.51 125.595C265.154 125.854 265.86 126.112 266.663 125.965C267.492 125.807 268.091 125.079 268.243 124.307C268.403 123.52 268.198 122.771 267.93 122.112C267.645 121.447 267.288 120.852 266.84 120.275L266.323 120.84C267.148 121.368 268.022 121.784 269.07 121.848C269.585 121.877 270.162 121.74 270.609 121.401C271.06 121.062 271.347 120.602 271.519 120.105C271.871 119.071 271.538 117.998 271.066 117.179C270.579 116.336 269.961 115.631 269.236 114.995L268.874 115.582C269.803 115.918 271.907 116.162 273.021 114.564C274.162 112.265 270.207 109.404 269.447 108.932Z'
      fill='#0F2028'
    />
    <path
      d='M269.369 108.954C269.886 109.013 270.394 109.021 270.831 108.931C271.27 108.845 271.59 108.581 271.708 108.231C271.835 107.882 271.754 107.411 271.627 106.954C271.485 106.495 271.313 106.02 271.115 105.536C271.523 105.867 271.865 106.278 272.111 106.759C272.349 107.233 272.534 107.816 272.338 108.45C272.218 108.756 272.02 109.017 271.753 109.197C271.481 109.367 271.176 109.445 270.889 109.447C270.314 109.46 269.798 109.252 269.369 108.954Z'
      fill='#0F2028'
    />
    <path
      d='M283.258 119.117L266.676 138.505C266.676 138.505 292.156 158.402 304.854 154C307.778 152.987 317.981 141.113 323.511 123.61C325.096 118.594 323.664 109.446 313.677 120.019C303.689 130.591 301.545 132.294 301.102 132.309C300.659 132.323 283.258 119.117 283.258 119.117Z'
      fill='#D2F801'
    />
    <path
      opacity='0.1'
      d='M275.177 129.797C274.373 129.878 273.778 130.601 273.858 131.413C273.939 132.226 274.662 132.821 275.475 132.74C276.287 132.66 276.882 131.936 276.801 131.124C276.721 130.312 275.989 129.717 275.177 129.797ZM275.418 132.161C274.92 132.218 274.478 131.848 274.429 131.357C274.381 130.867 274.743 130.425 275.241 130.376C275.732 130.32 276.174 130.682 276.222 131.18C276.27 131.671 275.909 132.113 275.418 132.161ZM286.192 128.704C285.38 128.784 284.785 129.508 284.865 130.32C284.946 131.132 285.677 131.727 286.489 131.647C287.293 131.566 287.888 130.835 287.808 130.023C287.727 129.219 287.004 128.624 286.192 128.704ZM286.425 131.068C285.935 131.116 285.492 130.754 285.444 130.264C285.396 129.765 285.758 129.323 286.248 129.275C286.747 129.227 287.189 129.588 287.237 130.087C287.285 130.577 286.923 131.02 286.425 131.068ZM297.665 129.918C297.593 129.95 297.52 129.966 297.44 129.974C296.949 130.023 296.507 129.661 296.459 129.17C296.451 129.122 296.451 129.074 296.459 129.026C296.29 128.905 296.121 128.776 295.944 128.648C295.88 128.825 295.864 129.026 295.88 129.227C295.96 130.039 296.684 130.626 297.496 130.545C297.753 130.521 297.978 130.433 298.179 130.296C298.011 130.175 297.842 130.047 297.665 129.918ZM308.221 126.509C307.409 126.59 306.814 127.313 306.895 128.125C306.975 128.937 307.699 129.532 308.511 129.452C309.323 129.371 309.918 128.648 309.837 127.836C309.757 127.024 309.033 126.429 308.221 126.509ZM308.455 128.881C307.964 128.929 307.522 128.567 307.466 128.069C307.417 127.578 307.779 127.136 308.278 127.088C308.768 127.04 309.21 127.402 309.259 127.892C309.307 128.39 308.945 128.833 308.455 128.881ZM319.228 125.416C318.424 125.496 317.829 126.22 317.91 127.032C317.99 127.844 318.714 128.439 319.526 128.358C320.338 128.278 320.933 127.554 320.852 126.742C320.772 125.93 320.04 125.335 319.228 125.416ZM319.469 127.779C318.971 127.828 318.529 127.466 318.48 126.975C318.432 126.485 318.794 126.043 319.293 125.995C319.783 125.938 320.225 126.3 320.273 126.799C320.322 127.289 319.96 127.731 319.469 127.779ZM281.328 121.372L280.861 121.926C280.845 122.336 280.54 122.682 280.138 122.77L279.655 123.333C279.792 123.365 279.945 123.373 280.098 123.357C280.91 123.277 281.505 122.553 281.424 121.741C281.408 121.613 281.384 121.484 281.328 121.372ZM323.94 118.405C323.514 118.381 323.16 118.035 323.112 117.601C323.079 117.279 323.224 116.982 323.457 116.797C323.385 116.612 323.288 116.443 323.184 116.282C322.742 116.572 322.476 117.094 322.533 117.657C322.605 118.421 323.264 118.984 324.012 118.984C323.996 118.783 323.972 118.59 323.94 118.405ZM270.602 139.671C270.064 139.719 269.613 140.057 269.412 140.523C269.565 140.635 269.726 140.748 269.895 140.869C269.999 140.539 270.297 140.282 270.659 140.241C271.149 140.193 271.591 140.555 271.639 141.053C271.68 141.375 271.535 141.673 271.294 141.849C271.455 141.954 271.623 142.066 271.792 142.179C272.098 141.882 272.267 141.447 272.218 140.997C272.138 140.185 271.414 139.59 270.602 139.671ZM288.001 146.858C287.189 146.939 286.594 147.662 286.674 148.474C286.755 149.286 287.478 149.881 288.29 149.801C289.102 149.721 289.697 148.989 289.617 148.177C289.536 147.373 288.813 146.778 288.001 146.858ZM288.234 149.222C287.744 149.27 287.301 148.909 287.253 148.418C287.197 147.92 287.559 147.477 288.057 147.429C288.548 147.381 288.99 147.743 289.038 148.241C289.086 148.732 288.724 149.174 288.234 149.222ZM299.016 145.757C298.204 145.845 297.609 146.569 297.689 147.381C297.769 148.193 298.493 148.78 299.305 148.699C300.117 148.619 300.712 147.896 300.632 147.083C300.551 146.271 299.82 145.676 299.016 145.757ZM299.249 148.129C298.75 148.177 298.308 147.815 298.26 147.317C298.212 146.826 298.573 146.384 299.072 146.336C299.562 146.287 300.005 146.649 300.053 147.14C300.101 147.638 299.739 148.08 299.249 148.129ZM310.022 144.663C309.21 144.744 308.623 145.467 308.704 146.279C308.784 147.092 309.508 147.686 310.32 147.606C311.132 147.526 311.719 146.802 311.638 145.99C311.558 145.178 310.834 144.583 310.022 144.663ZM310.264 147.035C309.765 147.083 309.323 146.722 309.275 146.223C309.226 145.733 309.588 145.291 310.079 145.242C310.577 145.194 311.019 145.556 311.068 146.046C311.116 146.537 310.754 146.979 310.264 147.035ZM281.617 138.577C280.805 138.658 280.21 139.381 280.29 140.193C280.371 141.005 281.094 141.592 281.907 141.512C282.719 141.431 283.314 140.708 283.233 139.896C283.153 139.084 282.429 138.497 281.617 138.577ZM281.85 140.941C281.352 140.989 280.918 140.627 280.861 140.137C280.813 139.638 281.175 139.196 281.673 139.148C282.164 139.1 282.606 139.462 282.654 139.952C282.702 140.45 282.341 140.893 281.85 140.941ZM292.624 137.476C291.82 137.556 291.225 138.288 291.305 139.092C291.386 139.904 292.109 140.499 292.921 140.418C293.733 140.338 294.328 139.614 294.248 138.802C294.168 137.99 293.436 137.395 292.624 137.476ZM292.865 139.847C292.367 139.896 291.924 139.534 291.876 139.035C291.828 138.545 292.19 138.103 292.688 138.055C293.179 138.006 293.621 138.368 293.669 138.859C293.717 139.357 293.355 139.799 292.865 139.847ZM303.639 136.382C302.827 136.463 302.232 137.186 302.312 137.998C302.392 138.81 303.124 139.405 303.936 139.325C304.74 139.244 305.335 138.521 305.255 137.709C305.174 136.897 304.451 136.302 303.639 136.382ZM303.872 138.746C303.381 138.794 302.939 138.432 302.891 137.942C302.843 137.452 303.204 137.009 303.695 136.961C304.193 136.905 304.636 137.267 304.684 137.765C304.732 138.256 304.37 138.698 303.872 138.746ZM314.653 135.289C313.841 135.369 313.246 136.093 313.327 136.905C313.407 137.717 314.131 138.312 314.943 138.231C315.755 138.151 316.35 137.419 316.269 136.607C316.189 135.803 315.465 135.208 314.653 135.289ZM314.887 137.653C314.396 137.701 313.954 137.339 313.906 136.849C313.857 136.35 314.219 135.908 314.71 135.86C315.2 135.811 315.642 136.173 315.699 136.672C315.747 137.162 315.385 137.604 314.887 137.653Z'
      fill='black'
    />
    <path
      d='M272.542 140.906C273.621 139.309 274.933 137.852 276.165 136.371C277.379 134.911 278.603 133.459 279.836 132.015C282.325 129.101 284.762 126.106 287.436 123.359C287.499 123.295 287.6 123.371 287.547 123.447C285.338 126.618 282.79 129.572 280.301 132.525C279.052 134.006 277.781 135.468 276.494 136.915C275.254 138.308 274.035 139.765 272.646 141.011C272.579 141.071 272.498 140.972 272.542 140.906Z'
      fill='#0F2028'
    />
    <path
      opacity='0.1'
      d='M323.512 123.607C317.98 141.115 307.78 152.986 304.853 153.999C301.902 155.021 297.807 154.752 293.397 153.395C301.554 141.83 314.652 123.354 320.707 115.155C324.264 114.766 324.6 120.16 323.512 123.607Z'
      fill='black'
    />
    <path
      d='M317.033 126.219C319.413 126.402 324.507 122.108 326.559 118.417C326.698 118.163 326.327 115.483 326.029 112.206C325.856 110.216 325.71 107.997 325.723 105.962L312.94 108.979C312.94 108.979 314.167 113.253 314.122 116.801C314.115 117.097 314.084 117.373 314.029 117.635C314.024 117.674 314.013 117.72 314.01 117.773C313.74 119.357 313.308 125.933 317.033 126.219Z'
      fill='#F7A9A0'
    />
    <path
      d='M314.011 117.77C314.407 117.831 314.846 117.859 315.321 117.848C322.405 117.738 324.416 109.167 324.913 106.153L312.939 108.982C312.939 108.982 314.165 113.253 314.123 116.802C314.116 117.096 314.086 117.372 314.026 117.631C314.026 117.672 314.012 117.722 314.011 117.77Z'
      fill='#0F2028'
    />
    <path
      d='M326.065 88.7147C327.953 93.0531 327.073 106.313 324.208 109.577C320.056 114.308 312.512 115.582 308.304 110.42C304.226 105.415 305.679 88.1544 308.948 85.112C313.763 80.6313 323.275 82.3069 326.065 88.7147Z'
      fill='#F7A9A0'
    />
    <path
      d='M326.796 100.849C326.378 104.632 325.496 108.113 324.207 109.575C320.057 114.307 312.514 115.581 308.303 110.421C305.448 106.917 305.305 97.4099 306.597 90.9763C306.597 90.9763 306.597 90.9699 306.602 90.9619C307.156 88.2138 307.97 86.0205 308.947 85.1111C313.765 80.6345 323.276 82.306 326.068 88.7155C327.11 91.109 327.308 96.2088 326.796 100.849Z'
      fill='#F7A9A0'
    />
    <path
      d='M315.915 97.7361C315.925 97.7031 315.98 97.786 315.975 97.8221C315.853 98.709 315.863 99.7461 316.637 100.126C316.661 100.138 316.654 100.183 316.624 100.175C315.655 99.9334 315.657 98.557 315.915 97.7361Z'
      fill='#0F2028'
    />
    <path
      d='M316.807 96.89C318.251 96.9318 318.06 99.8157 316.723 99.7763C315.407 99.7377 315.597 96.8546 316.807 96.89Z'
      fill='#0F2028'
    />
    <path
      d='M310.726 97.1751C310.722 97.1406 310.654 97.2129 310.652 97.2491C310.621 98.144 310.436 99.1642 309.608 99.4078C309.583 99.4151 309.583 99.4601 309.612 99.4577C310.607 99.3845 310.84 98.0274 310.726 97.1751Z'
      fill='#0F2028'
    />
    <path
      d='M309.989 96.1891C308.56 95.9849 308.258 98.8592 309.582 99.0473C310.885 99.2338 311.188 96.3595 309.989 96.1891Z'
      fill='#0F2028'
    />
    <path
      d='M317.998 95.721C317.612 95.5964 317.277 95.4171 316.907 95.2539C316.491 95.0698 316.14 94.9669 315.886 94.5657C315.749 94.3502 315.836 93.986 316.033 93.834C316.491 93.4795 317.057 93.5776 317.567 93.7786C318.121 93.9964 318.493 94.306 318.784 94.8238C319.066 95.3255 318.507 95.885 317.998 95.721Z'
      fill='#0F2028'
    />
    <path
      d='M309.039 94.8459C309.444 94.8073 309.809 94.7044 310.205 94.624C310.652 94.5339 311.016 94.5082 311.351 94.1713C311.531 93.9904 311.523 93.6166 311.364 93.4252C310.994 92.9806 310.42 92.9549 309.878 93.0417C309.29 93.135 308.861 93.3577 308.465 93.8007C308.082 94.2308 308.507 94.8973 309.039 94.8459Z'
      fill='#0F2028'
    />
    <path
      d='M316.046 105.926C315.818 106.122 315.585 106.395 315.26 106.401C314.947 106.407 314.591 106.243 314.314 106.113C314.287 106.1 314.256 106.128 314.272 106.156C314.481 106.515 314.956 106.762 315.374 106.716C315.783 106.671 316.006 106.335 316.129 105.972C316.146 105.921 316.079 105.898 316.046 105.926Z'
      fill='#0F2028'
    />
    <path
      d='M315.284 103.191C314.732 103.933 313.969 104.308 313.164 104.41C312.805 104.457 312.43 104.445 312.067 104.387C311.995 104.381 311.924 104.368 311.86 104.349C311.795 104.337 311.737 104.326 311.666 104.307C311.563 104.285 311.511 104.195 311.5 104.095L311.501 104.089C311.504 104.056 311.506 104.03 311.515 103.998C311.515 103.998 311.515 103.998 311.516 103.992L311.523 103.914C311.55 103.225 311.686 102.183 311.686 102.183C311.426 102.293 310.107 102.785 310.151 102.426C310.525 99.4635 310.941 96.1688 311.939 93.3001C311.967 93.2036 312.116 93.2366 312.101 93.3338C311.854 96.1953 311.105 98.994 310.812 101.864C311.231 101.736 311.917 101.493 312.276 101.523C312.372 101.558 311.978 103.532 311.991 103.842C311.991 103.842 311.99 103.855 311.995 103.875C313.14 104.099 314.034 103.808 315.207 103.106C315.275 103.059 315.342 103.123 315.284 103.191Z'
      fill='#0F2028'
    />
    <path
      d='M312.495 104.066C312.495 104.066 313.051 104.928 313.866 105.281C314.166 105.411 314.495 105.477 314.848 105.407C315.574 105.267 315.634 104.613 315.541 104.045C315.465 103.577 315.278 103.166 315.278 103.166C315.278 103.166 314.172 104.072 312.495 104.066Z'
      fill='#0F2028'
    />
    <path
      d='M313.866 105.281C314.166 105.411 314.495 105.477 314.848 105.407C315.574 105.267 315.634 104.613 315.541 104.045C314.772 104.073 313.98 104.542 313.866 105.281Z'
      fill='#FF9ABB'
    />
    <path
      d='M326.796 100.848C326.67 100.968 323.779 99.7767 323.383 93.0021C323.191 89.7106 321.984 86.5637 319.244 86.661C316.503 86.7519 314.62 88.8439 312.515 88.5681C310.416 88.2923 310.149 85.9294 309.073 86.4745C307.702 87.1683 306.668 90.7485 306.602 90.9616C307.156 88.2135 307.97 86.0202 308.947 85.1109C313.765 80.6342 324.498 81.0258 327.29 87.4352C328.333 89.8296 327.917 97.9556 326.796 100.848Z'
      fill='#0F2028'
    />
    <path
      d='M316.438 102.685C314.308 102.275 312.908 100.208 313.317 98.0776C313.727 95.947 315.794 94.5464 317.925 94.9573C320.056 95.3673 321.455 97.4336 321.046 99.565C320.7 101.367 319.167 102.646 317.414 102.75C317.095 102.769 316.768 102.749 316.438 102.685ZM313.834 98.1765C313.48 100.022 314.692 101.813 316.538 102.168C318.382 102.525 320.174 101.31 320.53 99.4645C320.884 97.6185 319.671 95.8272 317.825 95.4727C317.541 95.418 317.257 95.4003 316.979 95.4164C315.461 95.508 314.135 96.6159 313.834 98.1765Z'
      fill='#455A64'
    />
    <path
      d='M308.143 102.182C306.531 102.089 305.321 100.25 305.446 98.0838C305.506 97.0498 305.856 96.0915 306.434 95.3856C307.032 94.6555 307.797 94.2768 308.598 94.3243C309.395 94.3701 310.115 94.8332 310.625 95.6276C311.117 96.3954 311.356 97.3875 311.296 98.4223C311.178 100.472 309.905 102.093 308.402 102.182C308.316 102.187 308.23 102.187 308.143 102.182ZM306.842 95.7184C306.334 96.3391 306.025 97.1905 305.971 98.1143C305.863 99.9909 306.851 101.58 308.174 101.656C309.501 101.734 310.662 100.267 310.771 98.3909C310.824 97.4671 310.614 96.5859 310.182 95.9106C309.765 95.2617 309.191 94.8847 308.566 94.8493C308.5 94.8453 308.433 94.8453 308.367 94.8493C307.812 94.8831 307.278 95.1862 306.842 95.7184Z'
      fill='#455A64'
    />
    <path
      d='M313.423 98.5393L313.784 98.1566C313.218 97.622 311.878 96.8694 310.859 97.8407L311.223 98.2209C312.134 97.3494 313.371 98.4911 313.423 98.5393Z'
      fill='#455A64'
    />
    <path
      d='M330.869 100.561L331.35 100.347C331.25 100.123 330.34 98.1507 329.179 97.8926C328.092 97.6546 321.014 97.9079 320.713 97.9191L320.732 98.4449C322.762 98.3702 328.226 98.2198 329.064 98.4064C329.831 98.576 330.627 100.019 330.869 100.561Z'
      fill='#455A64'
    />
    <path
      d='M324.506 99.619C324.506 99.619 327.05 95.1319 329.06 96.0002C331.069 96.8685 329.433 103.179 327.271 104.226C325.108 105.273 324.1 103.289 324.1 103.289L324.506 99.619Z'
      fill='#F7A9A0'
    />
    <path
      d='M328.546 97.7974C328.581 97.791 328.593 97.8409 328.563 97.8561C327.052 98.6416 326.362 100.178 325.926 101.744C326.338 101.118 326.944 100.739 327.776 101.222C327.82 101.247 327.787 101.315 327.742 101.31C327.085 101.233 326.631 101.389 326.245 101.945C325.971 102.34 325.805 102.822 325.624 103.264C325.564 103.411 325.303 103.36 325.341 103.193C325.344 103.181 325.347 103.168 325.351 103.155C325.12 101.156 326.413 98.2035 328.546 97.7974Z'
      fill='#0F2028'
    />
    <path
      d='M312.365 124.301L312.453 117.341L326.41 111.588L327.916 116.517C327.916 116.517 326.212 120.982 322.744 124.159C319.276 127.338 315.15 127.481 312.365 124.301Z'
      fill='#EBEBEB'
    />
    <path
      d='M359.927 181.752C359.817 181.915 306.024 186.946 305.437 186.439C304.616 185.725 305.522 133.871 313.006 120.554C314.878 117.224 323.549 113.878 327.558 116.093C341.583 123.837 360.318 181.164 359.927 181.752Z'
      fill='#D2F801'
    />
    <path
      d='M359.927 181.752C359.814 181.913 306.027 186.946 305.44 186.44C305.022 186.078 305.054 172.426 306.171 157.367C306.187 157.126 306.204 156.885 306.228 156.644C306.252 156.266 306.284 155.88 306.316 155.494C306.316 155.486 306.316 155.486 306.316 155.486C306.332 155.245 306.356 154.995 306.372 154.746C307.506 141.014 309.556 126.695 313.005 120.552C313.102 120.383 313.214 120.206 313.351 120.037H313.359C313.641 119.66 314.002 119.29 314.436 118.928C317.604 116.275 324.205 114.241 327.558 116.09C334.4 119.869 342.367 135.466 348.695 150.501C348.775 150.694 348.856 150.895 348.936 151.088C349.129 151.57 349.33 152.045 349.531 152.519C349.611 152.712 349.684 152.905 349.772 153.098C353.623 162.513 356.759 171.421 358.488 176.736C358.729 177.491 358.946 178.167 359.131 178.77C359.694 180.595 359.983 181.672 359.927 181.752Z'
      fill='#D2F801'
    />
    <path
      opacity='0.1'
      d='M319.228 125.416C318.424 125.497 317.829 126.22 317.91 127.032C317.99 127.844 318.714 128.439 319.526 128.359C320.338 128.279 320.933 127.555 320.852 126.743C320.772 125.931 320.04 125.336 319.228 125.416ZM319.469 127.78C318.971 127.828 318.529 127.467 318.48 126.976C318.432 126.486 318.794 126.043 319.293 125.995C319.783 125.939 320.225 126.301 320.273 126.799C320.322 127.29 319.96 127.732 319.469 127.78ZM330.243 124.323C329.431 124.403 328.836 125.127 328.916 125.939C328.997 126.751 329.728 127.346 330.54 127.266C331.353 127.185 331.939 126.453 331.859 125.641C331.779 124.837 331.055 124.242 330.243 124.323ZM330.484 126.687C329.986 126.735 329.544 126.373 329.495 125.883C329.447 125.384 329.809 124.942 330.299 124.894C330.798 124.845 331.24 125.207 331.288 125.706C331.336 126.196 330.975 126.638 330.484 126.687ZM313.359 120.038C313.906 119.901 314.316 119.459 314.436 118.928C314.002 119.29 313.64 119.66 313.359 120.038ZM323.859 116.034C323.047 116.122 322.452 116.846 322.533 117.658C322.613 118.47 323.345 119.057 324.149 118.976C324.961 118.896 325.556 118.172 325.475 117.36C325.395 116.548 324.671 115.953 323.859 116.034ZM324.092 118.405C323.602 118.454 323.16 118.092 323.112 117.601C323.063 117.103 323.425 116.661 323.916 116.613C324.414 116.564 324.856 116.926 324.904 117.417C324.953 117.915 324.591 118.357 324.092 118.405ZM310.022 144.664C309.21 144.744 308.623 145.468 308.704 146.28C308.784 147.092 309.508 147.687 310.32 147.607C311.132 147.526 311.719 146.803 311.638 145.991C311.558 145.179 310.834 144.584 310.022 144.664ZM310.264 147.036C309.765 147.084 309.323 146.722 309.275 146.224C309.226 145.733 309.588 145.291 310.079 145.243C310.577 145.195 311.019 145.557 311.068 146.047C311.116 146.537 310.754 146.98 310.264 147.036ZM321.037 143.571C320.225 143.651 319.63 144.375 319.711 145.187C319.791 145.999 320.523 146.594 321.327 146.513C322.139 146.433 322.734 145.709 322.653 144.897C322.573 144.085 321.849 143.49 321.037 143.571ZM321.27 145.934C320.78 145.983 320.338 145.621 320.289 145.13C320.241 144.64 320.603 144.198 321.093 144.141C321.592 144.093 322.034 144.455 322.082 144.954C322.131 145.444 321.769 145.886 321.27 145.934ZM332.052 142.477C331.24 142.558 330.645 143.281 330.725 144.093C330.806 144.905 331.529 145.5 332.341 145.42C333.153 145.339 333.748 144.608 333.668 143.796C333.588 142.992 332.864 142.397 332.052 142.477ZM332.285 144.841C331.795 144.889 331.353 144.527 331.304 144.037C331.248 143.538 331.618 143.096 332.108 143.048C332.599 143 333.041 143.362 333.089 143.86C333.145 144.351 332.784 144.793 332.285 144.841ZM343.067 141.376C342.255 141.456 341.66 142.188 341.74 143C341.821 143.804 342.544 144.399 343.356 144.318C344.168 144.238 344.763 143.514 344.683 142.702C344.602 141.89 343.871 141.295 343.067 141.376ZM343.3 143.748C342.801 143.796 342.359 143.434 342.311 142.935C342.263 142.445 342.625 142.003 343.123 141.955C343.614 141.906 344.056 142.268 344.104 142.759C344.152 143.257 343.79 143.699 343.3 143.748ZM314.653 135.289C313.841 135.37 313.246 136.093 313.327 136.905C313.407 137.718 314.131 138.312 314.943 138.232C315.755 138.152 316.35 137.42 316.269 136.608C316.189 135.804 315.465 135.209 314.653 135.289ZM314.887 137.653C314.396 137.701 313.954 137.34 313.906 136.849C313.857 136.351 314.219 135.909 314.71 135.86C315.2 135.812 315.642 136.174 315.699 136.672C315.747 137.163 315.385 137.605 314.887 137.653ZM325.668 134.188C324.856 134.276 324.261 135 324.342 135.812C324.422 136.624 325.146 137.211 325.958 137.131C326.77 137.05 327.365 136.327 327.284 135.515C327.204 134.703 326.48 134.108 325.668 134.188ZM325.901 136.56C325.411 136.608 324.969 136.246 324.912 135.756C324.864 135.257 325.226 134.815 325.725 134.767C326.215 134.719 326.657 135.08 326.705 135.571C326.754 136.069 326.392 136.512 325.901 136.56ZM336.675 133.095C335.871 133.175 335.276 133.899 335.356 134.711C335.437 135.523 336.16 136.118 336.972 136.037C337.785 135.957 338.379 135.233 338.299 134.421C338.219 133.609 337.487 133.014 336.675 133.095ZM336.916 135.466C336.418 135.515 335.976 135.153 335.927 134.654C335.879 134.164 336.241 133.722 336.739 133.673C337.23 133.625 337.672 133.987 337.72 134.477C337.768 134.976 337.407 135.41 336.916 135.466ZM311.831 162.818C311.019 162.899 310.424 163.622 310.505 164.434C310.585 165.246 311.309 165.841 312.121 165.761C312.933 165.681 313.528 164.957 313.447 164.145C313.367 163.333 312.643 162.738 311.831 162.818ZM312.065 165.19C311.574 165.238 311.132 164.877 311.084 164.378C311.035 163.888 311.397 163.446 311.888 163.397C312.378 163.349 312.82 163.711 312.877 164.201C312.925 164.692 312.563 165.134 312.065 165.19ZM322.846 161.725C322.034 161.805 321.439 162.529 321.52 163.341C321.6 164.153 322.324 164.748 323.136 164.668C323.948 164.587 324.543 163.864 324.462 163.052C324.382 162.24 323.658 161.645 322.846 161.725ZM323.079 164.089C322.589 164.137 322.147 163.775 322.09 163.285C322.042 162.794 322.404 162.352 322.902 162.296C323.393 162.248 323.835 162.609 323.883 163.108C323.932 163.598 323.57 164.04 323.079 164.089ZM333.853 160.632C333.049 160.712 332.454 161.436 332.534 162.248C332.615 163.06 333.338 163.655 334.15 163.574C334.962 163.494 335.557 162.762 335.477 161.95C335.397 161.138 334.665 160.551 333.853 160.632ZM334.094 162.995C333.596 163.044 333.153 162.682 333.105 162.191C333.057 161.693 333.419 161.251 333.917 161.202C334.408 161.154 334.85 161.516 334.898 162.014C334.946 162.505 334.585 162.947 334.094 162.995ZM344.868 159.53C344.056 159.61 343.461 160.342 343.541 161.154C343.622 161.958 344.353 162.553 345.165 162.473C345.977 162.392 346.564 161.669 346.484 160.857C346.403 160.045 345.68 159.45 344.868 159.53ZM345.101 161.902C344.611 161.95 344.168 161.588 344.12 161.09C344.072 160.599 344.434 160.157 344.924 160.109C345.423 160.061 345.865 160.422 345.913 160.913C345.961 161.411 345.599 161.854 345.101 161.902ZM306.372 154.746C306.356 154.995 306.332 155.245 306.316 155.486C306.316 155.486 306.316 155.486 306.316 155.494C306.412 155.615 306.469 155.759 306.485 155.92C306.517 156.193 306.412 156.459 306.228 156.644C306.203 156.885 306.187 157.126 306.171 157.367C306.75 157.126 307.128 156.523 307.064 155.864C307.015 155.389 306.75 154.987 306.372 154.746ZM316.462 153.444C315.65 153.524 315.055 154.248 315.136 155.06C315.216 155.872 315.94 156.467 316.752 156.386C317.564 156.306 318.159 155.574 318.078 154.762C317.998 153.958 317.266 153.363 316.462 153.444ZM316.696 155.808C316.197 155.856 315.755 155.494 315.707 155.004C315.658 154.505 316.02 154.063 316.519 154.015C317.009 153.966 317.451 154.328 317.5 154.827C317.548 155.317 317.186 155.759 316.696 155.808ZM327.469 152.342C326.657 152.431 326.07 153.154 326.151 153.966C326.231 154.778 326.955 155.365 327.767 155.285C328.579 155.205 329.166 154.481 329.085 153.669C329.005 152.857 328.281 152.262 327.469 152.342ZM327.71 154.714C327.212 154.762 326.77 154.401 326.721 153.902C326.673 153.412 327.035 152.969 327.525 152.921C328.024 152.873 328.466 153.235 328.514 153.725C328.563 154.224 328.201 154.666 327.71 154.714ZM338.484 151.249C337.672 151.329 337.077 152.053 337.157 152.865C337.238 153.677 337.969 154.272 338.773 154.191C339.585 154.111 340.18 153.387 340.1 152.575C340.02 151.763 339.296 151.168 338.484 151.249ZM338.717 153.621C338.227 153.669 337.785 153.307 337.736 152.809C337.688 152.318 338.05 151.876 338.54 151.828C339.039 151.779 339.481 152.141 339.529 152.632C339.577 153.122 339.216 153.572 338.717 153.621ZM349.531 152.519C349.129 152.471 348.791 152.133 348.751 151.715C348.727 151.482 348.799 151.257 348.936 151.088C348.856 150.895 348.775 150.694 348.695 150.501C348.333 150.799 348.124 151.265 348.172 151.771C348.253 152.575 348.968 153.17 349.772 153.098C349.684 152.905 349.611 152.712 349.531 152.519ZM313.64 180.973C312.828 181.053 312.233 181.777 312.314 182.589C312.394 183.401 313.118 183.996 313.93 183.915C314.742 183.835 315.337 183.111 315.256 182.299C315.176 181.487 314.444 180.892 313.64 180.973ZM313.874 183.345C313.375 183.393 312.933 183.031 312.885 182.532C312.836 182.042 313.198 181.6 313.697 181.552C314.187 181.503 314.629 181.865 314.678 182.356C314.726 182.854 314.364 183.288 313.874 183.345ZM324.647 179.879C323.835 179.96 323.248 180.683 323.329 181.495C323.409 182.307 324.133 182.902 324.945 182.822C325.757 182.742 326.352 182.018 326.271 181.206C326.183 180.394 325.459 179.799 324.647 179.879ZM324.888 182.243C324.39 182.291 323.948 181.929 323.899 181.439C323.851 180.949 324.213 180.506 324.703 180.45C325.202 180.402 325.644 180.764 325.692 181.262C325.741 181.753 325.379 182.195 324.888 182.243ZM335.662 178.786C334.85 178.866 334.255 179.59 334.335 180.402C334.416 181.214 335.147 181.809 335.959 181.728C336.763 181.648 337.358 180.916 337.278 180.104C337.198 179.3 336.474 178.705 335.662 178.786ZM335.895 181.15C335.405 181.198 334.962 180.836 334.914 180.346C334.866 179.847 335.228 179.405 335.718 179.357C336.217 179.308 336.659 179.67 336.707 180.169C336.755 180.659 336.394 181.101 335.895 181.15ZM346.677 177.684C345.865 177.765 345.27 178.496 345.35 179.308C345.431 180.112 346.154 180.707 346.966 180.627C347.778 180.547 348.373 179.823 348.293 179.011C348.212 178.199 347.489 177.604 346.677 177.684ZM346.91 180.056C346.42 180.104 345.977 179.743 345.929 179.244C345.881 178.754 346.243 178.311 346.733 178.263C347.223 178.215 347.666 178.577 347.714 179.067C347.77 179.566 347.408 180.008 346.91 180.056ZM358.488 176.736C358.246 176.615 357.973 176.559 357.692 176.591C356.88 176.671 356.285 177.395 356.365 178.207C356.445 179.019 357.169 179.614 357.981 179.534C358.488 179.485 358.906 179.188 359.131 178.77C358.946 178.167 358.729 177.491 358.488 176.736ZM357.925 178.963C357.426 179.011 356.984 178.649 356.936 178.151C356.888 177.66 357.249 177.218 357.748 177.17C358.238 177.122 358.68 177.483 358.729 177.974C358.777 178.464 358.415 178.906 357.925 178.963ZM307.249 172.692C306.437 172.772 305.85 173.496 305.93 174.308C306.01 175.12 306.734 175.715 307.546 175.634C308.358 175.554 308.953 174.83 308.873 174.018C308.792 173.206 308.061 172.611 307.249 172.692ZM307.49 175.055C306.991 175.112 306.549 174.742 306.501 174.251C306.453 173.761 306.814 173.319 307.313 173.27C307.803 173.214 308.246 173.576 308.294 174.074C308.342 174.565 307.98 175.007 307.49 175.055ZM318.263 171.598C317.451 171.678 316.856 172.402 316.937 173.214C317.017 174.026 317.749 174.621 318.561 174.541C319.373 174.46 319.96 173.729 319.879 172.917C319.799 172.113 319.075 171.518 318.263 171.598ZM318.497 173.962C318.006 174.01 317.564 173.648 317.516 173.158C317.467 172.659 317.829 172.217 318.32 172.169C318.818 172.121 319.26 172.482 319.309 172.981C319.357 173.471 318.995 173.914 318.497 173.962ZM329.278 170.497C328.466 170.577 327.871 171.309 327.952 172.121C328.032 172.933 328.756 173.52 329.568 173.439C330.38 173.359 330.975 172.635 330.894 171.823C330.814 171.011 330.09 170.416 329.278 170.497ZM329.511 172.868C329.021 172.917 328.579 172.555 328.53 172.056C328.482 171.566 328.844 171.124 329.334 171.075C329.825 171.027 330.267 171.389 330.323 171.879C330.372 172.378 330.01 172.82 329.511 172.868ZM340.293 169.403C339.481 169.484 338.886 170.207 338.966 171.019C339.047 171.831 339.77 172.426 340.582 172.346C341.394 172.265 341.989 171.542 341.909 170.73C341.829 169.918 341.105 169.323 340.293 169.403ZM340.526 171.775C340.036 171.823 339.594 171.461 339.537 170.963C339.489 170.472 339.851 170.03 340.349 169.982C340.84 169.934 341.282 170.296 341.33 170.786C341.378 171.276 341.017 171.719 340.526 171.775ZM351.3 168.31C350.496 168.39 349.901 169.114 349.981 169.926C350.062 170.738 350.785 171.333 351.597 171.252C352.409 171.172 353.004 170.448 352.924 169.636C352.843 168.824 352.112 168.229 351.3 168.31ZM351.541 170.673C351.042 170.722 350.6 170.36 350.552 169.869C350.504 169.379 350.866 168.937 351.364 168.881C351.855 168.832 352.297 169.194 352.345 169.693C352.393 170.183 352.031 170.625 351.541 170.673Z'
      fill='black'
    />
    <path
      d='M314.438 125.335C312.286 129.687 297.019 163.739 297.559 166.767C298.414 171.561 304.132 183.523 313.062 178.562C319.639 174.908 324.757 139.182 323.472 126.097C322.88 120.088 318.953 116.204 314.438 125.335Z'
      fill='#D2F801'
    />
    <path
      opacity='0.1'
      d='M319.228 125.416C318.424 125.497 317.829 126.22 317.91 127.032C317.99 127.845 318.714 128.439 319.526 128.359C320.338 128.279 320.933 127.555 320.852 126.743C320.772 125.931 320.04 125.336 319.228 125.416ZM319.469 127.78C318.971 127.828 318.529 127.467 318.48 126.976C318.432 126.486 318.794 126.044 319.293 125.995C319.783 125.939 320.225 126.301 320.273 126.799C320.322 127.29 319.96 127.732 319.469 127.78ZM310.022 144.664C309.21 144.745 308.623 145.468 308.704 146.28C308.784 147.092 309.508 147.687 310.32 147.607C311.132 147.526 311.719 146.803 311.638 145.991C311.558 145.179 310.834 144.584 310.022 144.664ZM310.264 147.036C309.765 147.084 309.323 146.722 309.275 146.224C309.226 145.734 309.588 145.291 310.079 145.243C310.577 145.195 311.019 145.557 311.068 146.047C311.116 146.538 310.754 146.98 310.264 147.036ZM321.037 143.571C320.225 143.651 319.63 144.375 319.711 145.187C319.791 145.999 320.523 146.594 321.327 146.513C322.139 146.433 322.734 145.709 322.653 144.897C322.573 144.085 321.849 143.49 321.037 143.571ZM321.27 145.935C320.78 145.983 320.338 145.621 320.289 145.131C320.241 144.64 320.603 144.198 321.093 144.142C321.592 144.093 322.034 144.455 322.082 144.954C322.131 145.444 321.769 145.886 321.27 145.935ZM314.653 135.29C313.841 135.37 313.246 136.094 313.327 136.906C313.407 137.718 314.131 138.313 314.943 138.232C315.755 138.152 316.35 137.42 316.269 136.608C316.189 135.804 315.465 135.209 314.653 135.29ZM314.887 137.653C314.396 137.702 313.954 137.34 313.906 136.849C313.857 136.351 314.219 135.909 314.71 135.86C315.2 135.812 315.642 136.174 315.699 136.672C315.747 137.163 315.385 137.605 314.887 137.653ZM300.817 163.912C300.005 163.992 299.41 164.724 299.49 165.536C299.57 166.348 300.302 166.935 301.114 166.855C301.918 166.774 302.513 166.051 302.433 165.239C302.352 164.427 301.629 163.832 300.817 163.912ZM301.05 166.284C300.559 166.332 300.117 165.97 300.069 165.472C300.021 164.981 300.382 164.539 300.873 164.491C301.371 164.443 301.814 164.804 301.862 165.295C301.91 165.793 301.548 166.236 301.05 166.284ZM311.831 162.819C311.019 162.899 310.424 163.623 310.505 164.435C310.585 165.247 311.309 165.842 312.121 165.761C312.933 165.681 313.528 164.957 313.447 164.145C313.367 163.333 312.643 162.738 311.831 162.819ZM312.065 165.19C311.574 165.239 311.132 164.877 311.084 164.378C311.035 163.888 311.397 163.446 311.888 163.397C312.378 163.349 312.82 163.711 312.877 164.201C312.925 164.692 312.563 165.134 312.065 165.19ZM305.448 154.537C304.636 154.618 304.041 155.341 304.121 156.153C304.201 156.965 304.925 157.56 305.737 157.48C306.549 157.4 307.144 156.676 307.064 155.864C306.983 155.052 306.26 154.457 305.448 154.537ZM305.681 156.901C305.19 156.957 304.748 156.588 304.7 156.097C304.644 155.607 305.005 155.164 305.504 155.116C305.994 155.06 306.437 155.422 306.485 155.92C306.541 156.411 306.171 156.853 305.681 156.901ZM316.462 153.444C315.65 153.524 315.055 154.248 315.136 155.06C315.216 155.872 315.94 156.467 316.752 156.387C317.564 156.306 318.159 155.574 318.078 154.762C317.998 153.958 317.266 153.363 316.462 153.444ZM316.696 155.808C316.197 155.856 315.755 155.494 315.707 155.004C315.658 154.505 316.02 154.063 316.519 154.015C317.009 153.966 317.451 154.328 317.5 154.827C317.548 155.317 317.186 155.759 316.696 155.808ZM307.249 172.692C306.437 172.772 305.85 173.496 305.93 174.308C306.01 175.12 306.734 175.715 307.546 175.634C308.358 175.554 308.953 174.83 308.873 174.018C308.792 173.206 308.061 172.611 307.249 172.692ZM307.49 175.055C306.991 175.112 306.549 174.742 306.501 174.251C306.453 173.761 306.814 173.319 307.313 173.271C307.803 173.214 308.246 173.576 308.294 174.075C308.342 174.565 307.98 175.007 307.49 175.055Z'
      fill='black'
    />
    <path
      d='M288.958 151.561C286.243 151.194 273.543 167.007 276.891 169.251C292.638 179.809 306.852 179.024 310.545 178.378C315.386 177.533 317.531 171.78 316.539 168.722C315.101 164.286 291.646 151.924 288.958 151.561Z'
      fill='#F7A9A0'
    />
    <path
      d='M271.099 162.711L241.989 163.54L235.314 122.498L264.424 121.668L271.099 162.711Z'
      fill='#0F2028'
    />
    <path
      d='M269.669 162.751L240.559 163.581L233.884 122.539L262.993 121.708L269.669 162.751Z'
      fill='#455A64'
    />
    <path
      d='M247.902 140.951C248.084 142.511 249.498 143.739 251.062 143.694C252.626 143.65 253.746 142.349 253.565 140.789C253.383 139.23 251.969 138.001 250.405 138.046C248.841 138.09 247.72 139.391 247.902 140.951Z'
      fill='white'
    />
    <path
      d='M290.16 152.972C290.16 152.972 285.517 145.785 281.91 142.764C277.079 138.719 271.242 137.217 268.759 136.734C263.575 135.728 250.342 136.878 250.009 140.747C249.707 144.249 263.173 142.39 263.173 142.39C263.173 142.39 249.131 142.02 249.542 146.304C249.954 150.588 265.462 147.54 265.462 147.54C265.462 147.54 251.026 147.484 252.15 151.833C252.999 155.121 267.201 153.152 267.201 153.152C267.201 153.152 254.792 153.189 255.519 156.607C256.323 160.385 269.547 159.39 269.547 159.39C272.858 167.768 278.038 170.323 281.821 171.772C282.737 172.124 290.16 152.972 290.16 152.972Z'
      fill='#F7A9A0'
    />
    <path
      d='M268.037 142.207C266.389 142.104 264.722 141.988 263.07 142.032C261.419 142.075 259.768 142.177 258.127 142.374C254.105 142.858 251.662 143.79 251.819 143.749C255.536 142.776 261.446 142.529 263.098 142.484C264.746 142.441 266.392 142.315 268.041 142.27C268.083 142.269 268.076 142.21 268.037 142.207Z'
      fill='#0F2028'
    />
    <path
      d='M268.303 148.168C266.193 148.127 264.1 148.009 261.987 148.062C259.886 148.115 257.896 148.349 255.803 148.545C255.642 148.561 255.703 148.642 255.866 148.633C257.965 148.52 259.914 148.577 262.014 148.488C264.107 148.401 266.212 148.23 268.306 148.218C268.339 148.217 268.335 148.168 268.303 148.168Z'
      fill='#0F2028'
    />
    <path
      d='M269.451 153.242C266.229 153.015 262.971 153.382 259.782 153.82C259.623 153.841 259.714 153.938 259.877 153.926C263.087 153.673 265.605 153.452 269.443 153.355C269.504 153.352 269.519 153.246 269.451 153.242Z'
      fill='#0F2028'
    />
    <path
      d='M291.473 151.423L276.701 172.298C276.701 172.298 301.466 182.366 310.6 179.46C314.866 178.103 319.211 170.421 317.209 167.16C313.626 161.325 291.473 151.423 291.473 151.423Z'
      fill='#D2F801'
    />
    <path
      opacity='0.1'
      d='M280.347 167.153L278.996 169.058C279.028 169.058 279.052 169.058 279.084 169.05C279.897 168.97 280.491 168.246 280.411 167.434C280.403 167.329 280.379 167.241 280.347 167.153ZM289.802 165.014C288.99 165.094 288.403 165.818 288.483 166.63C288.564 167.442 289.287 168.037 290.099 167.957C290.911 167.876 291.506 167.145 291.426 166.333C291.345 165.529 290.614 164.934 289.802 165.014ZM290.043 167.378C289.545 167.426 289.102 167.064 289.054 166.574C289.006 166.075 289.368 165.633 289.866 165.585C290.357 165.537 290.799 165.898 290.847 166.397C290.895 166.887 290.533 167.329 290.043 167.378ZM300.817 163.912C300.005 163.993 299.41 164.725 299.49 165.537C299.57 166.349 300.302 166.936 301.114 166.855C301.918 166.775 302.513 166.051 302.433 165.239C302.352 164.427 301.629 163.832 300.817 163.912ZM301.05 166.284C300.559 166.333 300.117 165.971 300.069 165.472C300.021 164.982 300.382 164.54 300.873 164.491C301.371 164.443 301.814 164.805 301.862 165.295C301.91 165.794 301.548 166.236 301.05 166.284ZM311.831 162.819C311.019 162.899 310.424 163.623 310.505 164.435C310.585 165.247 311.309 165.842 312.121 165.762C312.933 165.681 313.528 164.958 313.447 164.146C313.367 163.334 312.643 162.739 311.831 162.819ZM312.065 165.191C311.574 165.239 311.132 164.877 311.084 164.379C311.035 163.888 311.397 163.446 311.888 163.398C312.378 163.35 312.82 163.711 312.877 164.202C312.925 164.692 312.563 165.135 312.065 165.191ZM294.433 155.631C293.621 155.712 293.026 156.443 293.106 157.247C293.187 158.059 293.918 158.654 294.722 158.574C295.534 158.494 296.129 157.77 296.049 156.958C295.968 156.146 295.245 155.551 294.433 155.631ZM294.666 158.003C294.176 158.051 293.733 157.69 293.685 157.191C293.637 156.701 293.999 156.258 294.489 156.21C294.988 156.162 295.43 156.524 295.478 157.014C295.526 157.513 295.164 157.955 294.666 158.003ZM285.227 174.887C284.954 174.911 284.712 175.008 284.511 175.16C284.793 175.249 285.082 175.345 285.372 175.45C285.38 175.45 285.38 175.45 285.388 175.45C285.565 175.45 285.734 175.514 285.87 175.611C286.168 175.707 286.473 175.804 286.779 175.908C286.578 175.249 285.935 174.807 285.227 174.887ZM296.242 173.786C295.43 173.866 294.835 174.59 294.915 175.402C294.996 176.214 295.719 176.809 296.531 176.728C297.343 176.648 297.938 175.924 297.858 175.112C297.777 174.3 297.054 173.705 296.242 173.786ZM296.475 176.157C295.985 176.206 295.542 175.844 295.486 175.345C295.438 174.855 295.8 174.413 296.298 174.364C296.789 174.316 297.231 174.678 297.279 175.168C297.327 175.667 296.965 176.109 296.475 176.157ZM307.249 172.692C306.437 172.773 305.85 173.496 305.93 174.308C306.01 175.12 306.734 175.715 307.546 175.635C308.358 175.554 308.953 174.831 308.873 174.019C308.792 173.207 308.061 172.612 307.249 172.692ZM307.49 175.056C306.991 175.112 306.549 174.742 306.501 174.252C306.453 173.761 306.814 173.319 307.313 173.271C307.803 173.215 308.246 173.577 308.294 174.075C308.342 174.565 307.98 175.008 307.49 175.056Z'
      fill='black'
    />
    <path
      d='M282.731 173.455C283.687 171.781 284.887 170.23 286.004 168.661C287.104 167.114 288.216 165.574 289.338 164.042C291.601 160.95 293.806 157.78 296.267 154.84C296.325 154.771 296.431 154.839 296.384 154.919C294.419 158.247 292.1 161.385 289.84 164.515C288.705 166.085 287.547 167.639 286.373 169.179C285.242 170.66 284.135 172.204 282.843 173.552C282.78 173.617 282.693 173.524 282.731 173.455Z'
      fill='#0F2028'
    />
    <path
      d='M313.226 163.049C312.234 162.211 311.186 161.438 310.105 160.712C310.39 160.786 310.673 160.868 310.957 160.946C311.495 161.093 312.02 161.274 312.55 161.441C312.594 161.455 312.635 161.392 312.59 161.366C312.096 161.088 311.555 160.884 311.011 160.729C310.61 160.614 310.196 160.555 309.782 160.502C308.992 159.982 308.188 159.482 307.369 159.014C306.374 158.446 305.362 157.915 304.333 157.411C303.275 156.894 302.172 156.32 301.038 155.992C300.986 155.978 300.939 156.048 300.99 156.08C301.943 156.683 303.002 157.148 303.996 157.678C305.059 158.246 306.11 158.838 307.151 159.444C309.185 160.628 311.179 161.877 313.188 163.102C313.225 163.124 313.258 163.076 313.226 163.049Z'
      fill='#0F2028'
    />
    <path
      d='M324.625 139.816C324.471 140.587 324.295 141.359 324.068 142.112C323.875 142.757 323.63 143.387 323.426 144.028C323.788 141.249 324.099 138.466 324.404 135.676C324.409 135.624 324.332 135.616 324.324 135.668C323.783 139.068 323.222 142.463 322.716 145.869C322.211 149.271 321.643 152.664 321.003 156.043C320.358 159.442 319.642 162.828 318.777 166.179C318.348 167.84 317.886 169.494 317.388 171.135C316.961 172.541 316.545 173.971 315.907 175.3C315.173 176.827 314.087 178.1 312.569 178.886C310.988 179.705 306.393 180.594 296.562 178.598C296.498 178.585 296.516 178.681 296.578 178.697C306.233 181.178 310.706 180.159 312.188 179.634C313.589 179.137 314.635 178.242 315.521 177.035C316.367 175.882 316.917 174.537 317.373 173.192C317.921 171.581 318.369 169.929 318.809 168.287C320.637 161.473 321.882 154.54 322.933 147.569C323.094 146.502 323.242 145.435 323.383 144.366C323.398 144.368 323.413 144.364 323.423 144.347C323.819 143.677 324.065 142.896 324.27 142.149C324.48 141.384 324.635 140.615 324.715 139.826C324.72 139.767 324.636 139.76 324.625 139.816Z'
      fill='#0F2028'
    />
    <path
      d='M301.039 155.993C304.231 147.231 307.777 138.563 312.128 130.308C308.987 137.769 304.448 148.767 301.039 155.993Z'
      fill='#0F2028'
    />
    <path
      d='M310.756 131.488C310.605 132.808 310.154 133.978 309.901 135.273C309.591 133.978 310.091 132.599 310.756 131.488Z'
      fill='#0F2028'
    />
  </svg>
);

export const EyeOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth='1.5'
    stroke='currentColor'
    className='size-6'
    {...props}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z'
    />
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
    />
  </svg>
);

export const EyeClosedIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth='1.5'
    stroke='currentColor'
    className='size-6'
    {...props}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88'
    />
  </svg>
);

export const SubmittingIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width='19'
    height='18'
    viewBox='0 0 19 18'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className='size-6'
    {...props}
  >
    <path
      d='M11.4125 16.815C11.165 16.815 10.9325 16.65 10.865 16.395C10.79 16.095 10.9625 15.7875 11.2625 15.705C14.3075 14.9025 16.43 12.1425 16.43 8.9925C16.43 5.1675 13.3175 2.055 9.4925 2.055C6.245 2.055 4.115 3.9525 3.1175 5.1H5.3225C5.63 5.1 5.885 5.355 5.885 5.6625C5.885 5.97 5.645 6.2325 5.33 6.2325H2.0075C1.955 6.2325 1.9025 6.225 1.85 6.21C1.7825 6.1875 1.7225 6.1575 1.67 6.12C1.6025 6.075 1.55 6.015 1.5125 5.9475C1.475 5.8725 1.445 5.7975 1.4375 5.715C1.4375 5.6925 1.4375 5.6775 1.4375 5.655V2.25C1.4375 1.9425 1.6925 1.6875 2 1.6875C2.3075 1.6875 2.5625 1.9425 2.5625 2.25V4.0425C3.785 2.73 6.0875 0.9375 9.5 0.9375C13.9475 0.9375 17.5625 4.5525 17.5625 9C17.5625 12.66 15.095 15.87 11.555 16.8C11.51 16.8075 11.4575 16.815 11.4125 16.815Z'
      fill='white'
    />
    <path
      d='M8.9675 17.0475C8.9525 17.0475 8.93 17.0475 8.915 17.04C8.1125 16.9875 7.325 16.8075 6.575 16.515C6.3575 16.4325 6.215 16.215 6.215 15.9825C6.215 15.915 6.23 15.8475 6.2525 15.7875C6.365 15.5025 6.695 15.3525 6.98 15.465C7.625 15.72 8.3075 15.87 8.9975 15.9225H9.005C9.305 15.9375 9.53 16.1925 9.53 16.4925C9.53 16.5 9.53 16.515 9.53 16.5225C9.5075 16.815 9.26 17.0475 8.9675 17.0475ZM4.835 15.435C4.7075 15.435 4.5875 15.3975 4.4825 15.315C3.8525 14.8125 3.305 14.22 2.8475 13.5525C2.78 13.455 2.7425 13.35 2.7425 13.2375C2.7425 13.05 2.8325 12.8775 2.99 12.7725C3.2375 12.6 3.605 12.6675 3.77 12.915C4.1675 13.4925 4.64 14.0025 5.1875 14.43C5.315 14.535 5.3975 14.6925 5.3975 14.865C5.3975 14.9925 5.36 15.12 5.2775 15.225C5.1725 15.36 5.0075 15.435 4.835 15.435ZM2.33 11.775C2.0825 11.775 1.865 11.6175 1.7975 11.385C1.5575 10.6125 1.4375 9.81 1.4375 9C1.4375 8.6925 1.6925 8.4375 2 8.4375C2.3075 8.4375 2.5625 8.6925 2.5625 9C2.5625 9.6975 2.6675 10.3875 2.87 11.0475C2.885 11.1 2.8925 11.16 2.8925 11.22C2.8925 11.4675 2.735 11.6775 2.5025 11.7525C2.4425 11.7675 2.39 11.775 2.33 11.775Z'
      fill='white'
    />
    <path
      d='M9.5 12C11.1569 12 12.5 10.6569 12.5 9C12.5 7.34315 11.1569 6 9.5 6C7.84315 6 6.5 7.34315 6.5 9C6.5 10.6569 7.84315 12 9.5 12Z'
      fill='white'
    />
  </svg>
);

export const PasswordResetIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width='100'
    height='100'
    viewBox='0 0 100 100'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className='size-6'
    {...props}
  >
    <rect width='100' height='100' />
  </svg>
);

export const GreenArrowIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width='99'
    height='126'
    viewBox='0 0 99 126'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className='size-6'
    {...props}
  >
    <g clipPath='url(#clip0_2837_142996)'>
      <path
        d='M23.2482 111.663C30.7601 115.773 39.2693 115.541 46.5364 119.451C46.7071 119.543 46.6477 120.095 46.7517 121.017C45.2275 121.092 43.6996 121.467 42.2826 121.203C35.759 119.997 29.2074 118.884 22.7922 117.216C16.7144 115.645 15.6552 112.588 18.7632 107.085C21.6 102.06 24.5375 97.1068 27.4731 92.1425C27.7907 91.612 28.3923 91.2537 29.5788 90.1196C30.2131 97.6302 25.2123 102.421 23.5058 109.185C28.9855 106.911 33.9041 105.166 38.5524 102.88C54.2733 95.1648 67.4596 84.5583 75.8044 68.7829C86.8245 47.9444 83.6432 24.9259 67.539 7.70162C67.4183 7.57871 67.2867 7.45766 67.1856 7.3203C66.1381 5.93082 63.4035 4.63381 65.6944 2.72276C67.7535 1.0066 69.0462 3.55922 70.2688 4.87419C89.5571 25.7399 91.5151 53.6481 75.2549 76.9957C64.8074 91.9952 50.3546 101.737 33.4937 108.167C30.1223 109.458 26.6615 110.487 23.2445 111.641L23.2482 111.663Z'
        fill='#1D9B5E'
      />
    </g>
    <defs>
      <clipPath id='clip0_2837_142996'>
        <rect
          width='113.679'
          height='80.6467'
          fill='white'
          transform='translate(19.3567 125.751) rotate(-99.8038)'
        />
      </clipPath>
    </defs>
  </svg>
);
