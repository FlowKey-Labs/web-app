import { useCallback, useMemo, useState } from 'react';
import { useGetPolicies, useDeletePolicy } from "../../hooks/reactQuery";
import { Group, Button as MantineButton, Menu, Stack, Modal, Text, Button } from '@mantine/core';
import actionOptionIcon from '../../assets/icons/actionOption.svg';
import editIcon from '../../assets/icons/edit.svg';
import deleteIcon from '../../assets/icons/delete.svg';
import { useForm } from 'react-hook-form';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import FontSize from '@tiptap/extension-font-size';
import './tiptap.css';
import Table from '../common/Table';
import { IconFile, IconPlus } from '@tabler/icons-react';
import { useExportPolicies } from '../../hooks/useExport';
import { useUIStore } from '../../store/ui';

import { Policy } from "../../types/policy";
import { truncateHtmlContent, getUserFullName } from "../../utils/policy";

import { format } from "date-fns";
import { notifications } from "@mantine/notifications";
import { createColumnHelper } from "@tanstack/react-table";

import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

type PolicyFormData = {
  policyTitle: string;
  policyContent: string;
  policyFile?: File;
  policyType: { value: "TEXT" | "PDF"; label: string } | "TEXT" | "PDF";
};

const columnHelper = createColumnHelper<Policy>();

