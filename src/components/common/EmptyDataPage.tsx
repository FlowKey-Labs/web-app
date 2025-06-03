import React, { useEffect, useState } from 'react';
import emptyDataIcon from '../../assets/icons/empty.svg';
import { Modal, Button } from '@mantine/core';

interface EmptyDataPageProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  showButton?: boolean;
  icon?: string;
  className?: string;
  onClose?: () => void;
  opened?: boolean;
  filterType?: string;
  filterValue?: string;
}

const EmptyDataPage: React.FC<EmptyDataPageProps> = ({
  title = 'No records!',
  description = "You don't have any records yet",
  buttonText = 'Create New Session',
  onButtonClick,
  showButton = true,
  icon = emptyDataIcon,
  className = '',
  onClose,
  opened = true,
  filterType,
  filterValue,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => window.innerWidth <= 768;
    setIsMobile(checkIfMobile());

    const handleResize = () => {
      setIsMobile(checkIfMobile());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getFilteredDescription = () => {
    if (filterType && filterValue) {
      if (filterType === 'sessionType') {
        return `You don't have any sessions yet in ${filterValue} session type`;
      } else if (filterType === 'category') {
        return `You don't have any sessions yet in ${filterValue} category`;
      }
    }
    return description;
  };
  return (
    <Modal
      opened={opened}
      onClose={() => onClose?.()}
      title={null}
      centered
      withCloseButton={isMobile ? true : false}
      closeOnClickOutside={true}
      closeOnEscape={true}
      transitionProps={{ duration: 200 }}
      fullScreen={isMobile}
      size="auto"
      overlayProps={{
        opacity: 0.55,
        blur: 3,
        color: 'rgba(0, 0, 0, 0.5)',
      }}
      styles={{
        content: {
          width: 'auto',
          minWidth: '300px',
          padding: '1.5rem',
          borderRadius: '8px',
          position: 'relative',
        },
        body: {
          padding: 0,
        },
        overlay: {
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: isMobile ? '0px' : '230px',
          width: 'auto',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          pointerEvents: opened ? 'auto' : 'none',
        },
        root: {
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: isMobile ? '0' : '150px',
          width: 'auto',
          pointerEvents: opened ? 'auto' : 'none',
          zIndex: opened ? 1000 : -1,
        },
      }}
      classNames={{
        content: 'empty-data-content',
        root: className,
      }}
    >
      <div className="flex flex-col items-center justify-center text-center w-full h-full">
        <img
          src={icon}
          alt="Empty data"
          className="mb-3 w-16 h-16 sm:w-20 sm:h-20"
        />
        <p className="text-gray-700 text-lg sm:text-xl font-semibold">{title}</p>
        <p className="text-gray-500 text-sm sm:text-base mt-1 px-2">
          {getFilteredDescription()}
        </p>
        {showButton && onButtonClick && (
          <Button
            className="mt-4 w-full sm:w-auto"
            color="#1D9B5E"
            radius="xl"
            onClick={() => {
              onButtonClick();
              onClose?.();
            }}
          >
            {buttonText}
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default EmptyDataPage;
