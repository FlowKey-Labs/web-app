import { useEffect, useState } from "react";
import { Drawer, Group, Checkbox, Text } from "@mantine/core";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { notifications } from "@mantine/notifications";
import { useListState, randomId } from "@mantine/hooks";

import Input from "../common/Input";
import Button from "../common/Button";
import { useUIStore } from "../../store/ui";
import { 
  useGetRoles, 
  useCreateRole, 
  useUpdateRole 
} from "../../hooks/reactQuery";
import { Role } from "../../store/auth";

import successIcon from "../../assets/icons/success.svg";
import errorIcon from "../../assets/icons/error.svg";

const ignoredKeys = ["id", "name", "description", "business"] as const;
type IgnoredKeys = (typeof ignoredKeys)[number];

const defaultValues = {
  name: "",
  description: "",
  can_view_staff: false,
  can_create_staff: false,
  can_edit_staff: false,
  can_view_clients: false,
  can_create_clients: false,
  can_edit_clients: false,
  can_view_sessions: false,
  can_create_sessions: false,
  can_edit_sessions: false,
  can_manage_attendance: false,
  can_manage_profile: false,
  can_manage_settings: false,
  can_view_calendar: false,
  can_view_audit_logs: false,
  can_view_bookings: false,
  can_manage_bookings: false,
  // Staff management permissions
  can_manage_staff_services: false,
  can_manage_staff_locations: false,
  can_manage_all_exceptions: false,
  can_view_staff_exceptions: false,
};

function generatePermissionSettings(role: Partial<Role> | null) {
  const baseSettings = role || defaultValues;
  return Object.entries(baseSettings)
    .filter(([key]) => !ignoredKeys.includes(key as IgnoredKeys))
    .map(([key, value]) => ({
      label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      checked: Boolean(value),
      key: randomId(),
      formKey: key,
    }));
}

interface RoleDrawerProps {
  entityId?: number | string | null;
  zIndex?: number;
}

