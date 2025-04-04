import plus from '../../assets/icons/servicesPlus.svg';
import { useGetBusinessServices } from '../../hooks/reactQuery';
import { BusinessServices } from '../../types/business';

const Services = () => {
  const {
    data: services = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetBusinessServices();

  if (isLoading) {
    return (
      <div className='w-full space-y-6 bg-white rounded-lg p-6'>
        <p className='text-primary'>Loading services...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='w-full space-y-6 bg-white rounded-lg p-6'>
        <div className='space-y-4'>
          <p className='text-red-500'>
            Error loading services: {error?.message}
          </p>
          <button
            onClick={() => refetch()}
            className='px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full space-y-6 bg-white rounded-lg p-6'>
      <div className='flex items-center'>
        <div className='space-y-2'>
          <h3 className='text-primary font-semibold text-sm'>
            Create New Services
          </h3>
          <p className='text-primary text-sm'>
            All Services ({services.length})
          </p>
        </div>
      </div>

      <div className='grid grid-cols-3 p-6 gap-5'>
        {services.map((service) => (
          <div
            key={service.id}
            className='flex items-center border-[1px] border-[#BAA7CB] rounded-md px-2 py-3 gap-4 cursor-pointer'
          >
            <div className='w-[80px] p-2 space-y-2 flex flex-col items-center bg-[#F7FBE3] '>
              <p className='text-primary text-xs'>
                {service.available_days.join(', ')}
              </p>
            </div>
            <div className='space-y-1'>
              <p className='text-primary font-semibold text-sm'>
                {service.title}
              </p>
              <p className='text-primary font-semibold text-xs'>
                {service.start_time} - {service.end_time}
              </p>
              <p className='text-primary text-xs'>
                {service.available_days.join(', ')}
              </p>
            </div>
          </div>
        ))}

        <div className='flex flex-col items-center justify-center border-[1px] border-[#BAA7CB] rounded-md p-1 gap-1 cursor-pointer'>
          <div className='rounded-full bg-[#F7FBE3] p-1'>
            <img src={plus} alt='Add new service' />
          </div>
          <p className='text-primary text-sm'>New service</p>
        </div>
      </div>
    </div>
  );
};

export default Services;
