import { Skeleton, Text } from '@mantine/core';
import { useGetSessionsPerStaff } from '../../hooks/react_query_hooks/analyticsHooks';
import type { StaffSessionsPerStaff } from '../../types/sessionTypes';

export function SessionsPerStaff() {
  const { data: sessionsPerStaff, isLoading, error } = useGetSessionsPerStaff();

  if (isLoading) {
    return (
      <div className='max-h-80 overflow-y-auto pr-2 -mr-2'>
        <div className='space-y-3 pr-2'>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className='flex items-center justify-between'>
              <Skeleton height={16} width={120} />
              <Skeleton height={16} width={40} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='max-h-80 overflow-y-auto p-4'>
        <Text color="red" size="sm">Error loading sessions data</Text>
      </div>
    );
  }

  if (!sessionsPerStaff) {
    return (
      <div className='max-h-80 overflow-y-auto p-4'>
        <Text size="sm" color="dimmed">No session data available</Text>
      </div>
    );
  }

  const staffSessions: StaffSessionsPerStaff[] = Array.isArray(sessionsPerStaff.staff_sessions) 
    ? sessionsPerStaff.staff_sessions 
    : [];
  
  if (staffSessions.length === 0) {
    return (
      <div className='max-h-80 overflow-y-auto p-4'>
        <Text size="sm" color="dimmed">No sessions scheduled for today</Text>
      </div>
    );
  }

  return (
    <div className='max-h-80 overflow-y-auto pr-2 -mr-2'>
      <div className='space-y-3 pr-2'>
        {staffSessions.map((staffSession) => (
          <div key={staffSession.staff_id} className='flex items-center justify-between'>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-900 truncate'>
                {staffSession.staff_name}
              </p>
              {staffSession.sessions.length > 0 && (
                <p className='text-xs text-gray-500 truncate'>
                  {(staffSession.sessions[0].title || 'Untitled Session')} • 
                  {(staffSession.sessions[0].start_time || '--:--')}
                </p>
              )}
            </div>
            <span className='px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full whitespace-nowrap ml-2'>
              {staffSession.session_count} {staffSession.session_count === 1 ? 'session' : 'sessions'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
