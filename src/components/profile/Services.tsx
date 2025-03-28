import plus from '../../assets/icons/servicesPlus.svg';
import { services } from '../utils/dummyData';

const Services = () => {
  return (
    <div className='w-full space-y-6 bg-white rounded-lg p-6'>
      <div className='space-y-2'>
        <h3 className='text-primary font-semibold text-sm'>
          Create New Services
        </h3>
        <p className='text-primary text-sm'>All Services ({services.length})</p>
      </div>

      <div className='grid grid-cols-3 p-6 gap-5'>
        {services.map((service) => (
          <div
            key={service.id}
            className='flex items-center border-[1px] border-[#BAA7CB] rounded-md p-2 gap-4 cursor-pointer'
          >
            <div className='w-[80px] p-2 space-y-2 flex flex-col items-center bg-[#F7FBE3] '>
              <p className='text-primary text-xs'>{service.day}</p>
              <p className='text-primary font-semibold text-sm'>
                {service.date}
              </p>
            </div>
            <div className='space-y-1'>
              <p className='text-primary font-semibold text-sm'>
                {service.title}
              </p>
              <p className='text-primary font-semibold text-xs'>
                {service.time}
              </p>
              <p className='text-primary text-xs'>{service.schedule}</p>
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
