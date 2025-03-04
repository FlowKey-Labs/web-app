import Header from '../header/Header';
import Sidebar from '../sidebar/Sidebar';

const Home = () => {
  return (
    <div className='flex'>
      <div className='w-[285px] bg-slate-100 h-screen'>
        <Sidebar />
      </div>
      <div>
        <Header />
      </div>
    </div>
  );
};

export default Home;
