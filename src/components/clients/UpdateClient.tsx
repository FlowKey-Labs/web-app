import { useEffect } from 'react';
import { useUIStore } from "../../store/ui";

interface UpdateClientProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
}

/**
 * This component is now just a wrapper that opens the global client drawer in edit mode.
 * It's maintained for backward compatibility with existing code.
 */
const UpdateClient = ({ isOpen, onClose, clientId }: UpdateClientProps) => {
  const { openDrawer } = useUIStore();
  
  useEffect(() => {
    if (isOpen && clientId) {
      openDrawer({
        type: 'client',
        entityId: clientId,
        isEditing: true
      });
      
      // After opening the drawer, call onClose to clean up the local state
      onClose();
    }
  }, [isOpen, clientId, openDrawer, onClose]);
  
  // This component doesn't render anything visible
  // It just handles the opening of the global drawer
  return null;
};

export default UpdateClient;
