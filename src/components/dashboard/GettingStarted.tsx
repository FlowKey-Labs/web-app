import Header from '../headers/Header';

const GettingStarted = () => {
  return (
    <div className='flex min-h-screen bg-[#0F2028]'>
      <div className='flex flex-col min-h-screen bg-white w-full rounded-l-[36px]'>
        <Header />
        <div className='flex-1 p-6'>
          <h1 className='text-2xl font-bold text-primary'>Getting Started</h1>
          {/* Add your getting started content here */}
        </div>
      </div>
    </div>
  );
};

export default GettingStarted;