const Policies = () => {
  const { data: policies = [] } = useGetPolicies();
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const deletePolicyMutation = useDeletePolicy();

  const methods = useForm<PolicyFormData>({
    defaultValues: {
      policyTitle: "",
      policyContent: "",
      policyFile: undefined,
      policyType: "TEXT",
    },
  });
  const { control, handleSubmit, reset, watch } = methods;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      FontFamily,
      FontSize,
    ],
    content: watch("policyContent"),
    onUpdate: ({ editor }) => {
      methods.setValue("policyContent", editor.getHTML(), {
        shouldDirty: true,
      });
    },
  });

  const [rowSelection, setRowSelection] = useState({});
  const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const getSelectedPolicyIds = useCallback(() => {
    if (!policies) return [];
    
    return Object.keys(rowSelection).map(index => {
      const policyIndex = parseInt(index);
      return policies[policyIndex].id;
    });
  }, [rowSelection, policies]);

  const {
    exportModalOpened,
    openExportModal,
    closeExportModal,
    handleExport,
    isExporting,
  } = useExportPolicies(policies || []);

  const { openDrawer } = useUIStore();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <input
            type='checkbox'
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className='w-4 h-4 rounded cursor-pointer bg-[#F7F8FA] accent-[#DBDEDF]'
          />
        ),
        cell: ({ row }) => (
          <input
            type='checkbox'
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            onClick={(e) => e.stopPropagation()}
            className='w-4 h-4 rounded cursor-pointer bg-[#F7F8FA] accent-[#DBDEDF]'
          />
        ),
      }),
      columnHelper.accessor('title', {
        header: 'Title',
      }),
      columnHelper.accessor("policy_type", {
        header: "Type",
        cell: (info) => {
          const type = info.getValue();
          return type === "TEXT" ? "Text" : "PDF";
        },
      }),
      columnHelper.accessor("content", {
        header: "Policy",
        cell: (info) => {
          const content = info.getValue();
          const policyType = info.row.original.policy_type;

          if (policyType === "PDF") {
            return <Text c="blue">PDF Document</Text>;
          }
          return <span>{truncateHtmlContent(content ?? "", 80)}</span>;
        },
      }),
      columnHelper.accessor("sessions_count", {
        header: "Sessions Accepted",
        cell: (info) => info.getValue() ?? 0,
      }),
      columnHelper.accessor("last_modified", {
        header: "Last Modified",
        cell: (info) => format(new Date(info.getValue()), "yyyy-MM-dd"),
      }),
      columnHelper.accessor("modified_by", {
        header: "Modified By",
        cell: (info) => getUserFullName(info.getValue()),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => (
          <div className='flex space-x-2' onClick={(e) => e.stopPropagation()}>
            <Group justify='center'>
              <Menu
                width={150}
                shadow='md'
                position='bottom'
                radius='md'
                withArrow
                offset={4}
              >
                <Menu.Target>
                  <img
                    src={actionOptionIcon}
                    alt='Options'
                    className='w-4 h-4 cursor-pointer'
                  />
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    color='#162F3B'
                    className='text-sm'
                    style={{ textAlign: 'center' }}
                    onClick={openExportModal}
                  >
                    Export Policies
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </div>
        ),
        cell: (info) => {
          const currentPolicy = info.row.original;
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
                      color='#1D9B5E'
                      leftSection={
                        <img src={editIcon} alt="Edit" className="w-4 h-4" />
                      }
                      onClick={() => {
                        if (!currentPolicy) return;
                        openDrawer({
                          type: 'policy',
                          entityId: currentPolicy.id,
                          isEditing: true
                        });
                      }}
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      color="red"
                      leftSection={
                        <img
                          src={deleteIcon}
                          alt="Delete"
                          className="w-4 h-4"
                        />
                      }
                      onClick={() => {
                        setPolicyToDelete(currentPolicy);
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
      }),
    ],
    [openDrawer]
  );

  const handleDelete = () => {
    if (!policyToDelete) return;
    deletePolicyMutation.mutate(policyToDelete.id, {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: 'Policy deleted successfully!',
          color: 'green',
          radius: 'md',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
              <img src={successIcon} alt='Success' className='w-4 h-4' />
            </span>
          ),
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
        });
        setIsDeleteModalOpen(false);
        setPolicyToDelete(null);
        setSelectedPolicy(null);
        reset();
        if (editor) editor.commands.setContent("");
      },
      onError: () => {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete policy.',
          color: 'red',
          radius: 'md',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
        });
      },
    });
  };

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
            openDrawer({
              type: 'policy',
              isEditing: false
            });
          }}
        >
          Create Policy
        </MantineButton>
      </div>
      <Table
        data={policies}
        columns={columns}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onRowClick={(row) => {
          setSelectedPolicy(row);
          setIsViewModalOpen(true);
        }}
      />

      <Modal
        opened={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Policy Details"
        size="lg"
        centered
      >
        {selectedPolicy && (
          <div>
            <h2>{selectedPolicy.title}</h2>
            <Text c="dimmed" mb="sm">
              Type: {selectedPolicy.policy_type === "TEXT" ? "Text" : "PDF"}
            </Text>

            {selectedPolicy.policy_type !== "PDF" && selectedPolicy.content && (
              <div style={{ marginBottom: 16 }}>
                <Text fw={500}>Content:</Text>
                <div
                  dangerouslySetInnerHTML={{ __html: selectedPolicy.content }}
                />
              </div>
            )}

            {selectedPolicy.policy_type !== "TEXT" &&
              selectedPolicy.file_url && (
                <div style={{ marginBottom: 16 }}>
                  <Text fw={500}>Document:</Text>
                  <Button
                    component="a"
                    href={selectedPolicy.file_url}
                    target="_blank"
                    variant="outline"
                    leftSection={<IconFile />}
                  >
                    View PDF
                  </Button>
                </div>
              )}

            <Text>
              <strong>Sessions Accepted:</strong>{" "}
              {selectedPolicy.sessions_count}
            </Text>
            <Text>
              <strong>Last Modified:</strong>{" "}
              {format(new Date(selectedPolicy.last_modified), "yyyy-MM-dd")}
            </Text>
            <Text>
              <strong>Modified By:</strong>{" "}
              {getUserFullName(selectedPolicy.modified_by)}
            </Text>
          </div>
        )}
      </Modal>
      <Modal
        opened={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPolicyToDelete(null);
        }}
        title="Delete Policy?"
        centered
        radius="md"
        size="md"
        withCloseButton={false}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        shadow="xl"
      >
        <div className="flex items-start space-x-4 mb-6">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <img src={deleteIcon} alt="Warning" className="w-5 h-5" />
          </div>
          <div>
            <Text fw={500} size="md" mb={8} c="gray.8">
              Are you sure you want to delete this policy?
            </Text>
            <Text size="sm" c="gray.6">
              This action cannot be undone. The policy will be permanently
              removed.
            </Text>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <MantineButton
            color="red"
            onClick={handleDelete}
            loading={deletePolicyMutation.isPending}
            disabled={deletePolicyMutation.isPending}
            radius="md"
          >
            Delete
          </MantineButton>
        </div>
      </Modal>
      <Modal
        opened={exportModalOpened}
        onClose={closeExportModal}
        title={
          <Text fw={600} size='lg'>
            Export Clients
          </Text>
        }
        centered
        radius='md'
        size='md'
        withCloseButton={false}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        shadow='xl'
      >
        <div className='py-2'>
          <Text size='sm' style={{ marginBottom: '2rem' }}>
            Select a format to export {Object.keys(rowSelection).length}{' '}
            selected clients
          </Text>

          <Stack gap='md'>
            <MantineButton
              variant='outline'
              color='#1D9B5E'
              radius='md'
              onClick={() => handleExport('excel', getSelectedPolicyIds())}
              className='px-6'
              loading={isExporting}
            >
              Export as Excel
            </MantineButton>

            <MantineButton
              variant='outline'
              color='#1D9B5E'
              radius='md'
              onClick={() => handleExport('csv', getSelectedPolicyIds())}
              className='px-6'
              loading={isExporting}
            >
              Export as CSV
            </MantineButton>
          </Stack>

          <div className='flex justify-end space-x-4 mt-8'>
            <MantineButton
              variant='outline'
              color='red'
              radius='md'
              onClick={closeExportModal}
              className='px-6'
            >
              Cancel
            </MantineButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Policies;
