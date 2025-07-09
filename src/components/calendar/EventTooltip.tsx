import React from 'react';
import { EventImpl } from '@fullcalendar/core/internal';
import { Attendance } from '../../types/sessionTypes';

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
  attendances?: Attendance[];
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
  console.log('Session data:', JSON.stringify(session, null, 2));
  if (!session) {
    console.log('No session data available');
    return null;
  }

  const totalSpots = session.spots || 0;
  console.log('Session spots:', totalSpots);
  console.log('Session clients:', session.clients);
  console.log('Session attendances:', session.attendances);

  let allClients: Array<{ first_name: string; last_name: string }> = [];

  // Process attendances first since we know they exist
  if (Array.isArray(session.attendances) && session.attendances.length > 0) {
    console.log('Processing attendances:', session.attendances);

    allClients = session.attendances
      .filter((att): att is Attendance => {
        if (!att) return false;
        // Check if we have participant_name or client data
        return Boolean(
          att.participant_name ||
            (typeof att.client === 'object' && att.client !== null) ||
            (typeof att.client === 'number' &&
              session.client_ids?.includes(att.client))
        );
      })
      .map((att) => {
        // If we have participant_name, use that
        if (att.participant_name) {
          const [first_name, ...rest] = att.participant_name.split(' ');
          const last_name = rest.join(' ');
          return {
            first_name: first_name || 'Unknown',
            last_name: last_name || 'Client',
          };
        }

        // If client is an object with name properties
        if (typeof att.client === 'object' && att.client !== null) {
          return {
            first_name: att.client.first_name || 'Unknown',
            last_name: att.client.last_name || 'Client',
          };
        }

        // If client is just an ID, try to find it in client_ids
        if (
          typeof att.client === 'number' &&
          session.client_ids?.includes(att.client)
        ) {
          // If we had client data, we would look it up here
          // For now, just return a generic client
          return {
            first_name: 'Client',
            last_name: `#${att.client}`,
          };
        }

        // Fallback
        return {
          first_name: 'Unknown',
          last_name: 'Client',
        };
      });
  }

  console.log('Extracted clients:', allClients);
  console.log('Raw client data from session:', {
    clients: session.clients,
    attendances: session.attendances,
    client_ids: session.client_ids,
    hasClients: !!session.clients,
    hasAttendances: !!session.attendances,
    hasClientIds: !!session.client_ids,
  });

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