export default function RoleDrawer({ entityId, zIndex }: RoleDrawerProps) {
  const { closeDrawer } = useUIStore();
  const editingId = entityId ? String(entityId) : null;
  const [initialized, setInitialized] = useState(false);
  
  const methods = useForm<Partial<Role>>({ defaultValues });
  const { handleSubmit, reset, setValue, control } = methods;
  
  const { data: roles = [], refetch, isLoading } = useGetRoles();
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();

  const [permissionValues, permissionHandlers] = useListState(
    generatePermissionSettings(null)
  );
  
  const allChecked = permissionValues.every((value) => value.checked);
  const indeterminate =
    permissionValues.some((value) => value.checked) && !allChecked;

  useEffect(() => {

    if (initialized || isLoading) return;
    
    if (editingId && roles.length > 0) {
      const roleToEdit = roles.find((role: Role) => String(role.id) === editingId);
      
      if (roleToEdit) {
        console.log('Loading role for editing:', roleToEdit);
        
        const formValues = {
          name: roleToEdit.name || "",
          description: roleToEdit.description || "",
          can_view_staff: roleToEdit.can_view_staff || false,
          can_create_staff: roleToEdit.can_create_staff || false,
          can_edit_staff: roleToEdit.can_edit_staff || false,
          can_view_clients: roleToEdit.can_view_clients || false,
          can_create_clients: roleToEdit.can_create_clients || false,
          can_edit_clients: roleToEdit.can_edit_clients || false,
          can_view_sessions: roleToEdit.can_view_sessions || false,
          can_create_sessions: roleToEdit.can_create_sessions || false,
          can_edit_sessions: roleToEdit.can_edit_sessions || false,
          can_manage_attendance: roleToEdit.can_manage_attendance || false,
          can_manage_profile: roleToEdit.can_manage_profile || false,
          can_manage_settings: roleToEdit.can_manage_settings || false,
          can_view_calendar: roleToEdit.can_view_calendar || false,
          can_view_audit_logs: roleToEdit.can_view_audit_logs || false,
          can_view_bookings: roleToEdit.can_view_bookings || false,
          can_manage_bookings: roleToEdit.can_manage_bookings || false,
          // Staff management permissions
          can_manage_staff_services: roleToEdit.can_manage_staff_services || false,
          can_manage_staff_locations: roleToEdit.can_manage_staff_locations || false,
          can_manage_all_exceptions: roleToEdit.can_manage_all_exceptions || false,
          can_view_staff_exceptions: roleToEdit.can_view_staff_exceptions || false,
        };
        
        reset(formValues);
        
        const permissionSettings = generatePermissionSettings(roleToEdit);
        console.log('Generated permission settings:', permissionSettings);
        permissionHandlers.setState(permissionSettings);
      } else {
        console.log('Role not found for ID:', editingId);
        reset(defaultValues);
        permissionHandlers.setState(generatePermissionSettings(null));
      }
    } else {
      reset(defaultValues);
      permissionHandlers.setState(generatePermissionSettings(null));
    }
    
    setInitialized(true);
  }, [editingId, roles, reset, permissionHandlers, isLoading, initialized]);

  const handlePermissionChange = (index: number, checked: boolean) => {
    permissionHandlers.setItemProp(index, "checked", checked);
    const formKey = permissionValues[index].formKey;
    setValue(formKey as keyof Role, checked);
  };

  const handleAllPermissionsChange = () => {
    const newCheckedState = !allChecked;
    
    permissionHandlers.setState((current) =>
      current.map((value) => ({ ...value, checked: newCheckedState }))
    );
    
    permissionValues.forEach(({ formKey }) => {
      setValue(formKey as keyof Role, newCheckedState);
    });
  };

  const onSubmit = (data: Partial<Role>) => {
    const formData = {
      ...data,
      ...Object.fromEntries(
        permissionValues.map(({ formKey, checked }) => [formKey, checked])
      ),
    };

    if (editingId) {
      const roleToEdit = roles.find((role: Role) => String(role.id) === editingId);
      
      if (!roleToEdit) {
        notifications.show({
          title: "Error",
          message: "Could not find role to update.",
          color: "red",
          radius: "md",
          icon: (
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-200">
              <img src={errorIcon} alt="Error" className="w-4 h-4" />
            </span>
          ),
          withBorder: true,
          autoClose: 3000,
          position: "top-right",
        });
        return;
      }
      
      updateRoleMutation.mutate(
        {
          ...formData,
          id: editingId,
          name: data.name || "",
          description: data.description || "",
          business: roleToEdit?.business || "",
          can_view_staff: formData.can_view_staff ?? false,
          can_create_staff: formData.can_create_staff ?? false,
          can_edit_staff: formData.can_edit_staff ?? false,
          can_view_clients: formData.can_view_clients ?? false,
          can_create_clients: formData.can_create_clients ?? false,
          can_edit_clients: formData.can_edit_clients ?? false,
          can_view_sessions: formData.can_view_sessions ?? false,
          can_create_sessions: formData.can_create_sessions ?? false,
          can_edit_sessions: formData.can_edit_sessions ?? false,
          can_manage_attendance: formData.can_manage_attendance ?? false,
          can_manage_profile: formData.can_manage_profile ?? false,
          can_manage_settings: formData.can_manage_settings ?? false,
          can_view_calendar: formData.can_view_calendar ?? false,
          can_view_audit_logs: formData.can_view_audit_logs ?? false,
          can_view_bookings: formData.can_view_bookings ?? false,
          can_manage_bookings: formData.can_manage_bookings ?? false,
          // Staff management permissions
          can_manage_staff_services: formData.can_manage_staff_services ?? false,
          can_manage_staff_locations: formData.can_manage_staff_locations ?? false,
          can_manage_all_exceptions: formData.can_manage_all_exceptions ?? false,
          can_view_staff_exceptions: formData.can_view_staff_exceptions ?? false,
        },
        {
          onSuccess: () => {
            notifications.show({
              title: "Success",
              message: "Role updated successfully!",
              color: "green",
              radius: "md",
              icon: (
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-200">
                  <img src={successIcon} alt="Success" className="w-4 h-4" />
                </span>
              ),
              withBorder: true,
              autoClose: 3000,
              position: "top-right",
            });
            closeDrawer();
            refetch();
          },
          onError: () => {
            notifications.show({
              title: "Error",
              message: "Failed to update role.",
              color: "red",
              radius: "md",
              icon: (
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-200">
                  <img src={errorIcon} alt="Error" className="w-4 h-4" />
                </span>
              ),
              withBorder: true,
              autoClose: 3000,
              position: "top-right",
            });
          },
        }
      );
    } else {
      createRoleMutation.mutate(formData as Role, {
        onSuccess: () => {
          notifications.show({
            title: "Success",
            message: "Role created successfully!",
            color: "green",
            radius: "md",
            icon: (
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-200">
                <img src={successIcon} alt="Success" className="w-4 h-4" />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
            position: "top-right",
          });
          closeDrawer();
          refetch();
        },
        onError: () => {
          notifications.show({
            title: "Error",
            message: "Failed to create role.",
            color: "red",
            radius: "md",
            icon: (
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-200">
                <img src={errorIcon} alt="Error" className="w-4 h-4" />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
            position: "top-right",
          });
        },
      });
    }
  };

  return (
    <Drawer
      opened={true}
      onClose={closeDrawer}
      title={editingId ? "Edit Role" : "Add New Role"}
      position="right"
      size="md"
      padding="xl"
      zIndex={zIndex}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Controller
            name="name"
            control={control}
            rules={{ required: "Role name is required" }}
            render={({ field }) => (
              <Input
                {...field}
                label="Role Name"
                placeholder="Enter role name"
                containerClassName="mb-4"
              />
            )}
          />
          
          <Controller
            name="description"
            control={control}
            rules={{ required: "Role description is required" }}
            render={({ field }) => (
              <Input
                {...field}
                label="Role Description"
                placeholder="Enter role description"
                containerClassName="mb-4"
              />
            )}
          />
          
          <div className="space-y-2">
            <Text fw={500} size="sm" mb={8}>
              Select permissions for this role
            </Text>
            
            <Checkbox
              label="Allow all permissions"
              checked={allChecked}
              indeterminate={indeterminate}
              onChange={handleAllPermissionsChange}
              mb="xs"
            />
            
            <div className="bg-gray-50 p-4 rounded-md">
              {permissionValues.map((value, index) => (
                <Checkbox
                  key={value.key}
                  label={value.label}
                  checked={value.checked}
                  onChange={(event) => handlePermissionChange(index, event.currentTarget.checked)}
                  className="mb-2"
                />
              ))}
            </div>
          </div>
          
          <Group justify="flex-end" mt="xl">
            <Button 
              type="submit"
              loading={createRoleMutation.isPending || updateRoleMutation.isPending}
              color="#1D9B5E"
            >
              {editingId ? "Update Role" : "Create Role"}
            </Button>
          </Group>
        </form>
      </FormProvider>
    </Drawer>
  );
} 