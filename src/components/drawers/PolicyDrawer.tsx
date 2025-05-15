import { useEffect } from 'react';
import { Drawer, Button, Group, Text, Image } from '@mantine/core';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { notifications } from '@mantine/notifications';
import { Dropzone } from '@mantine/dropzone';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import FontSize from '@tiptap/extension-font-size';

import Input from '../common/Input';
import DropdownSelectInput from '../common/Dropdown';
import { useUIStore } from '../../store/ui';
import {
  useGetPolicies,
  useCreatePolicy,
  useUpdatePolicy,
} from "../../hooks/reactQuery";
import { Policy } from "../../types/policy";
import '../accountSettings/tiptap.css';

import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';
import dropZoneIcon from '../../assets/icons/dropZone.svg';
import styles from '../accountSettings/GeneralSettings.module.css';

type PolicyFormData = {
  policyTitle: string;
  policyContent: string;
  policyFile?: File;
  policyType: { value: "TEXT" | "PDF"; label: string } | "TEXT" | "PDF";
};

interface PolicyDrawerProps {
  entityId?: number | string | null;
  isEditing?: boolean;
  zIndex?: number;
}

export default function PolicyDrawer({ entityId, isEditing, zIndex }: PolicyDrawerProps) {
  const { closeDrawer } = useUIStore();
  const editingId = entityId ? Number(entityId) : null;
  
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
  
  const { data: policies = [] } = useGetPolicies();
  const createPolicyMutation = useCreatePolicy();
  const updatePolicyMutation = useUpdatePolicy();

  useEffect(() => {
    if (editingId && policies.length > 0) {
      const policyToEdit = policies.find((policy: Policy) => policy.id === editingId);
      if (policyToEdit) {
        methods.setValue("policyTitle", policyToEdit.title || "");
        methods.setValue("policyContent", policyToEdit.content || "");
        methods.setValue("policyType", policyToEdit.policy_type || "TEXT");
        
        if (editor) {
          editor.commands.setContent(policyToEdit.content || "");
        }
      }
    } else {
      reset({
        policyTitle: "",
        policyContent: "",
        policyFile: undefined,
        policyType: "TEXT",
      });
      if (editor) {
        editor.commands.setContent("");
      }
    }
  }, [editingId, policies, reset, editor]);

  const onSubmit = (data: PolicyFormData) => {
    const policyType =
      typeof data.policyType === "object"
        ? data.policyType.value
        : data.policyType;

    if (policyType === "PDF" && !data.policyFile) {
      notifications.show({
        title: 'Error',
        message: 'PDF file is required for PDF policy type',
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
      return;
    }

    if (policyType === "TEXT" && !data.policyContent) {
      notifications.show({
        title: 'Error',
        message: 'Content is required for TEXT policy type',
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
      return;
    }

    const payload = {
      title: data.policyTitle,
      content: policyType === "TEXT" ? data.policyContent : "",
      policy_type: policyType,
      file: policyType === "PDF" ? data.policyFile : undefined,
    };

    if (editingId) {
      updatePolicyMutation.mutate(
        {
          id: editingId,
          ...payload,
        },
        {
          onSuccess: () => {
            notifications.show({
              title: 'Success',
              message: 'Policy updated successfully!',
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
            closeDrawer();
          },
          onError: () => {
            notifications.show({
              title: 'Error',
              message: 'Failed to update policy.',
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
        }
      );
    } else {
      createPolicyMutation.mutate(payload, {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: 'Policy created successfully!',
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
          closeDrawer();
        },
        onError: () => {
          notifications.show({
            title: 'Error',
            message: 'Failed to create policy.',
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
    }
  };

  return (
    <Drawer
      opened={true}
      onClose={closeDrawer}
      title={editingId ? 'Update Policy' : 'Create Policy'}
      position='right'
      size='md'
      padding='xl'
      overlayProps={{ opacity: 0.5, blur: 2 }}
      zIndex={zIndex}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <Controller
              name="policyTitle"
              control={control}
              rules={{ required: 'Policy title is required' }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Policy Title"
                  placeholder="Enter policy title"
                />
              )}
            />
            <div className="relative w-full mt-4">
              <Controller
                name="policyType"
                control={control}
                rules={{ required: "Policy type is required" }}
                render={({ field }) => (
                  <DropdownSelectInput
                    {...field}
                    label="Policy Type"
                    options={[
                      { label: "Text Content", value: "TEXT" },
                      { label: "PDF Document", value: "PDF" },
                    ]}
                    placeholder="Select policy type"
                    singleSelect
                    onSelectItem={(value) => {
                      const selectedValue =
                        typeof value === "object" ? value.value : value;
                      field.onChange(selectedValue);
                      methods.setValue("policyType", selectedValue);
                    }}
                    value={
                      typeof field.value === "object"
                        ? field.value.value
                        : field.value
                    }
                  />
                )}
              />
              {watch("policyType") === "TEXT" && (
                <Controller
                  name="policyContent"
                  control={control}
                  render={() => (
                    <>
                      <div className="tiptap-toolbar mt-4">
                        <button
                          type="button"
                          onClick={() =>
                            editor?.chain().focus().toggleBold().run()
                          }
                          className={
                            editor?.isActive("bold") ? "is-active" : ""
                          }
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            editor?.chain().focus().toggleItalic().run()
                          }
                          className={
                            editor?.isActive("italic") ? "is-active" : ""
                          }
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            editor?.chain().focus().toggleUnderline().run()
                          }
                          className={
                            editor?.isActive("underline") ? "is-active" : ""
                          }
                        >
                          U
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            editor?.chain().focus().toggleStrike().run()
                          }
                          className={
                            editor?.isActive("strike") ? "is-active" : ""
                          }
                        >
                          S
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            editor?.chain().focus().toggleBulletList().run()
                          }
                          className={
                            editor?.isActive("bulletList") ? "is-active" : ""
                          }
                        >
                          • List
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            editor?.chain().focus().toggleOrderedList().run()
                          }
                          className={
                            editor?.isActive("orderedList") ? "is-active" : ""
                          }
                        >
                          1. List
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            editor?.chain().focus().setTextAlign("left").run()
                          }
                          className={
                            editor?.isActive({ textAlign: "left" })
                              ? "is-active"
                              : ""
                          }
                        >
                          Left
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            editor
                              ?.chain()
                              .focus()
                              .setTextAlign("center")
                              .run()
                          }
                          className={
                            editor?.isActive({ textAlign: "center" })
                              ? "is-active"
                              : ""
                          }
                        >
                          Center
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            editor
                              ?.chain()
                              .focus()
                              .setTextAlign("right")
                              .run()
                          }
                          className={
                            editor?.isActive({ textAlign: "right" })
                              ? "is-active"
                              : ""
                          }
                        >
                          Right
                        </button>
                        <input
                          type="color"
                          value={
                            editor?.getAttributes("textStyle").color ||
                            "#000000"
                          }
                          onInput={(e) =>
                            editor
                              ?.chain()
                              .focus()
                              .setColor((e.target as HTMLInputElement).value)
                              .run()
                          }
                          title="Text color"
                        />
                        <DropdownSelectInput
                          options={[
                            { label: "Size", value: "" },
                            { label: "12", value: "12px" },
                            { label: "14", value: "14px" },
                            { label: "16", value: "16px" },
                            { label: "18", value: "18px" },
                            { label: "20", value: "20px" },
                            { label: "24", value: "24px" },
                            { label: "28", value: "28px" },
                            { label: "32", value: "32px" },
                          ]}
                          value={
                            editor?.getAttributes("textStyle").fontSize || ""
                          }
                          placeholder="Size"
                          width={120}
                          singleSelect
                          onSelectItem={(item) => {
                            editor
                              ?.chain()
                              .focus()
                              .setFontSize(item.value)
                              .run();
                          }}
                          selectClassName="mr-2"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!editor) return;
                            editor
                              .chain()
                              .focus()
                              .unsetAllMarks()
                              .setParagraph()
                              .setFontFamily("")
                              .setFontSize("")
                              .setColor("#000000")
                              .run();
                          }}
                        >
                          Clear
                        </button>
                      </div>
                      <div className="relative w-full mt-4">
                        <EditorContent
                          editor={editor}
                          className="tiptap-editor"
                        />
                      </div>
                    </>
                  )}
                />
              )}
              {watch("policyType") === "PDF" && (
                <div className="mt-4">
                  <Dropzone
                    radius="8px"
                    onDrop={(files) => {
                      if (files.length > 0) {
                        methods.setValue("policyFile", files[0], {
                          shouldValidate: true,
                        });
                        notifications.show({
                          title: "File uploaded",
                          message: `${files[0].name} has been selected`,
                          color: "green",
                        });
                      }
                    }}
                    maxSize={20 * 1024 ** 2}
                    accept={["application/pdf"]}
                    className={styles.dropzoneRoot}
                    multiple={false}
                  >
                    <div style={{ pointerEvents: "none" }}>
                      <Group justify="center" gap="xl" mb="md" p="6">
                        <Group gap="sm">
                          <Image
                            src={dropZoneIcon}
                            width={24}
                            height={24}
                            alt="Upload icon"
                          />
                          <Text c="#1D9B5E">
                            {methods.getValues("policyFile")
                              ? `Selected file: ${
                                  methods.getValues("policyFile")?.name
                                }`
                              : "Drag and drop a policy file here, or Browse"}
                          </Text>
                        </Group>
                      </Group>
                      {!methods.getValues("policyFile") && (
                        <Text c="#1D9B5E" ta="center" mt="auto" py="xs">
                          Max size: 20MB (PDF recommended)
                        </Text>
                      )}
                      {methods.getValues("policyFile") && (
                        <Button
                          variant="subtle"
                          color="red"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            methods.setValue("policyFile", undefined, {
                              shouldValidate: true,
                            });
                          }}
                        >
                          Remove file
                        </Button>
                      )}
                    </div>
                  </Dropzone>
                  {methods.formState.errors.policyFile && (
                    <Text c="red" size="sm" mt={4}>
                      {methods.formState.errors.policyFile.message}
                    </Text>
                  )}
                </div>
              )}
            </div>
            <Group
              justify="flex-end"
              align="flex-end"
              gap="sm"
              style={{ marginTop: 16 }}
            >
              <Button
                variant="filled"
                color="#1D9B5E"
                radius="md"
                size="sm"
                type="submit"
                loading={
                  createPolicyMutation.isPending ||
                  updatePolicyMutation.isPending
                }
                disabled={
                  createPolicyMutation.isPending ||
                  updatePolicyMutation.isPending
                }
              >
                {editingId ? "Update Policy" : "Save Policy"}
              </Button>
            </Group>
          </div>
        </form>
      </FormProvider>
    </Drawer>
  );
} 