import { FlowKeyIcon } from '../../assets/icons';
import { menuItems, bottomMenuItems } from '../utils/dummyData';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeItem: string;
}

const Sidebar = ({ activeItem }: SidebarProps) => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen flex flex-col min-w-[230px] bg-[#ffffff] py-6 h-screen overflow-y-auto'>
      <div className='flex justify-center items-center mb-6'>
        <h3
          className='flex items-center gap-2 px-6 cursor-pointer transition-opacity hover:opacity-90'
          onClick={() => navigate('/dashboard')}
        >
          <FlowKeyIcon className='w-[33px] h-[29px]' />
          <span className='font-[900] text-[24px] text-primary'>FlowKey</span>
        </h3>
      </div>

      <div className='flex-1 overflow-y-auto'>
        <div className='flex flex-col items-center'>
          <ul className='gap-2 flex flex-col w-[90%] items-center'>
            {menuItems.map((item) => {
              const isActive = activeItem === item.name.toLowerCase();
              const IconComponent = isActive ? item.iconWhite : item.icon;
              return (
                <li
                  key={item.name}
                  onClick={() => navigate(`/${item.name.toLowerCase()}`)}
                  className={`flex items-center cursor-pointer w-[168px] h-[35px] rounded-lg px-4 text-[14px] transition-colors hover:opacity-90 ${
                    isActive ? 'bg-secondary text-white' : 'text-[#6D7172]'
                  }`}
                >
                  <div className='relative w-full flex items-center justify-center -ml-8'>
                    <div className='absolute left-1/2 -translate-x-full pr-[16px]'>
                      <IconComponent className='w-[20px] h-[20px]' />
                    </div>
                    <div className='absolute left-1/2 translate-x-0'>
                      <span className='text-[14px] font-[400]'>
                        {item.name}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className='mt-auto flex flex-col items-center pb-6'>
        <div className='h-[1px] w-[80%] mb-2 bg-gray-400'></div>
        <ul className='gap-2 flex flex-col w-[90%] items-center'>
          {bottomMenuItems.map((item) => {
            const isActive = activeItem === item.name.toLowerCase();
            const IconComponent = isActive ? item.iconWhite : item.icon;
            return (
              <li
                key={item.name}
                onClick={() => navigate(`/${item.name.toLowerCase()}`)}
                className={`flex items-center cursor-pointer w-[168px] h-[35px] rounded-lg px-4 text-[14px] transition-colors hover:opacity-90 ${
                  isActive ? 'bg-secondary text-white' : 'text-[#6D7172]'
                }`}
              >
                <div className='relative w-full flex items-center justify-center -ml-8'>
                  <div className='absolute left-1/2 -translate-x-full pr-[16px]'>
                    <IconComponent className='w-[20px] h-[20px]' />
                  </div>
                  <div className='absolute left-1/2 translate-x-0'>
                    <span className='text-[14px] font-[400]'>{item.name}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
