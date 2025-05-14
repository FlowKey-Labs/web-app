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
  isEditing?: boolean;
  zIndex?: number;
}

export default function RoleDrawer({ entityId, isEditing, zIndex }: RoleDrawerProps) {
  const { closeDrawer } = useUIStore();
  const editingId = entityId ? String(entityId) : null;
  
  const methods = useForm<Partial<Role>>({ defaultValues });
  const { handleSubmit, reset, setValue, control } = methods;
  
  const { data: roles = [], refetch } = useGetRoles();
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();

  const [permissionValues, permissionHandlers] = useListState(
    generatePermissionSettings(null)
  );
  const allChecked = permissionValues.every((value) => value.checked);
  const indeterminate =
    permissionValues.some((value) => value.checked) && !allChecked;

  useEffect(() => {
    if (editingId && roles.length > 0) {
      const roleToEdit = roles.find(role => role.id === editingId);
      if (roleToEdit) {
        reset({
          name: roleToEdit.name,
          description: roleToEdit.description,
        });
        permissionHandlers.setState(generatePermissionSettings(roleToEdit));
      }
    } else {
      reset(defaultValues);
      permissionHandlers.setState(generatePermissionSettings(null));
    }
  }, [editingId, roles, reset]);

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
      const roleToEdit = roles.find(role => role.id === editingId);
      
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
            render={({ field, fieldState }) => (
              <Input
                {...field}
                label="Role Name"
                placeholder="Enter role name"
                error={fieldState.error?.message}
                containerClassName="mb-4"
              />
            )}
          />
          
          <Controller
            name="description"
            control={control}
            rules={{ required: "Role description is required" }}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                label="Role Description"
                placeholder="Enter role description"
                error={fieldState.error?.message}
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