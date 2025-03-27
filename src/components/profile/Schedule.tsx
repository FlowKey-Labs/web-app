import DropDownMenu from '../common/DropdownMenu';
import dropdownIcon from '../../assets/icons/dropIcon.svg';
import { useMemo, useState } from 'react';
import { rem, Switch } from '@mantine/core';
import { TimeDropdown } from '../common/TimeDropdown';
import { generateTimeOptions } from '../common/TimeDropdown';
import { Calendar } from '@mantine/dates';
import calendarIcon from '../../assets/icons/calendar.svg';
import { days } from '../utils/dummyData';
import './index.css';

type DaySchedule = {
  isOpen: boolean;
  shifts: {
    id: string;
    startTime: string;
    endTime: string;
  }[];
};

type Exception = {
  id: string;
  date: Date;
  isAllDay: boolean;
  timeSlots: {
    id: string;
    startTime: string;
    endTime: string;
  }[];
};

const Schedule = () => {
  const timeOptions = useMemo(() => generateTimeOptions(), []);

  const appointmentDurationOptions = Array.from({ length: 12 }, (_, i) => {
    const value = (i + 1) * 5;
    return {
      value: value.toString(),
      label: `${value} Min`,
    };
  });

  const [selectedDuration, setSelectedDuration] = useState('30');
  const [durationDropdownOpen, setDurationDropdownOpen] = useState(false);
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(() => {
    const initialSchedule: Record<string, DaySchedule> = {};
    days.forEach((day) => {
      initialSchedule[day] = {
        isOpen: day === 'Monday',
        shifts:
          day === 'Monday'
            ? [
                { id: '1', startTime: '09:00', endTime: '13:00' },
                { id: '2', startTime: '14:00', endTime: '18:00' },
              ]
            : [],
      };
    });
    return initialSchedule;
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [exceptions, setExceptions] = useState<Exception[]>([]);

  // Handlers
  const handleDurationSelect = (value: string) => {
    setSelectedDuration(value);
    setDurationDropdownOpen(false);
  };

  const handleDayToggle = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen,
        shifts: !prev[day].isOpen
          ? [
              {
                id: Date.now().toString(),
                startTime: '09:00',
                endTime: '17:00',
              },
            ]
          : [],
      },
    }));
  };

  const handleAddShift = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        shifts: [
          ...prev[day].shifts,
          { id: Date.now().toString(), startTime: '09:00', endTime: '17:00' },
        ],
      },
    }));
  };

  const handleRemoveShift = (day: string, shiftId: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        shifts: prev[day].shifts.filter((shift) => shift.id !== shiftId),
      },
    }));
  };

  const handleTimeChange = (
    day: string,
    shiftId: string,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        shifts: prev[day].shifts.map((shift) =>
          shift.id === shiftId ? { ...shift, [field]: value } : shift
        ),
      },
    }));
  };

  const handleAddException = () => {
    if (!selectedDate) return;

    const newException: Exception = {
      id: Date.now().toString(),
      date: selectedDate,
      isAllDay: true,
      timeSlots: [
        { id: Date.now().toString(), startTime: '09:00', endTime: '17:00' },
      ],
    };

    setExceptions([...exceptions, newException]);
  };

  const handleRemoveException = (exceptionId: string) => {
    setExceptions(
      exceptions.filter((exception) => exception.id !== exceptionId)
    );
  };

  const handleToggleAllDay = (exceptionId: string) => {
    setExceptions(
      exceptions.map((exception) =>
        exception.id === exceptionId
          ? { ...exception, isAllDay: !exception.isAllDay }
          : exception
      )
    );
  };

  const handleAddTimeSlot = (exceptionId: string) => {
    setExceptions(
      exceptions.map((exception) =>
        exception.id === exceptionId
          ? {
              ...exception,
              timeSlots: [
                ...exception.timeSlots,
                {
                  id: Date.now().toString(),
                  startTime: '09:00',
                  endTime: '17:00',
                },
              ],
            }
          : exception
      )
    );
  };

  const handleRemoveTimeSlot = (exceptionId: string, timeSlotId: string) => {
    setExceptions(
      exceptions.map((exception) =>
        exception.id === exceptionId
          ? {
              ...exception,
              timeSlots: exception.timeSlots.filter(
                (slot) => slot.id !== timeSlotId
              ),
            }
          : exception
      )
    );
  };

  const handleTimeSlotChange = (
    exceptionId: string,
    timeSlotId: string,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setExceptions(
      exceptions.map((exception) =>
        exception.id === exceptionId
          ? {
              ...exception,
              timeSlots: exception.timeSlots.map((slot) =>
                slot.id === timeSlotId ? { ...slot, [field]: value } : slot
              ),
            }
          : exception
      )
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className='w-full bg-white rounded-lg p-6'>
      <div className='flex justify-between'>
        <div className='flex-1 px-8 '>
          <div className='space-y-2'>
            <h3 className='text-primary font-semibold text-[32px]'>
              Working Hours
            </h3>
            <p className='text-primary text-sm'>
              Add Time Slots Based On Your Availability.
            </p>
          </div>
          <div className='mt-6 max-w-[340px]'>
            <p className='text-primary font-semibold text-sm mb-2'>
              Appointment Duration
            </p>
            <DropDownMenu
              show={durationDropdownOpen}
              setShow={setDurationDropdownOpen}
              dropDownPosition='center'
              actionElement={
                <div
                  id='viewSelect'
                  className='p-2 border-b border-gray-200 w-72 h-10 rounded-md outline-none cursor-pointer flex items-center justify-between'
                >
                  <p className='text-primary text-sm'>{selectedDuration} Min</p>
                  <img src={dropdownIcon} alt='dropdown icon' />
                </div>
              }
            >
              <div className='w-28 border border-secondary text-sm space-y-1 rounded-lg py-4 px-2 cursor-pointer max-h-40 overflow-y-auto scrollbar-hide'>
                {appointmentDurationOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleDurationSelect(option.value)}
                    className={`block py-1 rounded px-2 ${
                      selectedDuration === option.value
                        ? 'bg-[#EAFCF3]'
                        : 'hover:bg-[#DAF8E6]'
                    }`}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            </DropDownMenu>
          </div>

          <div className='mt-6 space-y-8 max-w-[340px]'>
            {days.map((day) => (
              <div key={day} className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <p className='text-primary font-semibold text-sm'>{day}</p>
                  <div className='flex items-center gap-4'>
                    <Switch
                      checked={schedule[day].isOpen}
                      onChange={() => handleDayToggle(day)}
                      color='#1D9B5E'
                      size='xs'
                    />
                    <p className='text-primary text-sm justify-end w-8'>
                      {schedule[day].isOpen ? 'Open' : 'Closed'}
                    </p>
                  </div>
                </div>

                {schedule[day].isOpen && (
                  <div className='space-y-3'>
                    {schedule[day].shifts.map((shift, index) => (
                      <div
                        key={shift.id}
                        className='flex flex-col p-4 rounded-md bg-[#FAFAFA]'
                      >
                        <div className='flex justify-between items-center mb-6'>
                          <span className='text-xs font-medium text-gray-500'>
                            Shift {index + 1}
                          </span>
                          <button
                            onClick={() => handleRemoveShift(day, shift.id)}
                            className='text-red-500 font-semibold text-xs hover:text-red-700'
                          >
                            Delete
                          </button>
                        </div>
                        <div className='flex items-center justify-between '>
                          <div className='flex flex-col '>
                            <p className='text-xs text-gray-500 mb-1'>
                              Start Time
                            </p>
                            <TimeDropdown
                              value={shift.startTime}
                              onChange={(value) =>
                                handleTimeChange(
                                  day,
                                  shift.id,
                                  'startTime',
                                  value
                                )
                              }
                              options={timeOptions}
                            />
                          </div>
                          <p className='text-sm font-semibold text-gray-500 mt-5'>
                            To
                          </p>
                          <div className='flex flex-col'>
                            <p className='text-xs text-gray-500 mb-1'>
                              End Time
                            </p>
                            <TimeDropdown
                              value={shift.endTime}
                              onChange={(value) =>
                                handleTimeChange(
                                  day,
                                  shift.id,
                                  'endTime',
                                  value
                                )
                              }
                              options={timeOptions}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => handleAddShift(day)}
                      className='flex items-center gap-1 text-secondary font-semibold underline text-sm mt-2'
                    >
                      Add Shift
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className='flex-1 px-8 '>
          <div className='space-y-2'>
            <h3 className='text-primary font-semibold text-[32px]'>
              Exceptions
            </h3>
            <p className='text-primary text-sm'>
              Won't Be Available On Specific Dates?
            </p>
          </div>

          <div className=' flex-1 justify-center space-y-6 items-center w-full mt-6'>
            <div className=' flex object-cover max-w-[340px] items-center justify-center rounded-lg bg-secondary p-2'>
              <Calendar
                highlightToday
                getDayProps={(date) => ({
                  selected: selectedDate
                    ? date.getTime() === selectedDate.getTime()
                    : false,
                  onClick: () => setSelectedDate(date),
                })}
                size='md'
                styles={(theme) => ({
                  cell: {
                    border: `${rem(1)} solid ${theme.colors.gray[2]}`,
                  },
                  day: {
                    color: theme.colors.gray[2],
                    borderRadius: '50%',
                    height: rem(40),
                    width: rem(40),
                    fontSize: theme.fontSizes.sm,
                  },
                  weekday: {
                    fontSize: theme.fontSizes.sm,
                    color: 'white',
                  },
                  month: {
                    fontSize: theme.fontSizes.md,
                    fontWeight: 600,
                  },
                })}
                classNames={{
                  calendarHeader: 'mb-4',
                  day: 'my-day-class',
                }}
              />
            </div>
            {selectedDate && (
              <div className='flex items-center gap-4 rounded-lg bg-[#EEEAF2] py-2 px-4 max-w-[340px]'>
                <img
                  src={calendarIcon}
                  alt='calendar icon'
                  className='w-4 h-4'
                />
                <p className='text-primary text-sm'>
                  {formatDate(selectedDate)}
                </p>
                <button
                  onClick={handleAddException}
                  className='ml-auto flex items-center gap-1 text-secondary text-xs'
                >
                  Add Exception
                </button>
              </div>
            )}

            <div className='space-y-4 max-w-[340px]'>
              {exceptions.map((exception) => (
                <div
                  key={exception.id}
                  className='p-4 rounded-lg border border-gray-200 '
                >
                  <div className='flex justify-between items-center mb-4 '>
                    <div className='flex items-center gap-2'>
                      <img
                        src={calendarIcon}
                        alt='calendar icon'
                        className='w-4 h-4'
                      />
                      <p className='text-primary text-sm font-medium'>
                        {formatDate(exception.date)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveException(exception.id)}
                      className='text-red-500 text-xs font-semibold hover:text-red-700'
                    >
                      Remove
                    </button>
                  </div>

                  <div className='flex items-center gap-2 mb-4'>
                    <Switch
                      checked={exception.isAllDay}
                      onChange={() => handleToggleAllDay(exception.id)}
                      size='xs'
                      color='#1D9B5E'
                    />
                    <span className='text-primary text-sm'>
                      {exception.isAllDay ? 'All day' : 'Specific hours'}
                    </span>
                  </div>

                  {!exception.isAllDay && (
                    <div className='space-y-3'>
                      {exception.timeSlots.map((timeSlot, index) => (
                        <div
                          key={timeSlot.id}
                          className='p-3 rounded-md bg-gray-50'
                        >
                          <div className='flex justify-between items-center mb-2'>
                            <span className='text-xs text-gray-500'>
                              Time Slot {index + 1}
                            </span>
                            <button
                              onClick={() =>
                                handleRemoveTimeSlot(exception.id, timeSlot.id)
                              }
                              className='text-red-500 text-xs font-semibold hover:text-red-700'
                            >
                              Delete
                            </button>
                          </div>
                          <div className='flex items-center justify-between gap-2'>
                            <div className='flex-1'>
                              <p className='text-xs text-gray-500 mb-1'>
                                Start Time
                              </p>
                              <TimeDropdown
                                value={timeSlot.startTime}
                                onChange={(value) =>
                                  handleTimeSlotChange(
                                    exception.id,
                                    timeSlot.id,
                                    'startTime',
                                    value
                                  )
                                }
                                options={timeOptions}
                              />
                            </div>
                            <p className='text-xs text-gray-500 mt-5'>to</p>
                            <div className='flex-1'>
                              <p className='text-xs text-gray-500 mb-1'>
                                End Time
                              </p>
                              <TimeDropdown
                                value={timeSlot.endTime}
                                onChange={(value) =>
                                  handleTimeSlotChange(
                                    exception.id,
                                    timeSlot.id,
                                    'endTime',
                                    value
                                  )
                                }
                                options={timeOptions}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddTimeSlot(exception.id)}
                        className='flex items-center gap-1 text-secondary text-sm font-semibold mt-2 underline'
                      >
                        Add Time Slot
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
