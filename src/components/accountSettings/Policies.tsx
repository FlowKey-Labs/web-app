import { useState } from 'react';
import {
  useGetPolicies,
  useCreatePolicy,
  useUpdatePolicy,
  useDeletePolicy,
} from '../../hooks/reactQuery';
import {
  Drawer,
  Group,
  Button as MantineButton,
  Menu,
  Stack,
  Text,
} from '@mantine/core';
import actionOptionIcon from '../../assets/icons/actionOption.svg';
import editIcon from '../../assets/icons/edit.svg';
import deleteIcon from '../../assets/icons/delete.svg';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { useEditor, EditorContent } from '@tiptap/react';
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
import Input from '../common/Input';
import DropdownSelectInput from '../common/Dropdown';
import { IconPlus } from '@tabler/icons-react';

import { Policy } from '../../types/policy';
import { truncateHtmlContent, getUserFullName } from '../../utils/policy';

import { Modal } from '@mantine/core';
import { format } from 'date-fns';
import { notifications } from '@mantine/notifications';

const Policies = () => {
  const [drawerOpened, setDrawerOpened] = useState(false);
  // Fetch policies from backend
  const { data: policies = [] } = useGetPolicies();
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  // Mutation for creating a policy
  const createPolicyMutation = useCreatePolicy();
  const updatePolicyMutation = useUpdatePolicy();
  const deletePolicyMutation = useDeletePolicy();

  const methods = useForm({
    defaultValues: {
      policyTitle: '',
      policyContent: '',
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
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      FontFamily,
      FontSize,
    ],
    content: watch('policyContent'),
    onUpdate: ({ editor }) => {
      methods.setValue('policyContent', editor.getHTML(), {
        shouldDirty: true,
      });
    },
  });

  const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const columns = [
    { accessorKey: 'title', header: 'Title' },
    {
      accessorKey: 'content',
      header: 'Policy',
      cell: (row: any) => (
        <span>{truncateHtmlContent(row.getValue(), 80)}</span>
      ),
    },
    {
      accessorKey: 'sessions_count',
      header: 'Sessions Accepted',
      cell: (row: any) => row.getValue() ?? 0,
    },
    {
      accessorKey: 'last_modified',
      header: 'Last Modified',
      cell: (row: any) => format(new Date(row.getValue()), 'yyyy-MM-dd'),
    },
    {
      accessorKey: 'modified_by',
      header: 'Modified By',
      cell: (row: any) => getUserFullName(row.getValue()),
    },
    {
      id: 'actions',
      header: '',
      cell: (row: any) => {
        const currentPolicy = row.row.original;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Group justify='center'>
              <Menu
                width={120}
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
                    color='#228be6'
                    leftSection={
                      <img src={editIcon} alt='Edit' className='w-4 h-4' />
                    }
                    onClick={() => {
                      if (!currentPolicy) return;
                      setSelectedPolicy(currentPolicy);
                      methods.setValue(
                        'policyTitle',
                        currentPolicy.title ?? ''
                      );
                      methods.setValue(
                        'policyContent',
                        currentPolicy.content ?? ''
                      );
                      if (editor) {
                        editor.commands.setContent(currentPolicy.content || '');
                      }
                      setDrawerOpened(true);
                    }}
                  >
                    Edit
                  </Menu.Item>
                  <Menu.Item
                    color='red'
                    leftSection={
                      <img src={deleteIcon} alt='Delete' className='w-4 h-4' />
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
    },
  ];

  const onSubmit = (data: { policyTitle: string; policyContent: string }) => {
    if (selectedPolicy) {
      // Update
      updatePolicyMutation.mutate(
        {
          id: selectedPolicy.id,
          title: data.policyTitle,
          content: data.policyContent,
        },
        {
          onSuccess: () => {
            notifications.show({
              title: 'Success',
              message: 'Policy updated successfully!',
              color: 'green',
            });
            setDrawerOpened(false);
            setSelectedPolicy(null);
            reset();
            if (editor) editor.commands.setContent('');
          },
          onError: () => {
            notifications.show({
              title: 'Error',
              message: 'Failed to update policy.',
              color: 'red',
            });
          },
        }
      );
    } else {
      // Create
      createPolicyMutation.mutate(
        {
          title: data.policyTitle,
          content: data.policyContent,
        },
        {
          onSuccess: () => {
            notifications.show({
              title: 'Success',
              message: 'Policy created successfully!',
              color: 'green',
            });
            setDrawerOpened(false);
            reset();
            if (editor) editor.commands.setContent('');
          },
          onError: () => {
            notifications.show({
              title: 'Error',
              message: 'Failed to create policy.',
              color: 'red',
            });
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (!policyToDelete) return;
    deletePolicyMutation.mutate(policyToDelete.id, {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: 'Policy deleted successfully!',
          color: 'green',
        });
        setIsDeleteModalOpen(false);
        setPolicyToDelete(null);
        setSelectedPolicy(null);
        reset();
        if (editor) editor.commands.setContent('');
      },
      onError: () => {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete policy.',
          color: 'red',
        });
      },
    });
  };

  return (
    <div className='flex flex-col gap-6'>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <MantineButton
          variant='filled'
          color='#1D9B5E'
          radius='md'
          size='sm'
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            setDrawerOpened(true);
            setSelectedPolicy(null);
            reset();
            if (editor) editor.commands.setContent('');
          }}
        >
          Create Policy
        </MantineButton>
      </div>
      <Table
        data={policies}
        columns={columns}
        onRowClick={(row: any) => {
          setSelectedPolicy(row);
        }}
      />
      <Drawer
        opened={drawerOpened}
        onClose={() => {
          setDrawerOpened(false);
          setSelectedPolicy(null);
          reset();
          if (editor) editor.commands.setContent('');
        }}
        title={selectedPolicy ? 'Update Policy' : 'Create Policy'}
        position='right'
        size='lg'
        padding='xl'
        overlayProps={{ opacity: 0.5, blur: 2 }}
      >
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='mb-4'>
              <Input
                name='policyTitle'
                label='Policy Title'
                type='text'
                placeholder='Enter policy title'
                value={watch('policyTitle')}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  methods.setValue('policyTitle', e.target.value)
                }
                className='mb-2'
              />
              <div className='relative w-full mt-4'>
                <Controller
                  name='policyContent'
                  control={control}
                  render={() => (
                    <>
                      <div className='tiptap-toolbar mt-4'>
                        <button
                          type='button'
                          onClick={() =>
                            editor?.chain().focus().toggleBold().run()
                          }
                          className={
                            editor?.isActive('bold') ? 'is-active' : ''
                          }
                        >
                          B
                        </button>
                        <button
                          type='button'
                          onClick={() =>
                            editor?.chain().focus().toggleItalic().run()
                          }
                          className={
                            editor?.isActive('italic') ? 'is-active' : ''
                          }
                        >
                          I
                        </button>
                        <button
                          type='button'
                          onClick={() =>
                            editor?.chain().focus().toggleUnderline().run()
                          }
                          className={
                            editor?.isActive('underline') ? 'is-active' : ''
                          }
                        >
                          U
                        </button>
                        <button
                          type='button'
                          onClick={() =>
                            editor?.chain().focus().toggleStrike().run()
                          }
                          className={
                            editor?.isActive('strike') ? 'is-active' : ''
                          }
                        >
                          S
                        </button>
                        <button
                          type='button'
                          onClick={() =>
                            editor?.chain().focus().toggleBulletList().run()
                          }
                          className={
                            editor?.isActive('bulletList') ? 'is-active' : ''
                          }
                        >
                          • List
                        </button>
                        <button
                          type='button'
                          onClick={() =>
                            editor?.chain().focus().toggleOrderedList().run()
                          }
                          className={
                            editor?.isActive('orderedList') ? 'is-active' : ''
                          }
                        >
                          1. List
                        </button>
                        <button
                          type='button'
                          onClick={() =>
                            editor?.chain().focus().setTextAlign('left').run()
                          }
                          className={
                            editor?.isActive({ textAlign: 'left' })
                              ? 'is-active'
                              : ''
                          }
                        >
                          Left
                        </button>
                        <button
                          type='button'
                          onClick={() =>
                            editor?.chain().focus().setTextAlign('center').run()
                          }
                          className={
                            editor?.isActive({ textAlign: 'center' })
                              ? 'is-active'
                              : ''
                          }
                        >
                          Center
                        </button>
                        <button
                          type='button'
                          onClick={() =>
                            editor?.chain().focus().setTextAlign('right').run()
                          }
                          className={
                            editor?.isActive({ textAlign: 'right' })
                              ? 'is-active'
                              : ''
                          }
                        >
                          Right
                        </button>
                        <input
                          type='color'
                          value={
                            editor?.getAttributes('textStyle').color ||
                            '#000000'
                          }
                          onInput={(e) =>
                            editor
                              ?.chain()
                              .focus()
                              .setColor((e.target as HTMLInputElement).value)
                              .run()
                          }
                          title='Text color'
                        />
                        <DropdownSelectInput
                          options={[
                            { label: 'Size', value: '' },
                            { label: '12', value: '12px' },
                            { label: '14', value: '14px' },
                            { label: '16', value: '16px' },
                            { label: '18', value: '18px' },
                            { label: '20', value: '20px' },
                            { label: '24', value: '24px' },
                            { label: '28', value: '28px' },
                            { label: '32', value: '32px' },
                          ]}
                          value={
                            editor?.getAttributes('textStyle').fontSize || ''
                          }
                          placeholder='Size'
                          width={120}
                          singleSelect
                          onSelectItem={(item) => {
                            editor
                              ?.chain()
                              .focus()
                              .setFontSize(item.value)
                              .run();
                          }}
                          selectClassName='mr-2'
                        />
                        <button
                          type='button'
                          onClick={() => {
                            if (!editor) return;
                            editor
                              .chain()
                              .focus()
                              .unsetAllMarks()
                              .setParagraph()
                              .setFontFamily('')
                              .setFontSize('')
                              .setColor('#000000')
                              .run();
                          }}
                        >
                          Clear
                        </button>
                      </div>
                      <EditorContent
                        editor={editor}
                        className='tiptap-editor'
                      />
                    </>
                  )}
                />
              </div>
              <Stack
                justify='flex-end'
                align='flex-end'
                gap='sm'
                style={{ marginTop: 16 }}
              >
                <MantineButton
                  variant='filled'
                  color='#1D9B5E'
                  radius='md'
                  size='sm'
                  type='submit'
                  loading={
                    createPolicyMutation.isPending ||
                    updatePolicyMutation.isPending
                  }
                  disabled={
                    createPolicyMutation.isPending ||
                    updatePolicyMutation.isPending
                  }
                >
                  {selectedPolicy ? 'Update Policy' : 'Save Policy'}
                </MantineButton>
              </Stack>
            </div>
          </form>
        </FormProvider>
      </Drawer>
      <Modal
        opened={!!selectedPolicy && !drawerOpened}
        onClose={() => setSelectedPolicy(null)}
        title='Policy Details'
        size='lg'
        centered
      >
        {selectedPolicy && (
          <div>
            <h2>{selectedPolicy.title}</h2>
            <div>
              <strong>Policy:</strong>
              <div
                style={{ marginBottom: 8 }}
                dangerouslySetInnerHTML={{ __html: selectedPolicy.content }}
              />
            </div>
            <div>
              <strong>Sessions Accepted:</strong>{' '}
              {selectedPolicy.sessions_count}
            </div>
            <div>
              <strong>Last Modified:</strong>{' '}
              {format(new Date(selectedPolicy.last_modified), 'yyyy-MM-dd')}
            </div>
            <div>
              <strong>Modified By:</strong>{' '}
              {getUserFullName(selectedPolicy.modified_by)}
            </div>
          </div>
        )}
      </Modal>
      <Modal
        opened={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPolicyToDelete(null);
        }}
        title='Delete Policy?'
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
        <div className='flex items-start space-x-4 mb-6'>
          <div className='flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center'>
            <img src={deleteIcon} alt='Warning' className='w-5 h-5' />
          </div>
          <div>
            <Text fw={500} size='md' mb={8} c='gray.8'>
              Are you sure you want to delete this policy?
            </Text>
            <Text size='sm' c='gray.6'>
              This action cannot be undone. The policy will be permanently
              removed.
            </Text>
          </div>
        </div>
        <div className='flex justify-end gap-2 mt-4'>
          <MantineButton
            color='red'
            onClick={handleDelete}
            loading={deletePolicyMutation.isPending}
            disabled={deletePolicyMutation.isPending}
            radius='md'
          >
            Delete
          </MantineButton>
        </div>
      </Modal>
    </div>
  );
};

export default Policies;
