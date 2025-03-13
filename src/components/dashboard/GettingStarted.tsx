import Header from '../header/Header';

const GettingStarted = () => {
  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <div className='flex-1 p-6'>
        <h1 className='text-2xl font-bold text-primary'>Getting Started</h1>
        {/* Add your getting started content here */}
      </div>
    </div>
  );
};

export default GettingStarted;
