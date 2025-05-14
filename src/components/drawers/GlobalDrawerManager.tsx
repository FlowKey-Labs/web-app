import { useUIStore, DrawerData } from '../../store/ui';
import { 
  LocationDrawer, 
  CategoryDrawer, 
  SubcategoryDrawer,
  PolicyDrawer,
  ClientDrawer,
  PlaceholderDrawer 
} from './index';

/**
 * Renders a drawer component based on drawer data
 */
const renderDrawer = (drawerData: DrawerData, index: number, totalDrawers: number) => {
  const zIndex = 1000 + index;
  
  switch (drawerData.type) {
    case 'location':
      return (
        <LocationDrawer 
          key={`location-drawer-${index}`}
          entityId={drawerData.entityId} 
          isEditing={drawerData.isEditing}
          zIndex={zIndex}
        />
      );
    
    case 'category':
      return (
        <CategoryDrawer 
          key={`category-drawer-${index}`}
          entityId={drawerData.entityId} 
          isEditing={drawerData.isEditing}
          zIndex={zIndex}
        />
      );
      
    case 'subcategory':
      return (
        <SubcategoryDrawer 
          key={`subcategory-drawer-${index}`}
          entityId={drawerData.entityId} 
          isEditing={drawerData.isEditing}
          extraData={drawerData.extraData}
          zIndex={zIndex}
        />
      );

    case 'policy':
      return (
        <PolicyDrawer
          key={`policy-drawer-${index}`}
          entityId={drawerData.entityId}
          isEditing={drawerData.isEditing}
          zIndex={zIndex}
        />
      );
      
    case 'client':
      return (
        <ClientDrawer
          key={`client-drawer-${index}`}
          entityId={drawerData.entityId}
          isEditing={drawerData.isEditing}
          zIndex={zIndex}
        />
      );
    
    default:
      return (
        <PlaceholderDrawer 
          key={`placeholder-drawer-${index}`}
          drawerType={drawerData.type}
          entityId={drawerData.entityId}
          isEditing={drawerData.isEditing}
          zIndex={zIndex}
        />
      );
  }
}

/**
 * GlobalDrawerManager component that manages all the drawers in the application
 * It renders all drawers in the stack, with appropriate z-index values
 */
export default function GlobalDrawerManager() {
  const { drawerStack } = useUIStore();
  
  if (!drawerStack.length) return null;
  
  return (
    <>
      {drawerStack.map((drawer, index) => 
        renderDrawer(drawer, index, drawerStack.length)
      )}
    </>
  );
} 