import { useEffect } from 'react';
import { useUIStore } from "../../store/ui";

interface UpdateClientProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
}

const UpdateClient = ({ isOpen, onClose, clientId }: UpdateClientProps) => {
  const { openDrawer } = useUIStore();
  
  useEffect(() => {
    if (isOpen && clientId) {
      openDrawer({
        type: 'client',
        entityId: clientId,
        isEditing: true
      });
      
      onClose();
    }
  }, [isOpen, clientId, openDrawer, onClose]);
  
  return null;
};

export default UpdateClient;
