import React from 'react';
import { EventImpl } from '@fullcalendar/core/internal';
import { Attendance as AttendanceType } from '../../types/sessionTypes';

interface ClientData {
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  [key: string]: any;
}

interface SessionData {
  id?: number;
  date?: string;
  spots?: number;
  attendances?: AttendanceType[];
  clients?: ClientData[];
  client_ids?: number[];
  [key: string]: any;
}

interface EventTooltipProps {
  event: EventImpl & {
    title: string;
    extendedProps: {
      session: SessionData;
    };
  };
}

export const EventTooltip: React.FC<EventTooltipProps> = ({ event }) => {
  const session = event.extendedProps?.session;
  console.log('Session data:', session);
  if (!session) {
    console.log('No session data available');
    return null;
  }

  const totalSpots = session.spots || 0;

  let allClients: Array<{ first_name: string; last_name: string }> = [];

  if (Array.isArray(session.attendances)) {
    console.log('Processing attendances:', session.attendances);

    allClients = session.attendances
      .filter((att) => {
        if (!att) return false;

        // Check if we have a client object with name
        const hasClient = !!att.client?.first_name || !!att.client?.last_name;

        return hasClient;
      })
      .map((att) => {
        const firstName = att.client?.first_name || 'Unknown';
        const lastName = att.client?.last_name || 'Client';

        return {
          first_name: firstName,
          last_name: lastName,
        };
      });
  }

  console.log('Extracted clients:', allClients);

  const enrolledCount = allClients.length;
  const availableSlots = Math.max(0, totalSpots - enrolledCount);

  const additionalClients = Math.max(0, enrolledCount - 3);

  return (
    <div className='w-full p-4 bg-white rounded-lg shadow-lg'>
      <div className='flex items-start space-x-3 mb-3'>
        <span className='w-3 h-3 bg-blue-500 rounded-full mt-1.5 flex-shrink-0' />
        <h3 className='text-sm font-semibold text-gray-900 leading-tight'>
          {event.title}
        </h3>
      </div>

      <div className='space-y-3 pl-6 mb-3'>
        <div className='flex items-center space-x-3'>
          <div className='w-4 h-4 flex items-center justify-center'>
            <span className='text-gray-500 text-sm'>📅</span>
          </div>
          <p className='text-gray-700 text-xs'>
            {event.start
              ? new Date(event.start).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'No date'}
          </p>
        </div>

        <div className='flex items-center space-x-3'>
          <div className='w-4 h-4 flex items-center justify-center'>
            <span className='text-gray-500 text-sm'>⏰</span>
          </div>
          <p className='text-gray-700 text-xs'>
            {event.start
              ? new Date(event.start).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'No time'}
          </p>
        </div>
      </div>

      <div className='border-t pt-3'>
        <div className='flex gap-3 items-start'>
          <div className='w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center'>
            <span className='text-gray-500 text-sm'>👥</span>
          </div>
          <div className='flex-1'>
            <p className='text-gray-900 text-xs font-medium mb-1'>
              {totalSpots > 0
                ? `${availableSlots} slot${
                    availableSlots !== 1 ? 's' : ''
                  } remaining`
                : 'No limit on spots'}
            </p>

            {enrolledCount > 0 && (
              <div className='space-y-1'>
                <p className='text-gray-500 text-xs mb-1'>
                  {enrolledCount} {enrolledCount === 1 ? 'client' : 'clients'}{' '}
                  enrolled
                </p>
                <div className='max-h-24 overflow-y-auto space-y-1'>
                  {allClients.slice(0, 3).map((client, index) => (
                    <div key={index} className='flex items-center space-x-2'>
                      <span className='w-2 h-2 bg-blue-500 rounded-full flex-shrink-0' />
                      <p className='text-gray-700 text-xs'>
                        {client.first_name} {client.last_name}
                      </p>
                    </div>
                  ))}
                  {additionalClients > 0 && (
                    <p className='text-gray-500 text-xs pl-4'>
                      +{additionalClients} more
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventTooltip;
