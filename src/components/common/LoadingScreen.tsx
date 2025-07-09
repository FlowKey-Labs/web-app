import { Loader, Text } from '@mantine/core';

const LoadingScreen = () => {
  console.log('🔄 LoadingScreen: Component rendered at', new Date().toISOString());
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FA]">
      <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
        <Loader color="#1D9B5E" size="xl" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
        <Text size="xs" className="mt-2 text-gray-400">
          Setting up your workspace
        </Text>
      </div>
    </div>
  );
};

export default LoadingScreen; 