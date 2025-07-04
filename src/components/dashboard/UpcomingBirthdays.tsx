import { format } from 'date-fns';
import { Skeleton } from '@mantine/core';
import { useGetUpcomingBirthdays } from '../../hooks/react_query_hooks/analyticsHooks';

export function UpcomingBirthdays() {
  const { data, isLoading } = useGetUpcomingBirthdays();

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='flex items-center justify-between'>
            <Skeleton height={16} width={120} />
            <Skeleton height={16} width={80} />
          </div>
        ))}
      </div>
    );
  }

  const upcomingBirthdays = data?.upcoming_birthdays || [];

  if (!isLoading && upcomingBirthdays.length === 0) {
    return (
      <p className='text-sm text-gray-500 text-center py-4'>
        No upcoming birthdays this week
      </p>
    );
  }

  return (
    <div className='space-y-3'>
      {upcomingBirthdays.map((birthdayPerson) => {
        const birthdayDate = birthdayPerson.birthday_date || birthdayPerson.dob;

        return (
          <div
            key={birthdayPerson.id}
            className='flex items-center justify-between'
          >
            <div>
              <p className='text-sm font-medium text-gray-900'>
                {birthdayPerson.first_name} {birthdayPerson.last_name}
              </p>
              <p className='text-xs text-gray-500'>
                {birthdayDate ? format(new Date(birthdayDate), 'MMM d') : 'N/A'}{' '}
                • {birthdayPerson.age || 'N/A'} years
              </p>
            </div>
            <button className='text-xs font-medium text-primary hover:text-primary-dark'>
              Send Wishes
            </button>
          </div>
        );
      })}
    </div>
  );
}
