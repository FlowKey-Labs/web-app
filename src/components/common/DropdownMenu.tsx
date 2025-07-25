import { useRef, useEffect, PropsWithChildren, JSX } from 'react';

type Positions = 'left' | 'right' | 'center' | 'top' | 'center-screen';

type Props = {
  actionElement?: JSX.Element;
  dropDownPosition: Positions;
  className?: string;
  persistent?: boolean;
  setShow?: React.Dispatch<React.SetStateAction<boolean>>;
  show?: boolean;
};

const DropDownMenu = ({
  actionElement,
  dropDownPosition,
  className,
  persistent = false,
  children,
  show = false,
  setShow,
}: PropsWithChildren<Props>) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);

  const getPostion = (type: Positions) => {
    return {
      left: 'left-0',
      right: 'right-0',
      center: 'left-1/2 transform -translate-x-1/2',
      top: '-top-0',
      'center-screen': 'fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2'
    }[type];
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        !persistent &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        e.stopPropagation();
        setShow?.(false);
      }
    };

    document.addEventListener('click', handleOutsideClick, true);

    return () => {
      document.removeEventListener('click', handleOutsideClick, true);
    };
  }, [persistent, setShow]);

  const handleBtnClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShow?.(!show);
  };

  return (
    <div className='relative w-full'>
      <div ref={btnRef} onClick={handleBtnClick}>
        {actionElement}
      </div>
      {show && (
        <>
          {dropDownPosition === 'center-screen' && (
            <div className='fixed inset-0 bg-black bg-opacity-50 z-50' onClick={() => setShow?.(false)} />
          )}
          <div
            ref={menuRef}
            id='dropdown'
            className={`${dropDownPosition === 'center-screen' ? '' : 'absolute top-11 mt-1'} ${getPostion(dropDownPosition)} ${dropDownPosition === 'center-screen' ? 'z-50' : 'z-10'}
            divide-y divide-gray-100 rounded-md bg-white shadow-[0px_0px_10px_rgba(0,0,0,0.25)] transition-all duration-500 ease-in-out ${
              className || ''
            }`}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
};

export default DropDownMenu;
