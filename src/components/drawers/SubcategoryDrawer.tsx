import { useEffect, useState } from 'react';
import { Drawer, Button, Group, Switch, NumberInput, Text, Card, Stack, Divider, Alert } from '@mantine/core';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { notifications } from '@mantine/notifications';
import { IconCoins, IconClock, IconInfoCircle, IconCheck } from '@tabler/icons-react';

import Input from '../common/Input';
import { useUIStore } from '../../store/ui';
import {
  useGetSessionSubCategories,
  useCreateSessionSubCategory,
  useUpdateSessionSubCategory,
  useGetBusinessProfile,
} from '../../hooks/reactQuery';
import { getCurrencyPlaceholder } from '../../utils/stringUtils';

import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

interface Subcategory {
  id: number;
  name: string;
  description?: string;
  category: number;
  is_service?: boolean;
  base_price?: number;
  default_duration?: number;
  min_duration?: number;
  max_duration?: number;
  price_per_minute?: number;
}

interface SubcategoryFormData {
  name: string;
  description?: string;
  category: number;
  is_service: boolean;
  base_price?: number;
  default_duration?: number;
  min_duration?: number;
  max_duration?: number;
  price_per_minute?: number;
}

interface SubcategoryDrawerProps {
  entityId?: number | string | null;
  isEditing?: boolean;
  extraData?: Record<string, unknown>;
  zIndex?: number;
}

