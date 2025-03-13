import Header from '../headers/Header';

interface ComingSoonProps {
  title: string;
}

const ComingSoon = ({ title }: ComingSoonProps) => {
  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <div className='flex-1 p-6'>
        <h1 className='text-2xl font-bold text-primary mb-4'>{title}</h1>
        <div className='text-[#6D7172]'>Coming soon...</div>
      </div>
    </div>
  );
};

export default ComingSoon;
