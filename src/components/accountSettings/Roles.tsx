import { useEffect, useState } from "react";
import {
  useGetRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from "../../hooks/reactQuery";
import {
  Drawer,
  Group,
  Button as MantineButton,
  Menu,
  Stack,
  Text,
  Modal,
  Checkbox,
} from "@mantine/core";
import actionOptionIcon from "../../assets/icons/actionOption.svg";
import editIcon from "../../assets/icons/edit.svg";
import deleteIcon from "../../assets/icons/delete.svg";
import { useForm, FormProvider } from "react-hook-form";
import { useListState, randomId } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { Role } from "../../store/auth";
import Input from "../common/Input";
import Table from "../common/Table";
import { truncateHtmlContent } from "../../utils/policy";
import "./tiptap.css";

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

const Roles = () => {
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { data: roles = [], refetch } = useGetRoles();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();

  const methods = useForm<Partial<Role>>({ defaultValues });
  const { handleSubmit, reset, setValue } = methods;

  const [permissionValues, permissionHandlers] = useListState(
    generatePermissionSettings(null)
  );
  const allChecked = permissionValues.every((value) => value.checked);
  const indeterminate =
    permissionValues.some((value) => value.checked) && !allChecked;

  useEffect(() => {
    if (selectedRole && isEditing) {
      reset({
        name: selectedRole.name,
        description: selectedRole.description,
      });
      permissionHandlers.setState(generatePermissionSettings(selectedRole));
    }
  }, [selectedRole, isEditing, reset]);

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

    if (selectedRole && isEditing) {
      updateRoleMutation.mutate(
        {
          ...formData,
          id: selectedRole.id || '',
          name: data.name || "",
          description: data.description || "",
          business: selectedRole.business || "",
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
            });
            handleCloseDrawer();
            refetch();
          },
          onError: () => {
            notifications.show({
              title: "Error",
              message: "Failed to update role.",
              color: "red",
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
          });
          handleCloseDrawer();
          refetch();
        },
        onError: () => {
          notifications.show({
            title: "Error",
            message: "Failed to create role.",
            color: "red",
          });
        },
      });
    }
  };

  const handleDelete = () => {
    if (!roleToDelete) return;
    deleteRoleMutation.mutate(roleToDelete.id, {
      onSuccess: () => {
        notifications.show({
          title: "Success",
          message: "Role deleted successfully!",
          color: "green",
        });
        setIsDeleteModalOpen(false);
        refetch();
      },
      onError: () => {
        notifications.show({
          title: "Error",
          message: "Failed to delete role.",
          color: "red",
        });
      },
    });
  };

  const handleCloseDrawer = () => {
    setDrawerOpened(false);
    setSelectedRole(null);
    setIsEditing(false);
    reset(defaultValues);
    permissionHandlers.setState(generatePermissionSettings(null));
  };

  const columns = [
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "description",
      header: "Description",
      cell: (row: { getValue: () => string }) => (
        <span>{truncateHtmlContent(row.getValue(), 80)}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: (row: { row: { original: Role } }) => {
        const currentRole = row.row.original;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Group justify="center">
              <Menu
                width={120}
                shadow="md"
                position="bottom"
                radius="md"
                withArrow
                offset={4}
              >
                <Menu.Target>
                  <img
                    src={actionOptionIcon}
                    alt="Options"
                    className="w-4 h-4 cursor-pointer"
                  />
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    color="#228be6"
                    leftSection={
                      <img src={editIcon} alt="Edit" className="w-4 h-4" />
                    }
                    onClick={() => {
                      setSelectedRole(currentRole);
                      setIsEditing(true);
                      setDrawerOpened(true);
                    }}
                  >
                    Edit
                  </Menu.Item>
                  <Menu.Item
                    color="red"
                    leftSection={
                      <img src={deleteIcon} alt="Delete" className="w-4 h-4" />
                    }
                    onClick={() => {
                      setRoleToDelete(currentRole);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <MantineButton
          variant="filled"
          color="#1D9B5E"
          radius="md"
          size="sm"
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            setDrawerOpened(true);
            setIsEditing(false);
            setSelectedRole(null);
          }}
        >
          Create Role
        </MantineButton>
      </div>

      <Table
        data={roles}
        columns={columns}
        onRowClick={(row: any) => setSelectedRole(row)}
      />

      <Drawer
        opened={drawerOpened}
        onClose={handleCloseDrawer}
        title={isEditing ? "Update Role" : "Create Role"}
        position="right"
        size="lg"
        padding="xl"
        overlayProps={{ opacity: 0.5, blur: 2 }}
      >
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <Input
                name="name"
                label="Role Name"
                type="text"
                placeholder="Enter role name"
                className="mb-2"
              />
              <Input
                name="description"
                label="Role Description"
                type="text"
                placeholder="Enter role description"
                className="mb-2"
              />
              <p className="mt-4 text-sm">Select permissions for this role</p>
              <div className="relative w-full mt-4">
                <Checkbox
                  checked={allChecked}
                  indeterminate={indeterminate}
                  label="Allow all permissions"
                  onChange={handleAllPermissionsChange}
                />
                <Stack gap="xs" mt="sm">
                  {permissionValues.map((value, index) => (
                    <Checkbox
                      key={value.key}
                      ml={33}
                      label={value.label}
                      checked={value.checked}
                      onChange={(e) =>
                        handlePermissionChange(index, e.currentTarget.checked)
                      }
                    />
                  ))}
                </Stack>
              </div>
              <Stack
                justify="flex-end"
                align="flex-end"
                gap="sm"
                style={{ marginTop: 16 }}
              >
                <MantineButton
                  variant="filled"
                  color="#1D9B5E"
                  radius="md"
                  size="sm"
                  type="submit"
                  loading={
                    createRoleMutation.isPending || updateRoleMutation.isPending
                  }
                  disabled={
                    createRoleMutation.isPending || updateRoleMutation.isPending
                  }
                >
                  {isEditing ? "Update Role" : "Save Role"}
                </MantineButton>
              </Stack>
            </div>
          </form>
        </FormProvider>
      </Drawer>

      <Modal
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Role?"
        centered
        radius="md"
        size="md"
        withCloseButton={false}
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        shadow="xl"
      >
        <div className="flex items-start space-x-4 mb-6">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <img src={deleteIcon} alt="Warning" className="w-5 h-5" />
          </div>
          <div>
            <Text fw={500} size="md" mb={8} c="gray.8">
              Are you sure you want to delete this role?
            </Text>
            <Text size="sm" c="gray.6">
              This action cannot be undone. The role will be permanently
              removed.
            </Text>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <MantineButton
            color="red"
            onClick={handleDelete}
            loading={deleteRoleMutation.isPending}
            disabled={deleteRoleMutation.isPending}
            radius="md"
          >
            Delete
          </MantineButton>
        </div>
      </Modal>
    </div>
  );
};

export default Roles;