export default function SubcategoryDrawer({ 
  entityId, 
  isEditing,
  extraData,
  zIndex
}: SubcategoryDrawerProps) {
  const { closeDrawer } = useUIStore();
  const [isService, setIsService] = useState(false);
  
  // Get business profile for currency info
  const { data: businessProfile } = useGetBusinessProfile();
  const currency = businessProfile?.currency || 'KSH';
  const currencySymbol = businessProfile?.currency_symbol || 'KSH';
  
  const methods = useForm<SubcategoryFormData>({
    defaultValues: {
      name: '',
      description: '',
      category: extraData?.categoryId || 0,
      is_service: false,
      base_price: 0,
      default_duration: 60,
      min_duration: 15,
      max_duration: 180,
      price_per_minute: 0,
    },
  });
  
  const { reset, handleSubmit, watch, setValue } = methods;
  const watchIsService = watch('is_service');
  
  const { data: subcategories, refetch } = useGetSessionSubCategories();
  const { mutateAsync: createSubcategory } = useCreateSessionSubCategory();
  const { mutateAsync: updateSubcategory } = useUpdateSessionSubCategory();

  useEffect(() => {
    setIsService(watchIsService);
    
    // Set default values when toggling to service
    if (watchIsService) {
      const currentValues = methods.getValues();
      if (!currentValues.base_price) setValue('base_price', 0);
      if (!currentValues.default_duration) setValue('default_duration', 60);
      if (!currentValues.min_duration) setValue('min_duration', 15);
      if (!currentValues.max_duration) setValue('max_duration', 180);
      if (!currentValues.price_per_minute) setValue('price_per_minute', 0);
    }
  }, [watchIsService, setValue, methods]);

  useEffect(() => {
    if (isEditing && entityId && subcategories) {
      const subcategoryToEdit = subcategories.find(
        (sub: Subcategory) => sub.id.toString() === entityId.toString()
      );
      
      if (subcategoryToEdit) {
        const formData = {
          name: subcategoryToEdit.name,
          description: subcategoryToEdit.description || '',
          category: subcategoryToEdit.category,
          is_service: subcategoryToEdit.is_service || false,
          base_price: subcategoryToEdit.base_price || 0,
          default_duration: subcategoryToEdit.default_duration || 60,
          min_duration: subcategoryToEdit.min_duration || 15,
          max_duration: subcategoryToEdit.max_duration || 180,
          price_per_minute: subcategoryToEdit.price_per_minute || 0,
        };
        reset(formData);
        setIsService(formData.is_service);
      }
    } else if (extraData?.categoryId) {
      reset({
        name: '',
        description: '',
        category: extraData.categoryId,
        is_service: false,
        base_price: 0,
        default_duration: 60,
        min_duration: 15,
        max_duration: 180,
        price_per_minute: 0,
      });
    }
  }, [entityId, isEditing, subcategories, reset, extraData]);

  const onSubmit = async (formData: SubcategoryFormData) => {
    try {
      // Prepare submit data with proper service field handling
      const submitData: SubcategoryFormData = {
        name: formData.name,
        description: formData.description || '',
        category: formData.category || (extraData?.categoryId as number) || 0,
        is_service: formData.is_service,
        base_price: formData.is_service ? (formData.base_price || 0) : undefined,
        default_duration: formData.is_service ? (formData.default_duration || 60) : undefined,
        min_duration: formData.is_service ? (formData.min_duration || 15) : undefined,
        max_duration: formData.is_service ? (formData.max_duration || 180) : undefined,
        price_per_minute: formData.is_service ? (formData.price_per_minute || 0) : undefined,
      };

      if (isEditing && entityId) {
        await updateSubcategory({ 
          id: Number(entityId),
          ...submitData 
        });
        
        notifications.show({
          title: 'Success',
          message: 'Subcategory updated successfully!',
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
      } else {
        await createSubcategory(submitData);
        
        notifications.show({
          title: 'Success',
          message: 'Subcategory created successfully!',
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
      }
      
      await refetch();
      closeDrawer();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save subcategory. Please try again.',
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
    }
  };

  useEffect(() => {
    return () => {
      refetch();
    };
  }, [refetch]);

  return (
    <Drawer
      opened={true}
      onClose={closeDrawer}
      title={
        <Text size="xl" fw={600} className="text-gray-800">
          {isEditing ? 'Edit Subcategory' : 'Add New Subcategory'}
        </Text>
      }
      position='right'
      size='lg'
      padding='xl'
      zIndex={zIndex}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {/* Basic Information */}
          <div className="space-y-4">
            <Controller
              name='name'
              control={methods.control}
              rules={{ required: 'Subcategory name is required' }}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label='Subcategory Name'
                  placeholder='Enter subcategory name'
                  error={fieldState.error?.message}
                  containerClassName='mb-0'
                />
              )}
            />
            
            <Controller
              name='description'
              control={methods.control}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  type='textarea'
                  rows={3}
                  label='Description'
                  placeholder='Enter subcategory description'
                  error={fieldState.error?.message}
                  containerClassName='mb-0'
                />
              )}
            />
          </div>

          <Divider />

          {/* Service Configuration Toggle */}
          <Card withBorder radius="lg" p="lg" className="bg-gradient-to-br from-blue-50 to-indigo-50">
            <Controller
              name='is_service'
              control={methods.control}
              render={({ field }) => (
                <div className='space-y-3'>
                  <Switch
                    label={
                      <div>
                        <Text fw={600} size="md" className="text-gray-800">
                          Is this a bookable service?
                        </Text>
                        <Text size="sm" c="dimmed" mt={4}>
                          Enable this for appointment-based services with pricing and duration
                        </Text>
                      </div>
                    }
                    checked={field.value}
                    onChange={(event) => {
                      field.onChange(event.currentTarget.checked);
                      setIsService(event.currentTarget.checked);
                    }}
                    color='green'
                    size='md'
                    thumbIcon={
                      field.value ? (
                        <IconCheck
                          style={{ width: 12, height: 12 }}
                          color='white'
                          stroke={3}
                        />
                      ) : null
                    }
                  />
                </div>
              )}
            />
          </Card>



          {/* Service Configuration Section */}
          {isService && (
            <Card 
              withBorder 
              radius="xl" 
              p="xl" 
              className='bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50 border-green-200 shadow-md'
            >
              {/* Header */}
              <div className='flex items-center gap-3 mb-6'>
                <div className='p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md'>
                  <IconCoins size={20} className='text-white' />
                </div>
                <div>
                  <Text fw={600} size="lg" className='text-gray-800'>
                    Service Configuration
                  </Text>
                  <Text size="sm" c="dimmed" className="mt-0.5">
                    Define pricing and duration for this bookable service
                  </Text>
                </div>
              </div>
              
              <Stack gap="xl">
                {/* Pricing Section */}
                <div className='space-y-4'>
                  <div className='flex items-center gap-2 mb-4'>
                    <div className='p-1.5 bg-green-100 rounded-md'>
                      <IconCoins size={16} className='text-green-600' />
                    </div>
                    <Text fw={600} size="md" className='text-gray-700'>
                      Pricing Details
                    </Text>
                  </div>
                  
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <Controller
                      name='base_price'
                      control={methods.control}
                      rules={isService ? { 
                        required: 'Base price is required for services',
                        min: { value: 0, message: 'Price must be positive' }
                      } : {}}
                      render={({ field, fieldState }) => (
                        <div className='space-y-3'>
                          <Text fw={500} size="sm" className="mb-2">
                            Base Price ({currency})
                          </Text>
                          <NumberInput
                            {...field}
                            placeholder={getCurrencyPlaceholder(currency, currencySymbol)}
                            min={0}
                            max={999999}
                            allowNegative={false}
                            allowDecimal={true}
                            decimalScale={2}
                            thousandSeparator=','
                            leftSection={
                              <Text className='text-green-600 font-semibold text-sm'>
                                {currencySymbol}
                              </Text>
                            }
                            styles={{
                              input: { 
                                paddingLeft: '3.5rem',
                                fontSize: '16px',
                                fontWeight: 500,
                                border: fieldState.error ? '2px solid #ef4444' : '2px solid #e5e7eb',
                                borderRadius: '12px',
                                '&:focus': {
                                  borderColor: '#10b981',
                                  boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)',
                                }
                              },
                              label: { fontSize: '14px', fontWeight: 500, marginBottom: '8px' }
                            }}
                            radius="lg"
                            size="md"
                          />
                          {fieldState.error && (
                            <Text size="xs" c="red" className="mt-1">
                              {fieldState.error.message}
                            </Text>
                          )}
                        </div>
                      )}
                    />

                    <Controller
                      name='price_per_minute'
                      control={methods.control}
                      render={({ field, fieldState }) => (
                        <div className='space-y-2'>
                          <Text fw={500} size="sm" className="mb-2">
                            Price per Extra Minute ({currency})
                          </Text>
                         
                          <NumberInput
                            {...field}
                            placeholder='Optional'
                            min={0}
                            max={1000}
                            allowNegative={false}
                            allowDecimal={true}
                            decimalScale={2}
                            leftSection={
                              <Text className='text-green-600 font-semibold text-sm'>
                                {currencySymbol}
                              </Text>
                            }
                            styles={{
                              input: { 
                                paddingLeft: '3.5rem',
                                fontSize: '16px',
                                fontWeight: 500,
                                border: fieldState.error ? '2px solid #ef4444' : '2px solid #e5e7eb',
                                borderRadius: '12px',
                                '&:focus': {
                                  borderColor: '#10b981',
                                  boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)',
                                }
                              },
                              label: { fontSize: '14px', fontWeight: 500, marginBottom: '8px' }
                            }}
                            radius="lg"
                            size="md"
                          />
                          {fieldState.error && (
                            <Text size="xs" c="red" className="mt-1">
                              {fieldState.error.message}
                            </Text>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>

                <Divider color="green" opacity={0.3} />

                {/* Duration Section */}
                <div className='space-y-4'>
                  <div className='flex items-center gap-2 mb-4'>
                    <div className='p-1.5 bg-blue-100 rounded-md'>
                      <IconClock size={16} className='text-blue-600' />
                    </div>
                    <Text fw={600} size="md" className='text-gray-700'>
                      Duration Settings
                    </Text>
                  </div>
                  
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <Controller
                      name='default_duration'
                      control={methods.control}
                      rules={isService ? { 
                        required: 'Default duration is required for services',
                        min: { value: 5, message: 'Minimum 5 minutes' },
                        max: { value: 600, message: 'Maximum 600 minutes' }
                      } : {}}
                      render={({ field, fieldState }) => (
                        <div className='space-y-3'>
                          <Text fw={500} size="sm" className="mb-2">
                            Default Duration
                          </Text>
                          <NumberInput
                            {...field}
                            placeholder='60'
                            min={5}
                            max={600}
                            allowNegative={false}
                            allowDecimal={false}
                            rightSection={
                              <div className='flex items-center pr-4'>
                                <Text className='text-gray-500 font-medium text-sm'>
                                  min
                                </Text>
                              </div>
                            }
                            styles={{
                              input: { 
                                fontSize: '16px',
                                fontWeight: 500,
                                border: fieldState.error ? '2px solid #ef4444' : '2px solid #e5e7eb',
                                borderRadius: '12px',
                                paddingLeft: '18px',
                                paddingRight: '55px',
                                paddingTop: '14px',
                                paddingBottom: '14px',
                                '&:focus': {
                                  borderColor: '#3b82f6',
                                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                                }
                              }
                            }}
                            radius="lg"
                            size="md"
                          />
                          {fieldState.error && (
                            <Text size="xs" c="red" className="mt-2">
                              {fieldState.error.message}
                            </Text>
                          )}
                        </div>
                      )}
                    />

                    <Controller
                      name='min_duration'
                      control={methods.control}
                      render={({ field, fieldState }) => (
                        <div className='space-y-3'>
                          <Text fw={500} size="sm" className="mb-2">
                            Minimum Duration
                          </Text>
                          <NumberInput
                            {...field}
                            placeholder='15'
                            min={5}
                            max={300}
                            allowNegative={false}
                            allowDecimal={false}
                            rightSection={
                              <div className='flex items-center pr-4'>
                                <Text className='text-gray-500 font-medium text-sm'>
                                  min
                                </Text>
                              </div>
                            }
                            styles={{
                              input: { 
                                fontSize: '16px',
                                fontWeight: 500,
                                border: fieldState.error ? '2px solid #ef4444' : '2px solid #e5e7eb',
                                borderRadius: '12px',
                                paddingLeft: '18px',
                                paddingRight: '55px',
                                paddingTop: '14px',
                                paddingBottom: '14px',
                                '&:focus': {
                                  borderColor: '#3b82f6',
                                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                                }
                              }
                            }}
                            radius="lg"
                            size="md"
                          />
                          {fieldState.error && (
                            <Text size="xs" c="red" className="mt-2">
                              {fieldState.error.message}
                            </Text>
                          )}
                        </div>
                      )}
                    />

                    <Controller
                      name='max_duration'
                      control={methods.control}
                      render={({ field, fieldState }) => (
                        <div className='space-y-3'>
                          <Text fw={500} size="sm" className="mb-2">
                            Maximum Duration
                          </Text>
                          <NumberInput
                            {...field}
                            placeholder='180'
                            min={10}
                            max={600}
                            allowNegative={false}
                            allowDecimal={false}
                            rightSection={
                              <div className='flex items-center pr-4'>
                                <Text className='text-gray-500 font-medium text-sm'>
                                  min
                                </Text>
                              </div>
                            }
                            styles={{
                              input: { 
                                fontSize: '16px',
                                fontWeight: 500,
                                border: fieldState.error ? '2px solid #ef4444' : '2px solid #e5e7eb',
                                borderRadius: '12px',
                                paddingLeft: '18px',
                                paddingRight: '55px',
                                paddingTop: '14px',
                                paddingBottom: '14px',
                                '&:focus': {
                                  borderColor: '#3b82f6',
                                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                                }
                              }
                            }}
                            radius="lg"
                            size="md"
                          />
                          {fieldState.error && (
                            <Text size="xs" c="red" className="mt-2">
                              {fieldState.error.message}
                            </Text>
                          )}
                        </div>
                      )}
                    />
                  </div>
                  
                  <Alert 
                    icon={<IconInfoCircle size={16} />} 
                    title="Duration Guidelines" 
                    color="blue"
                    variant="light"
                    radius="lg"
                    className="mt-4"
                  >
                    <Text size="sm" className="leading-relaxed">
                      Set duration ranges to give clients flexibility. The default duration is what most clients 
                      will book, while min/max create booking boundaries.
                    </Text>
                  </Alert>
                </div>
              </Stack>
            </Card>
          )}

          {/* Actions */}
          <Group justify='flex-end' mt='xl' pt="lg" className="border-t border-gray-200">
            <Button 
              variant="light" 
              color="gray" 
              radius="lg" 
              size="md"
              onClick={closeDrawer}
            >
              Cancel
            </Button>
            <Button 
              type='submit' 
              color='green' 
              radius='lg' 
              size='md'
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {isEditing ? 'Update' : 'Add'} Subcategory
            </Button>
          </Group>
        </form>
      </FormProvider>
    </Drawer>
  );
} 