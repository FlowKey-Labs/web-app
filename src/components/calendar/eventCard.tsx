import editIcon from '../../assets/icons/edit.svg';
import deleteIcon from '../../assets/icons/delete.svg';
import closeIcon from '../../assets/icons/close.svg';
import { Dictionary } from '@fullcalendar/core/internal';
import { CalendarSessionType } from '../../types/sessionTypes';
import moment from 'moment';
import { subHours } from 'date-fns';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

import { useDeleteSession } from '../../hooks/reactQuery';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import {
  getParticipantSummary,
  processSessionParticipants,
} from '../../utils/sessionUtils';

const formatSessionInfo = (
  session: CalendarSessionType | null
): { dateStr: string; timeStr: string; repeatStr: string } => {
  if (!session) {
    return { dateStr: '', timeStr: '', repeatStr: '' };
  }

  const start = moment(subHours(new Date(session.start_time), 3));
  const end = moment(subHours(new Date(session.end_time), 3));

  const dateStr = start.format('dddd, MMMM D');
  const timeStr = `${start.format('h:mm a')} – ${end.format('h:mm a')}`;

  let repeatStr = '';
  if (
    session.repeat_every &&
    session.repeat_unit &&
    session.repeat_on?.length
  ) {
    const pluralUnit =
      session.repeat_every > 1
        ? `${session.repeat_unit}s`
        : session.repeat_unit;
    const repeatDays = session.repeat_on.join(', ');
    repeatStr = `Every ${session.repeat_every} ${pluralUnit} on ${repeatDays}`;
  }

  return { dateStr, timeStr, repeatStr };
};

