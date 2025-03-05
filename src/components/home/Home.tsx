import Header from '../header/Header';
import Sidebar from '../sidebar/Sidebar';

const Home = () => {
  return (
    <div className='flex bg-[#F5F5F5]'>
      <Sidebar />
      <div className='flex-1'>
        <Header />
      </div>
    </div>
  );
};

export default Home;
