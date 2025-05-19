import { useState } from "react";
import {
  useGetRoles,
  useDeleteRole,
} from "../../hooks/reactQuery";
import {
  Group,
  Button as MantineButton,
  Menu,
  Text,
  Modal,
  Loader,
  Center,
} from "@mantine/core";
import actionOptionIcon from "../../assets/icons/actionOption.svg";
import editIcon from "../../assets/icons/edit.svg";
import deleteIcon from "../../assets/icons/delete.svg";
import { IconPlus } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { Role } from "../../store/auth";
import Table from "../common/Table";
import { truncateHtmlContent } from "../../utils/policy";
import { useUIStore } from "../../store/ui";
import "./tiptap.css";

const Roles = () => {
  const { openDrawer } = useUIStore();
  const { data: roles = [], refetch, isLoading: isRolesLoading } = useGetRoles();
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const deleteRoleMutation = useDeleteRole();

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

  const handleOpenRoleDrawer = (role?: Role) => {
    if (role) {
      console.log("Opening role drawer for editing:", role);
    } else {
      console.log("Opening role drawer for creation");
    }

    if (!role || roles.some((r: Role) => r.id === role.id)) {
      openDrawer({
        type: 'role',
        entityId: role?.id || null,
      });
    } else {
      console.warn("Attempted to edit a role that isn't fully loaded:", role.id);
      notifications.show({
        title: 'Error',
        message: 'Cannot edit role at this time. Please try again.',
        color: 'red',
        radius: 'md',
        withBorder: true,
        autoClose: 3000,
        position: 'top-right',
      });
    }
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
                    onClick={() => handleOpenRoleDrawer(currentRole)}
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

  if (isRolesLoading) {
    return (
      <Center style={{ height: '50vh' }}>
        <Loader color="green" size="lg" />
      </Center>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <MantineButton
          variant="filled"
          color="#1D9B5E"
          radius="md"
          size="sm"
          leftSection={<IconPlus size={16} />}
          onClick={() => handleOpenRoleDrawer()}
        >
          Create Role
        </MantineButton>
      </div>

      <Table
        data={roles}
        columns={columns}
        onRowClick={(row: Role) => handleOpenRoleDrawer(row)}
      />

      <Modal
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Role"
        size="sm"
        centered
      >
        <Text size="sm" mb="lg">
          Are you sure you want to delete this role? This action cannot be
          undone.
        </Text>
        <Group justify="flex-end">
          <MantineButton
            variant="outline"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </MantineButton>
          <MantineButton color="red" onClick={handleDelete}>
            Delete
          </MantineButton>
        </Group>
      </Modal>
    </div>
  );
};

export default Roles;
