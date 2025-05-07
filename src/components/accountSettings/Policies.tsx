import { useMemo, useState } from 'react';
import {
  useGetPolicies,
  useCreatePolicy,
  useUpdatePolicy,
  useDeletePolicy,
} from '../../hooks/reactQuery';
import {
  Box,
  Drawer,
  Group,
  Button as MantineButton,
  Menu,
  Stack,
  Modal,
  Image,
  Text,
  Button,
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
import { IconFile, IconPlus } from '@tabler/icons-react';
import { Dropzone } from '@mantine/dropzone';
import dropZoneIcon from '../../assets/icons/dropZone.svg';
import styles from './GeneralSettings.module.css';

import { Policy } from '../../types/policy';
import { truncateHtmlContent, getUserFullName } from '../../utils/policy';

import { format } from 'date-fns';
import { notifications } from '@mantine/notifications';
import { createColumnHelper } from '@tanstack/react-table';

type PolicyFormData = {
  policyTitle: string;
  policyContent: string;
  policyFile?: File;
  policyType: { value: 'TEXT' | 'PDF'; label: string } | 'TEXT' | 'PDF';
};

const columnHelper = createColumnHelper<Policy>();

const Policies = () => {
  const [drawerOpened, setDrawerOpened] = useState(false);
  const { data: policies = [] } = useGetPolicies();
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  const createPolicyMutation = useCreatePolicy();
  const updatePolicyMutation = useUpdatePolicy();
  const deletePolicyMutation = useDeletePolicy();

  const methods = useForm<PolicyFormData>({
    defaultValues: {
      policyTitle: '',
      policyContent: '',
      policyFile: undefined,
      policyType: 'TEXT',
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

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Title',
      }),
      columnHelper.accessor('policy_type', {
        header: 'Type',
        cell: (info) => {
          const type = info.getValue();
          return type === 'TEXT' ? 'Text' : 'PDF';
        },
      }),
      columnHelper.accessor('content', {
        header: 'Policy',
        cell: (info) => {
          const content = info.getValue();
          const policyType = info.row.original.policy_type;

          if (policyType === 'PDF') {
            return <Text c='blue'>PDF Document</Text>;
          }
          return <span>{truncateHtmlContent(content ?? '', 80)}</span>;
        },
      }),
      columnHelper.accessor('sessions_count', {
        header: 'Sessions Accepted',
        cell: (info) => info.getValue() ?? 0,
      }),
      columnHelper.accessor('last_modified', {
        header: 'Last Modified',
        cell: (info) => format(new Date(info.getValue()), 'yyyy-MM-dd'),
      }),
      columnHelper.accessor('modified_by', {
        header: 'Modified By',
        cell: (info) => getUserFullName(info.getValue()),
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (info) => {
          const currentPolicy = info.row.original;
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
                        methods.setValue(
                          'policyType',
                          currentPolicy.policy_type ?? 'TEXT'
                        );
                        if (editor) {
                          editor.commands.setContent(
                            currentPolicy.content || ''
                          );
                        }
                        setDrawerOpened(true);
                      }}
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      color='red'
                      leftSection={
                        <img
                          src={deleteIcon}
                          alt='Delete'
                          className='w-4 h-4'
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
    [
      actionOptionIcon,
      editIcon,
      deleteIcon,
      methods.setValue,
      editor?.commands,
      setSelectedPolicy,
      setDrawerOpened,
      setPolicyToDelete,
      setIsDeleteModalOpen,
      truncateHtmlContent,
      getUserFullName,
      format,
    ]
  );

  const onSubmit = (data: PolicyFormData) => {
    const policyType =
      typeof data.policyType === 'object'
        ? data.policyType.value
        : data.policyType;

    if (policyType === 'PDF' && !data.policyFile) {
      notifications.show({
        title: 'Error',
        message: 'PDF file is required for PDF policy type',
        color: 'red',
      });
      return;
    }

    if (policyType === 'TEXT' && !data.policyContent) {
      notifications.show({
        title: 'Error',
        message: 'Content is required for TEXT policy type',
        color: 'red',
      });
      return;
    }

    const payload = {
      title: data.policyTitle,
      content: policyType === 'TEXT' ? data.policyContent : '',
      policy_type: policyType,
      file: policyType === 'PDF' ? data.policyFile : undefined,
    };

    if (selectedPolicy) {
      updatePolicyMutation.mutate(
        {
          id: selectedPolicy.id,
          ...payload,
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
      createPolicyMutation.mutate(payload, {
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
      });
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
              <Controller
                name='policyTitle'
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label='Policy Title'
                    placeholder='Enter policy title'
                  />
                )}
              />
              <div className='relative w-full mt-4'>
                <Controller
                  name='policyType'
                  control={control}
                  rules={{ required: 'Policy type is required' }}
                  render={({ field }) => (
                    <DropdownSelectInput
                      {...field}
                      label='Policy Type'
                      options={[
                        { label: 'Text Content', value: 'TEXT' },
                        { label: 'PDF Document', value: 'PDF' },
                      ]}
                      placeholder='Select policy type'
                      singleSelect
                      onSelectItem={(value) => {
                        const selectedValue =
                          typeof value === 'object' ? value.value : value;
                        field.onChange(selectedValue);
                        methods.setValue('policyType', selectedValue);
                      }}
                      value={
                        typeof field.value === 'object'
                          ? field.value.value
                          : field.value
                      }
                    />
                  )}
                />
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
                      {watch('policyType') !== 'PDF' && (
                        <div className='relative w-full mt-4'>
                          <EditorContent
                            editor={editor}
                            className='tiptap-editor'
                          />
                        </div>
                      )}
                    </>
                  )}
                />
                {watch('policyType') !== 'TEXT' && (
                  <div className='mt-4'>
                    <Dropzone
                      radius='8px'
                      onDrop={(files) => {
                        if (files.length > 0) {
                          methods.setValue('policyFile', files[0], {
                            shouldValidate: true,
                          });
                          notifications.show({
                            title: 'File uploaded',
                            message: `${files[0].name} has been selected`,
                            color: 'green',
                          });
                        }
                      }}
                      maxSize={20 * 1024 ** 2}
                      accept={['application/pdf']}
                      className={styles.dropzoneRoot}
                      multiple={false}
                    >
                      <Box style={{ pointerEvents: 'none' }}>
                        <Group justify='center' gap='xl' mb='md' p='6'>
                          <Group gap='sm'>
                            <Image
                              src={dropZoneIcon}
                              width={24}
                              height={24}
                              alt='Upload icon'
                            />
                            <Text c='#1D9B5E'>
                              {methods.getValues('policyFile')
                                ? `Selected file: ${
                                    methods.getValues('policyFile')?.name
                                  }`
                                : 'Drag and drop a policy file here, or Browse'}
                            </Text>
                          </Group>
                        </Group>
                        {!methods.getValues('policyFile') && (
                          <Text c='#1D9B5E' ta='center' mt='auto' py='xs'>
                            Max size: 20MB (PDF recommended)
                          </Text>
                        )}
                        {methods.getValues('policyFile') && (
                          <Button
                            variant='subtle'
                            color='red'
                            size='sm'
                            onClick={(e) => {
                              e.stopPropagation();
                              methods.setValue('policyFile', undefined, {
                                shouldValidate: true,
                              });
                            }}
                          >
                            Remove file
                          </Button>
                        )}
                      </Box>{' '}
                    </Dropzone>
                    {methods.formState.errors.policyFile && (
                      <Text c='red' size='sm' mt={4}>
                        {methods.formState.errors.policyFile.message}
                      </Text>
                    )}
                  </div>
                )}
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
            <Text c='dimmed' mb='sm'>
              Type: {selectedPolicy.policy_type === 'TEXT' ? 'Text' : 'PDF'}
            </Text>

            {selectedPolicy.policy_type !== 'PDF' && selectedPolicy.content && (
              <div style={{ marginBottom: 16 }}>
                <Text fw={500}>Content:</Text>
                <div
                  dangerouslySetInnerHTML={{ __html: selectedPolicy.content }}
                />
              </div>
            )}

            {selectedPolicy.policy_type !== 'TEXT' &&
              selectedPolicy.file_url && (
                <div style={{ marginBottom: 16 }}>
                  <Text fw={500}>Document:</Text>
                  <Button
                    component='a'
                    href={selectedPolicy.file_url}
                    target='_blank'
                    variant='outline'
                    leftSection={<IconFile />}
                  >
                    View PDF
                  </Button>
                </div>
              )}

            <Text>
              <strong>Sessions Accepted:</strong>{' '}
              {selectedPolicy.sessions_count}
            </Text>
            <Text>
              <strong>Last Modified:</strong>{' '}
              {format(new Date(selectedPolicy.last_modified), 'yyyy-MM-dd')}
            </Text>
            <Text>
              <strong>Modified By:</strong>{' '}
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