const EventCard = ({
  data,
  onClose,
  handleRemoveEvent,
  handleEditEvent,
}: {
  data: Dictionary;
  onClose: () => void;
  handleRemoveEvent: () => void;
  handleEditEvent: (id: string) => void;
}) => {
  const session = data?.session as CalendarSessionType;

  const participants = processSessionParticipants(session);
  const summary = getParticipantSummary(session);
  const { dateStr, timeStr, repeatStr } = formatSessionInfo(
    data?.session || {}
  );
  const deleteSession = useDeleteSession();
  const navigate = useNavigate();

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data?.session?.id) {
      navigate(`/sessions/${data.session.id}`);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession.mutate(data?.session?.id, {
      onSuccess: () => {
        onClose?.();
        handleRemoveEvent?.();
        notifications.show({
          title: 'Success',
          message: 'Session deleted successfully',
          color: 'green',
          radius: 'md',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
              <img src={successIcon} alt='Success' className='w-4 h-4' />
            </span>
          ),
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
        });
      },
      onError: () => {
        console.error('Error deleting session:');
        notifications.show({
          title: 'Error',
          message: 'Failed to delete session',
          color: 'red',
          radius: 'md',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
        });
      },
    });
  };

  return (
    <div className='w-full h-full bg-white space-y-6'>
      <div className='flex flex-col w-full items-center justify-end gap-3'>
        <div className='flex items-center self-end gap-2'>
          <img
            src={editIcon}
            className='cursor-pointer hover:opacity-70 transition-opacity'
            onClick={() => handleEditEvent(data?.session?.id)}
            alt='Edit event'
          />
          <img
            src={deleteIcon}
            className='cursor-pointer hover:opacity-70 transition-opacity'
            onClick={handleDeleteClick}
            alt='Delete event'
          />
          <img
            src={closeIcon}
            className='cursor-pointer hover:opacity-70 transition-opacity'
            onClick={() => onClose?.()}
            alt='Close popup'
          />
        </div>

        <div className='flex flex-col space-y-3 pl-4 w-full'>
          <div className='flex self-start space-x-3 w-full'>
            <span className='w-3 h-3 bg-blue-500 rounded-full mt-1.5 flex-shrink-0' />
            <h2
              className='text-xl font-semibold text-gray-900 leading-tight hover:text-blue-600 cursor-pointer transition-colors'
              onClick={handleTitleClick}
            >
              {session?.title}
              <span className='ml-2 text-blue-500 text-base'>
                View Details →
              </span>
            </h2>
          </div>

          {/* <div className='space-y-3 pl-6'> */}
          <div className='flex items-center pl-6 space-x-3'>
            <div className='w-5 h-5 flex items-center justify-center'>
              <span className='text-gray-500 text-lg'>📅</span>
            </div>
            <p className='text-gray-700 font-medium'>{dateStr}</p>
          </div>

          <div className='flex items-center pl-6 space-x-3'>
            <div className='w-5 h-5 flex items-center justify-center'>
              <span className='text-gray-500 text-lg'>⏰</span>
            </div>
            <p className='text-gray-700'>{timeStr}</p>
          </div>

          {repeatStr && (
            <div className='flex items-center space-x-3'>
              <div className='w-5 h-5 flex items-center justify-center'>
                <span className='text-gray-500 text-sm'>🔄</span>
              </div>
              <p className='text-gray-600 text-sm'>{repeatStr}</p>
            </div>
          )}
        </div>
        <div className='border-t pt-4'>
          <div className='flex gap-3 items-start'>
            <div className='w-6 h-6 mt-0.5 flex-shrink-0 flex items-center justify-center'>
              <span className='text-gray-500 text-xl'>👥</span>
            </div>
            <div className='flex-1'>
              <p className='text-gray-900 font-semibold mb-1'>
                {summary.capacity} Slots
              </p>
              <p className='text-gray-500 text-sm mb-3'>
                {summary.total} Registered · {summary.attended} Attended ·{' '}
                {summary.available} Available
                {participants.filter((p) => p.type === 'booking').length >
                  0 && (
                  <span className='ml-2 text-green-600'>
                    ({participants.filter((p) => p.type === 'booking').length}{' '}
                    from bookings)
                  </span>
                )}
              </p>

              {participants.length > 0 && (
                <div className='max-h-32 overflow-y-auto space-y-2'>
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className='flex items-center space-x-3'
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          participant.type === 'booking'
                            ? 'bg-green-500'
                            : 'bg-blue-500'
                        }`}
                      ></span>
                      <div className='flex-1'>
                        <p className='text-gray-700 text-sm'>
                          {participant.name}
                        </p>
                        <div className='flex items-center gap-2'>
                          {participant.booking_reference && (
                            <span className='text-xs text-gray-500'>
                              Ref: {participant.booking_reference}
                            </span>
                          )}
                          {participant.is_group_booking && (
                            <span className='text-xs bg-blue-100 text-blue-700 px-1 rounded'>
                              Group ({participant.quantity})
                            </span>
                          )}
                          {participant.isAttended && (
                            <span className='text-green-600 text-xs'>✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {participants.length === 0 && (
                <p className='text-gray-400 text-sm italic'>
                  No participants yet
                </p>
              )}
            </div>
          </div>
        </div>

        <div className='border-t pt-4 space-y-3'>
          {session?.assigned_staff && (
            <div className='flex items-center space-x-3'>
              <div className='w-5 h-5 flex items-center justify-center'>
                <span className='text-gray-500 text-lg'>👤</span>
              </div>
              <p className='text-gray-700'>
                <span className='font-medium'>Staff:</span>{' '}
                {session.assigned_staff.user?.first_name}{' '}
                {session.assigned_staff.user?.last_name}
              </p>
            </div>
          )}

          <div className='flex items-center space-x-3'>
            <div className='w-5 h-5 flex items-center justify-center'>
              <span className='text-gray-500 text-lg'>🔔</span>
            </div>
            <p className='text-gray-700'>
              <span className='font-medium'>Reminder:</span> 30 minutes before
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => handleEditEvent(session?.id?.toString() || '')}
        className='w-full bg-green-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors'
      >
        + Add Clients
      </button>
    </div>
  );
};

export default EventCard;
