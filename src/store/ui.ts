import { create } from 'zustand';

/**
 * Types of drawers available in the application
 */
export type DrawerType = 
  | 'location'
  | 'category'
  | 'subcategory'
  | 'role'
  | 'policy'
  | 'client'
  | 'staff'
  | 'session';

/**
 * Drawer configuration data
 */
export interface DrawerData {
  type: DrawerType;
  entityId?: number | string | null;
  isEditing?: boolean;
  extraData?: Record<string, any>;
  parentContext?: {
    type: DrawerType;
    pendingData?: Record<string, any>;
  };
}

/**
 * UI state interface
 */
interface UIState {
  /** Stack of currently open drawers with the last being the active one */
  drawerStack: DrawerData[];
  
  /** Currently active drawer or null if no drawer is open */
  activeDrawer: DrawerData | null;
  
  /** Opens a drawer with specified configuration and adds it to the top of the stack */
  openDrawer: (drawer: DrawerData) => void;
  
  /** Closes the top drawer in the stack */
  closeDrawer: () => void;
  
  /** Closes all drawers */
  closeAllDrawers: () => void;
}

/**
 * UI state store for managing global UI elements like drawers
 */
export const useUIStore = create<UIState>((set, get) => ({
  drawerStack: [],
  
  // Computed property that returns the top drawer from the stack
  get activeDrawer() {
    const state = get();
    return state.drawerStack.length > 0 
      ? state.drawerStack[state.drawerStack.length - 1] 
      : null;
  },
  
  openDrawer: (drawer) => set((state) => ({
    drawerStack: [...state.drawerStack, drawer]
  })),
  
  closeDrawer: () => set((state) => ({
    drawerStack: state.drawerStack.slice(0, -1)
  })),
  
  closeAllDrawers: () => set({ drawerStack: [] }),
})); 