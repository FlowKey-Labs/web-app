import { useEffect, useState } from 'react';
import { useUIStore } from '../../store/ui';
import AddSession from '../sessions/AddSession';
import UpdateSession from '../sessions/UpdateSession';
import { useGetSessionDetail } from '../../hooks/reactQuery';

interface SessionDrawerProps {
  entityId?: number | string | null;
  isEditing?: boolean;
  zIndex?: number;
}

/**
 * SessionDrawer component for creating or editing sessions
 * Uses the AddSession component for new sessions and UpdateSession for existing ones
 * Supports nested drawer functionality by passing zIndex to child components
 * Handles special context when opened from client drawer
 */
export default function SessionDrawer({ 
  entityId, 
  isEditing,
  zIndex = 1000
}: SessionDrawerProps) {
  const { closeDrawer, drawerStack } = useUIStore();
  const [sessionRefreshed, setSessionRefreshed] = useState(false);
  
  const parentDrawer = drawerStack.length > 1 
    ? drawerStack[drawerStack.length - 2] 
    : null;
  
  const isFromClientDrawer = parentDrawer?.type === 'client';
  
  const { data: sessionData, refetch } = useGetSessionDetail(
    isEditing && entityId ? entityId.toString() : ''
  );

  useEffect(() => {
    if (isEditing && entityId && !sessionRefreshed) {
      refetch();
      setSessionRefreshed(true);
    }
  }, [isEditing, entityId, refetch, sessionRefreshed]);

  const handleUpdateSuccess = () => {
    closeDrawer();
  };

  if (!isEditing) {
    return (
      <AddSession
        isOpen={true}
        onClose={closeDrawer}
        zIndex={zIndex}
        fromClientDrawer={isFromClientDrawer}
        pendingClientData={isFromClientDrawer ? parentDrawer?.extraData : undefined}
      />
    );
  }
  
  return (
    <UpdateSession
      isOpen={true}
      onClose={closeDrawer}
      sessionId={entityId?.toString() || ''}
      onUpdateSuccess={handleUpdateSuccess}
      zIndex={zIndex}
      fromClientDrawer={isFromClientDrawer}
      pendingClientData={isFromClientDrawer ? parentDrawer?.extraData : undefined}
    />
  );
} 