import { Drawer, Text, Button } from '@mantine/core';
import { useUIStore, DrawerType } from '../../store/ui';

interface PlaceholderDrawerProps {
  drawerType: DrawerType;
  entityId?: number | string | null;
  isEditing?: boolean;
  zIndex?: number;
}

/**
 * PlaceholderDrawer is a temporary component for drawer types
 * that don't have a specific implementation yet.
 * 
 * Will be replaced with proper implementations as needed.
 */
export default function PlaceholderDrawer({ 
  drawerType, 
  entityId, 
  isEditing,
  zIndex
}: PlaceholderDrawerProps) {
  const { closeDrawer } = useUIStore();
  
  const getDrawerTitle = () => {
    const action = isEditing ? 'Edit' : 'Add New';
    const typeName = drawerType.charAt(0).toUpperCase() + drawerType.slice(1);
    return `${action} ${typeName}`;
  };
  
  return (
    <Drawer
      opened={true}
      onClose={closeDrawer}
      title={getDrawerTitle()}
      position='right'
      size='md'
      padding='xl'
      zIndex={zIndex}
    >
      <div className="flex flex-col items-center justify-center py-8">
        <Text size="lg" fw={500} mb={20}>
          {isEditing 
            ? `Edit ${drawerType} (ID: ${entityId})` 
            : `Create new ${drawerType}`}
        </Text>
        <Text size="sm" c="dimmed" mb={30} ta="center">
          This drawer is a placeholder. The actual implementation
          for {drawerType} management will be added in a future update.
        </Text>
        <Button 
          onClick={closeDrawer}
          color='#1D9B5E' 
          radius='md'
        >
          Close
        </Button>
      </div>
    </Drawer>
  );
} 