import { Loader } from '@mantine/core';

const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
      <Loader color="#1D9B5E" size="lg" />
    </div>
  );
};

export default LoadingScreen; 