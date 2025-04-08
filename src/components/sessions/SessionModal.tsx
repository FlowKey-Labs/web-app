import { useForm, Controller, FormProvider } from 'react-hook-form';
import Button from '../common/Button';
import DropdownSelectInput from '../common/Dropdown';
import Input from '../common/Input';
import { useState } from 'react';
import cancelIcon from '../../assets/icons/cancel.svg';
import { categoryOptions, repeatDays } from '../../utils/dummyData';
import ChevronUp from '../../assets/icons/up.svg';
import ChevronDown from '../../assets/icons/down.svg';
import {
  classTypes,
  repetition,
  assignStaff,
  selectClient,
  selectClass,
  assignCoach,
} from '../../utils/dummyData';
import DropDownMenu from '../common/DropdownMenu';
import { Tooltip } from '@mantine/core';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  classType: string;
  className: string;
  date: string;
  startTime: string;
  endTime: string;
  repetition: string;
  spots: string;
  assignedStaff: string;
  clients: string[];
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  selectedClass: string;
  assignedCoach: string;
}

const ClassesModal = ({ isOpen, onClose }: ClassModalProps) => {
  const methods = useForm<FormData>({
    mode: 'onSubmit',
    defaultValues: {
      classType: '',
      className: '',
      date: '',
      startTime: '',
      endTime: '',
      repetition: '',
      spots: '',
      assignedStaff: '',
      selectedClass: '',
      assignedCoach: '',
    },
  });

  const [isCustomRepetitionModalOpen, setIsCustomRepetitionModalOpen] =
    useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [view, setView] = useState<'class' | 'appointment'>('class');
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);
  const [endsOption, setEndsOption] = useState<'never' | 'on' | 'after'>(
    'never'
  );
  const [occurrences, setOccurrences] = useState(4);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory((prev) => (prev === category ? null : category));
  };

  const handleWeekdayClick = (weekday: string) => {
    setSelectedWeekdays((prev) =>
      prev.includes(weekday)
        ? prev.filter((day) => day !== weekday)
        : [...prev, weekday]
    );
  };

  const handleEndsOptionChange = (option: 'never' | 'on' | 'after') => {
    setEndsOption(option);
  };

  const handleOccurrencesChange = (delta: number) => {
    setOccurrences((prev) => Math.max(1, prev + delta));
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Create class session data with repetition details if custom repetition is selected
      const classSession = {
        ...data,
        repetitionDetails:
          data.repetition === 'custom'
            ? {
                weekdays: selectedWeekdays,
                endsOption,
                occurrences: endsOption === 'after' ? occurrences : undefined,
                endDate: endsOption === 'on' ? data.date : undefined,
              }
            : undefined,
      };

      console.log('Class session created:', classSession);

      // Close modal and reset form
      onClose();
      methods.reset();
      setSelectedWeekdays([]);
      setEndsOption('never');
      setOccurrences(4);
      setView('class');
    } catch (error) {
      console.error('Error creating class session:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end'
      onClick={onClose}
    >
      <div
        className='w-2/3 h-screen bg-white p-4 flex flex-col items-center overflow-y-auto'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='absolute top-4 right-4'>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100'
          >
            <img src={cancelIcon} alt='Cancel' className='w-6 h-6' />
          </button>
        </div>

        <div className='w-[90%] h-full flex flex-col'>
          <h3 className='px-8 mt-4 text-primary font-bold text-[24px]'>
            New Session
          </h3>
          <div className='flex gap-4 pt-8 px-8'>
            <button
              type='button'
              className={`px-6 py-2 ${
                view === 'class' ? 'bg-[#1D9B5E33]' : 'bg-gray-100'
              } text-primary font-medium rounded-lg hover:opacity-90 transition-opacity w-[120px] text-sm`}
              onClick={() => setView('class')}
            >
              Class
            </button>
            <Tooltip
              label='Coming Soon'
              position='bottom'
              withArrow
              arrowSize={10}
              color='#1D9B5E'
            >
              <button
                type='button'
                className={`px-6 py-2 ${
                  view === 'appointment' ? 'bg-[#1D9B5E33]' : 'bg-gray-100'
                } text-primary font-medium rounded-lg hover:opacity-90 transition-opacity w-[120px] text-sm`}
                // onClick={() => setView('appointment')}
              >
                Appointment
              </button>
            </Tooltip>
          </div>
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className='flex-1 flex flex-col'
            >
              <div className='flex-1 p-8'>
                {view === 'class' ? (
                  <div className='space-y-4'>
                    <h3 className='text-lg font-bold text-gray-700'>
                      Class Details
                    </h3>
                    <div className='space-y-6'>
                      <div className='flex flex-col'>
                        <Controller
                          name='classType'
                          control={methods.control}
                          render={({ field }) => (
                            <DropdownSelectInput
                              {...field}
                              label='Class Type'
                              placeholder='Select Class Type'
                              options={classTypes.map((item) => ({
                                label: item.label,
                                value: item.value,
                              }))}
                              onSelectItem={(selectedItem) =>
                                field.onChange(selectedItem)
                              }
                            />
                          )}
                        />
                        <Controller
                          name='className'
                          control={methods.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              label='Class Name'
                              placeholder='Enter Class Name'
                            />
                          )}
                        />
                        <div className='flex justify-between mt-4 text-sm text-primary'>
                          {categoryOptions.map((category) => (
                            <button
                              key={category}
                              className={`flex justify-center items-center cursor-pointer w-[133px] h-[43px] bg-cardsBg text-center rounded-lg ${
                                selectedCategory === category
                                  ? 'ring-1 ring-secondary'
                                  : ''
                              }`}
                              onClick={() => handleCategoryClick(category)}
                            >
                              <p className='font-bold'>{category}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className='space-y-4'>
                        <h3 className='text-lg font-bold text-gray-700'>
                          Class Schedule
                        </h3>
                        <div className='w-full'>
                          <Controller
                            name='date'
                            control={methods.control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type='date'
                                label='Date'
                                placeholder='2020/12/12'
                                containerClassName='mb-4'
                              />
                            )}
                          />
                          <div className='grid grid-cols-2 gap-4'>
                            <Controller
                              name='startTime'
                              control={methods.control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type='time'
                                  label='Start Time'
                                  placeholder='12:00 PM'
                                />
                              )}
                            />
                            <Controller
                              name='endTime'
                              control={methods.control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type='time'
                                  label='End Time'
                                  placeholder='12:00 PM'
                                />
                              )}
                            />
                          </div>
                        </div>
                        <Controller
                          name='repetition'
                          control={methods.control}
                          render={({ field }) => (
                            <div>
                              <DropdownSelectInput
                                {...field}
                                label='Set Repetition'
                                placeholder='Does not repeat'
                                options={repetition.map((item) => ({
                                  label: item.label,
                                  value: item.value,
                                }))}
                                onSelectItem={(selectedItem) => {
                                  field.onChange(selectedItem);
                                  if (selectedItem.value === 'custom') {
                                    setIsCustomRepetitionModalOpen(true);
                                  }
                                }}
                              />
                              <DropDownMenu
                                dropDownPosition='center-screen'
                                show={isCustomRepetitionModalOpen}
                                setShow={setIsCustomRepetitionModalOpen}
                              >
                                <div className='space-y-8 min-w-[300px] p-6'>
                                  <h3 className='text-lg font-bold text-gray-700'>
                                    Set Repetition
                                  </h3>

                                  <div className='space-y-2'>
                                    <p className='text-[16px] font-[400]'>
                                      Repeat On
                                    </p>
                                    <div className='flex gap-2'>
                                      {repeatDays.map((day) => (
                                        <button
                                          key={day}
                                          className={`h-10 w-10 rounded-full flex items-center justify-center p-4 text-xs ${
                                            selectedWeekdays.includes(day)
                                              ? 'bg-[#1D9B5E33]'
                                              : 'bg-cardsBg text-gray-700'
                                          }`}
                                          onClick={() =>
                                            handleWeekdayClick(day)
                                          }
                                        >
                                          {day}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div className='space-y-2'>
                                    <p className='text-[16px] font-[400]'>
                                      Ends
                                    </p>
                                    <div className='flex gap-8'>
                                      {['never', 'on', 'after'].map(
                                        (option) => (
                                          <label
                                            key={option}
                                            className='flex items-center gap-2'
                                          >
                                            <div className='relative flex items-center'>
                                              <input
                                                type='checkbox'
                                                checked={endsOption === option}
                                                onChange={() =>
                                                  handleEndsOptionChange(
                                                    option as
                                                      | 'never'
                                                      | 'on'
                                                      | 'after'
                                                  )
                                                }
                                                className='w-4 h-4 border-2 p-2 border-secondary focus:ring-2 focus:border-none focus:ring-secondary appearance-none rounded-full cursor-pointer bg-white'
                                              />
                                              <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                                                <div
                                                  className={`w-3 h-3 rounded-full transition-colors ${
                                                    endsOption === option
                                                      ? 'bg-secondary'
                                                      : 'bg-transparent'
                                                  }`}
                                                ></div>
                                              </div>
                                            </div>
                                            <span>
                                              {option.charAt(0).toUpperCase() +
                                                option.slice(1)}
                                            </span>
                                          </label>
                                        )
                                      )}
                                    </div>
                                  </div>

                                  {endsOption === 'on' && (
                                    <div className='flex justify-between gap-4'>
                                      <div className='flex justify-center items-center cursor-pointer w-[133px] h-[43px] bg-cardsBg text-center rounded-lg text-sm'>
                                        April 20, 2025
                                      </div>
                                    </div>
                                  )}
                                  {endsOption === 'after' && (
                                    <div className='flex justify-between gap-4'>
                                      <div className='flex items-center gap-2'>
                                        <span className='flex justify-center items-center cursor-pointer w-[133px] h-[43px] bg-cardsBg text-center rounded-lg text-sm'>
                                          {occurrences} occurrences
                                        </span>
                                        <div className='flex flex-col'>
                                          <button
                                            onClick={() =>
                                              handleOccurrencesChange(1)
                                            }
                                            className='p-1 rounded-full hover:bg-gray-100'
                                          >
                                            <img
                                              src={ChevronUp}
                                              alt='increase'
                                              className='w-4 h-4'
                                            />
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleOccurrencesChange(-1)
                                            }
                                            className='p-1 rounded-full hover:bg-gray-100'
                                          >
                                            <img
                                              src={ChevronDown}
                                              alt='decrease'
                                              className='w-4 h-4'
                                            />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <div className='flex justify-end gap-2 mt-6'>
                                    <Button
                                      variant='subtle'
                                      color='#0F2028'
                                      onClick={() =>
                                        setIsCustomRepetitionModalOpen(false)
                                      }
                                    >
                                      Close
                                    </Button>
                                    <Button
                                      color='#1D9B5E'
                                      radius='md'
                                      onClick={() =>
                                        setIsCustomRepetitionModalOpen(false)
                                      }
                                    >
                                      Save
                                    </Button>
                                  </div>
                                </div>
                              </DropDownMenu>
                            </div>
                          )}
                        />
                        <div className='flex justify-between items-center gap-4'>
                          <Controller
                            name='spots'
                            control={methods.control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                label='Spots Available'
                                placeholder='Enter '
                              />
                            )}
                          />
                          <div className='w-full mt-4'>
                            <Controller
                              name='assignedStaff'
                              control={methods.control}
                              render={({ field }) => (
                                <DropdownSelectInput
                                  {...field}
                                  label='Assign Staff'
                                  placeholder='Select'
                                  options={assignStaff.map((item) => ({
                                    label: item.label,
                                    value: item.value,
                                  }))}
                                  onSelectItem={(selectedItem) =>
                                    field.onChange(selectedItem)
                                  }
                                />
                              )}
                            />
                          </div>
                        </div>
                      </div>
                      <Controller
                        name='clients'
                        control={methods.control}
                        render={({ field }) => (
                          <DropdownSelectInput
                            {...field}
                            label='Clients'
                            placeholder='Select Clients'
                            singleSelect={false}
                            options={selectClient.map((item) => ({
                              label: item.label,
                              value: item.value,
                            }))}
                            onSelectItem={(selectedItem) =>
                              field.onChange(selectedItem)
                            }
                          />
                        )}
                      />
                    </div>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {/* <div className='space-y-6'>
                      <div className='space-y-4'>
                        <h3 className='text-lg font-bold text-gray-700'>
                          Client Information
                        </h3>
                        <Controller
                          name='clientName'
                          control={methods.control}
                          render={({ field }) => (
                            <DropdownSelectInput
                              {...field}
                              label='Name'
                              placeholder='Select or Create Client'
                              options={selectClient.map((item) => ({
                                label: item.label,
                                value: item.value,
                              }))}
                              onSelectItem={(selectedItem) =>
                                field.onChange(selectedItem)
                              }
                            />
                          )}
                        />
                        <div className='flex justify-between gap-4'>
                          <Controller
                            name='clientEmail'
                            control={methods.control}
                            rules={{
                              required: 'Email is required',
                              pattern: {
                                value:
                                  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address',
                              },
                            }}
                            render={({ field }) => (
                              <Input
                                {...field}
                                label='Email'
                                placeholder='Enter Email'
                                type='email'
                              />
                            )}
                          />
                          <Controller
                            name='clientPhone'
                            control={methods.control}
                            rules={{
                              pattern: {
                                value:
                                  /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im,
                                message: 'Invalid phone number',
                              },
                            }}
                            render={({ field }) => (
                              <Input
                                {...field}
                                label='Phone'
                                placeholder='Enter Phone Number'
                              />
                            )}
                          />
                        </div>
                      </div>
                      <div className='space-y-4'>
                        <h3 className='text-lg font-bold text-gray-700'>
                          Appointment Details
                        </h3>
                        <Controller
                          name='date'
                          control={methods.control}
                          rules={{ required: true }}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              {...field}
                              type='date'
                              label='Date'
                              placeholder='2020/12/12'
                            />
                          )}
                        />
                        <div className='grid grid-cols-2 gap-4'>
                          <Controller
                            name='startTime'
                            control={methods.control}
                            rules={{ required: true }}
                            render={({ field, fieldState: { error } }) => (
                              <Input
                                {...field}
                                type='time'
                                label='Start Time'
                                placeholder='12:00 PM'
                              />
                            )}
                          />
                          <Controller
                            name='endTime'
                            control={methods.control}
                            rules={{ required: true }}
                            render={({ field, fieldState: { error } }) => (
                              <Input
                                {...field}
                                type='time'
                                label='End Time'
                                placeholder='12:00 PM'
                              />
                            )}
                          />
                        </div>
                        <Controller
                          name='selectedClass'
                          control={methods.control}
                          rules={{ required: true }}
                          render={({ field, fieldState: { error } }) => (
                            <DropdownSelectInput
                              {...field}
                              label='Select a Class'
                              placeholder='Select Class'
                              options={selectClass.map((item) => ({
                                label: item.label,
                                value: item.value,
                              }))}
                              onSelectItem={(selectedItem) =>
                                field.onChange(selectedItem)
                              }
                            />
                          )}
                        />
                        <Controller
                          name='assignedCoach'
                          control={methods.control}
                          rules={{ required: true }}
                          render={({ field, fieldState: { error } }) => (
                            <DropdownSelectInput
                              {...field}
                              label='Assign Coach'
                              placeholder='Select Coach'
                              options={assignCoach.map((item) => ({
                                label: item.label,
                                value: item.value,
                              }))}
                              onSelectItem={(selectedItem) =>
                                field.onChange(selectedItem)
                              }
                            />
                          )}
                        />
                      </div>
                    </div> */}
                  </div>
                )}
              </div>

              <div className=' bottom-0 py-4'>
                <div className='flex justify-end gap-4 pr-8'>
                  <Button
                    type='submit'
                    color='#1D9B5E'
                    radius='8px'
                    disabled={methods.formState.isSubmitting}
                    onClick={methods.handleSubmit(onSubmit)}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default ClassesModal;
