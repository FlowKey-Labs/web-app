import { useForm, Controller, FormProvider } from 'react-hook-form';
import Button from '../common/Button';
import DropdownSelectInput from '../common/Dropdown';
import Input from '../common/Input';
import { useState } from 'react';
import Modal from '../common/Modal';

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
  sports: string;
  assignedStaff: string;
  clients: string[];
}

const ClassesModal = ({ isOpen, onClose }: ClassModalProps) => {
  const methods = useForm<FormData>();
  const [isClassTypeModalOpen, setIsClassTypeModalOpen] = useState(false);
  const [modalContentType, setModalContentType] = useState<
    'class' | 'appointment'
  >('class');

  const onSubmit = (data: FormData) => {};

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end'
      onClick={onClose}
    >
      <div
        className='w-2/3 h-full bg-white p-4 flex flex-col items-center overflow-hidden'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='absolute top-4 right-4'>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 transition-colors'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <div className='w-[90%]'>
          <div className='flex gap-4 pt-8 px-8'>
            <button
              type='button'
              className='px-6 py-2 bg-flowkeySecondary text-primary font-medium rounded-lg hover:opacity-90 transition-opacity w-[120px] text-sm'
              aria-pressed='true'
              onClick={() => {
                setModalContentType('class');
                setIsClassTypeModalOpen(true);
              }}
            >
              Class
            </button>
            <button
              type='button'
              className='px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors w-[120px] text-sm'
              aria-pressed='false'
              onClick={() => {
                setModalContentType('appointment');
                setIsClassTypeModalOpen(true);
              }}
            >
              Appointment
            </button>
          </div>
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className='flex-1 p-8 w-full overflow-y-auto'
            >
              <div className='space-y-4'>
                {/* Class Details */}
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
                            options={[
                              { value: 'regular', label: 'Regular Class' },
                              { value: 'private', label: 'Private Class' },
                              { value: 'workshop', label: 'Workshop' },
                            ]}
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
                            focusColor='flowkeySecondary'
                          />
                        )}
                      />
                      <div className='flex justify-between mt-4 text-sm text-primary '>
                        <div className='flex justify-center items-center cursor-pointer w-[133px] h-[43px] bg-cardsBg text-center rounded-lg'>
                          <p className=' font-bold'>STARfish</p>
                        </div>
                        <div className='flex justify-center items-center cursor-pointer w-[133px] h-[43px] bg-cardsBg text-center rounded-lg'>
                          <p className=' font-bold'>STAnley</p>
                        </div>
                        <div className='flex justify-center items-center cursor-pointer w-[133px] h-[43px] bg-cardsBg text-center rounded-lg'>
                          <p className=' font-bold'>Grade</p>
                        </div>
                        <div className='flex justify-center items-center cursor-pointer w-[133px] h-[43px] bg-cardsBg text-center rounded-lg'>
                          <p className=' font-bold'>Advanced</p>
                        </div>
                        <div className='flex justify-center items-center cursor-pointer w-[133px] h-[43px] bg-cardsBg text-center rounded-lg'>
                          <p className=' font-bold'>Platinum</p>
                        </div>
                      </div>
                    </div>
                    <div className='space-y-4'>
                      <h3 className='text-lg font-bold text-gray-700'>
                        Class Schedule
                      </h3>
                      <Controller
                        name='date'
                        control={methods.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type='date'
                            label='Date'
                            placeholder='Select Date'
                            focusColor='flowkeySecondary'
                          />
                        )}
                      />
                      <div className='flex justify-between gap-4'>
                        <Controller
                          name='startTime'
                          control={methods.control}
                          render={({ field }) => (
                            <div className='w-[250px]'>
                              <Input
                                {...field}
                                type='time'
                                label='Start Time'
                                placeholder='Select Start Time'
                                className='w-full'
                                focusColor='flowkeySecondary'
                              />
                            </div>
                          )}
                        />
                        <Controller
                          name='endTime'
                          control={methods.control}
                          render={({ field }) => (
                            <div className='w-[250px]'>
                              <Input
                                {...field}
                                type='time'
                                label='End Time'
                                placeholder='Select End Time'
                                focusColor='flowkeySecondary'
                                className='w-[200px]'
                              />
                            </div>
                          )}
                        />
                      </div>
                      <Controller
                        name='repetition'
                        control={methods.control}
                        render={({ field }) => (
                          <DropdownSelectInput
                            {...field}
                            label='Set Repetition'
                            placeholder='Do not repeat'
                            options={[
                              { value: 'none', label: 'None' },
                              { value: 'daily', label: 'Daily' },
                              { value: 'weekly', label: 'Weekly' },
                              { value: 'monthly', label: 'Monthly' },
                            ]}
                            onSelectItem={(selectedItem) =>
                              field.onChange(selectedItem)
                            }
                          />
                        )}
                      />
                      <div className='flex justify-between gap-4'>
                        <Controller
                          name='sports'
                          control={methods.control}
                          render={({ field }) => (
                            <DropdownSelectInput
                              {...field}
                              label='Sports Available'
                              placeholder='Enter'
                              options={[
                                { value: 'yoga', label: 'Yoga' },
                                { value: 'pilates', label: 'Pilates' },
                                { value: 'boxing', label: 'Boxing' },
                                { value: 'swimming', label: 'Swimming' },
                              ]}
                              onSelectItem={(selectedItem) =>
                                field.onChange(selectedItem)
                              }
                            />
                          )}
                        />
                        <Controller
                          name='assignedStaff'
                          control={methods.control}
                          render={({ field }) => (
                            <DropdownSelectInput
                              {...field}
                              label='Assign Staff'
                              placeholder='Select'
                              options={[
                                { value: 'john', label: 'John Doe' },
                                { value: 'jane', label: 'Jane Smith' },
                                { value: 'mike', label: 'Mike Johnson' },
                              ]}
                              onSelectItem={(selectedItem) =>
                                field.onChange(selectedItem)
                              }
                            />
                          )}
                        />
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
                          isMulti
                          options={[
                            { value: 'client1', label: 'Client 1' },
                            { value: 'client2', label: 'Client 2' },
                            { value: 'client3', label: 'Client 3' },
                          ]}
                          onSelectItem={(selectedItem) =>
                            field.onChange(selectedItem)
                          }
                        />
                      )}
                    />
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='flex justify-end gap-4'>
                    <Button type='submit' color='#1D9B5E' radius='8px'>
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
      <Modal
        isOpen={isClassTypeModalOpen}
        onClose={() => setIsClassTypeModalOpen(false)}
      >
        <div className='space-y-4'>
          <h3 className='text-lg font-bold text-gray-700'>
            {modalContentType === 'class'
              ? 'Select Class Type'
              : 'Select Category'}
          </h3>

          {modalContentType === 'class' ? (
            <div>
              <div className='flex flex-wrap gap-4 mt-4'>
                <button className='w-[calc(33.33%-12px)] px-2 py-1 border rounded-full border-gray-400 transition-colors'>
                  Trial
                </button>
                <button className='w-[calc(33.33%-12px)] px-2 py-1 border rounded-full border-gray-400  transition-colors'>
                  Makeup
                </button>
                <button className='w-[calc(33.33%-12px)] px-2 py-1 border rounded-full border-gray-400  transition-colors'>
                  Normal
                </button>
              </div>
              <div className='pt-16'>
                <p className='text-gray-400 text-sm'>
                  *You can choose multiple Class types
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className='flex flex-wrap gap-4 mt-4'>
                <button className='w-[calc(33.33%-12px)] px-2 py-1 border rounded-full border-gray-400  transition-colors'>
                  STARfish
                </button>
                <button className='w-[calc(33.33%-12px)] px-2 py-1 border rounded-full border-gray-400  transition-colors'>
                  STAnley
                </button>
                <button className='w-[calc(33.33%-12px)] px-2 py-1 border rounded-full border-gray-400  transition-colors'>
                  Grade
                </button>
                <button className='w-[calc(33.33%-12px)] px-2 py-1 border rounded-full border-gray-400  transition-colors'>
                  Advanced
                </button>
                <button className='w-[calc(33.33%-12px)] px-2 py-1 border rounded-full border-gray-400  transition-colors'>
                  Platinum
                </button>
              </div>
              <div className='pt-16'>
                <p className='text-gray-400 text-sm'>
                  *You can choose multiple Categories
                </p>
              </div>
            </div>
          )}

          <div className='flex justify-center mt-6'>
            <button
              className='px-6 py-2 bg-black rounded-lg font-semibold text-sm text-white transition-colors'
              onClick={() => setIsClassTypeModalOpen(false)}
            >
              Apply Now
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClassesModal;
