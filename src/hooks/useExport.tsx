import { useState, useCallback } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Session } from '../types/sessionTypes';
import { Client } from '../types/clientTypes';
import { StaffResponse } from '../types/staffTypes';
import { Policy } from '../types/policy';
import { exportDataToFile } from '../utils/exportUtils';
import { Subcategory } from '../types/profileCategories';
import { Skill } from '../types/profileCategories';
import { GroupData } from '../types/clientTypes';
import {
  MakeUpSession,
  AttendedSession,
  CancelledSession,
} from '../types/sessionTypes';

import successIcon from '../assets/icons/success.svg';
import errorIcon from '../assets/icons/error.svg';

/**
 * Hook for exporting sessions data
 * @param sessions Array of sessions to export
 * @returns Export functionality and state
 */
export const useExportSessions = (sessions: Session[], onSuccess?: () => void) => {
  const [isExporting, setIsExporting] = useState(false);
  const [
    exportModalOpened,
    { open: openExportModal, close: closeExportModal },
  ] = useDisclosure(false);

  const processSessionsForExport = (selectedIds: number[]) => {
    const sessionsToExport = sessions.filter((session) =>
      selectedIds.includes(session.id)
    );

    return sessionsToExport.map((session) => ({
      id: session.id,
      title: session.title || '',
      category: session.category?.name || '',
      date: new Date(session.date).toLocaleDateString(),
      start_time: session.start_time || '',
      end_time: session.end_time || '',
      staff: session.assigned_staff?.user
        ? `${session.assigned_staff.user.first_name} ${session.assigned_staff.user.last_name}`
        : '',
      status: session.is_active ? 'Active' : 'Inactive',
      spots: session.spots || 0,
      class_type: session.class_type || '',
      session_type: session.session_type || '',
    }));
  };

  const handleExport = useCallback(
    (type: 'csv' | 'excel', selectedIds: number[]) => {
      if (selectedIds.length === 0) {
        notifications.show({
          title: 'No sessions selected',
          message: 'Please select at least one session to export',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
        return;
      }

      if (sessions.length === 0) {
        notifications.show({
          title: 'No sessions available',
          message: 'There are no sessions to export',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
        closeExportModal();
        return;
      }

      setIsExporting(true);

      try {
        const dataToExport = processSessionsForExport(selectedIds);

        exportDataToFile(dataToExport, type, 'sessions', ['id']);

        // Call onSuccess callback before showing the success notification
        if (onSuccess) {
          onSuccess();
        }

        notifications.show({
          title: 'Export successful',
          message: `${
            dataToExport.length
          } session(s) exported successfully as ${type.toUpperCase()}`,
          color: 'green',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
              <img src={successIcon} alt='Success' className='w-4 h-4' />
            </span>
          ),
        });
      } catch (error) {
        console.error('Error exporting sessions:', error);
        notifications.show({
          title: 'Export failed',
          message: 'Failed to export sessions. Please try again.',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
      } finally {
        setIsExporting(false);
        closeExportModal();
      }
    },
    [sessions, closeExportModal, onSuccess]
  );

  return {
    exportModalOpened,
    openExportModal,
    closeExportModal,
    handleExport,
    isExporting,
  };
};

/**
 * Hook for exporting clients data
 * @param clients Array of clients to export
 * @returns Export functionality and state
 */
export const useExportClients = (clients: Client[], onSuccess?: () => void) => {
  const [isExporting, setIsExporting] = useState(false);
  const [
    exportModalOpened,
    { open: openExportModal, close: closeExportModal },
  ] = useDisclosure(false);

  const processClientsForExport = (selectedIds: number[]) => {
    const clientsToExport = clients.filter((client) =>
      selectedIds.includes(client.id)
    );

    return clientsToExport.map((client) => ({
      id: client.id,
      first_name: client.first_name || '',
      last_name: client.last_name || '',
      email: client.email || '',
      phone_number: client.phone_number || '',
      location: client.location || '',
      gender:
        client.gender === 'M' ? 'Male' : client.gender === 'F' ? 'Female' : '',
      dob: client.dob || '',
      assigned_classes: client.assigned_classes || 0,
      status: client.active ? 'Active' : 'Inactive',
      created_at: new Date(client.created_at).toLocaleDateString(),
    }));
  };

  const handleExport = useCallback(
    (type: 'csv' | 'excel', selectedIds: number[]) => {
      if (selectedIds.length === 0) {
        notifications.show({
          title: 'No clients selected',
          message: 'Please select at least one client to export',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
        return;
      }

      if (clients.length === 0) {
        notifications.show({
          title: 'No clients available',
          message: 'There are no clients to export',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
        closeExportModal();
        return;
      }

      setIsExporting(true);

      try {
        const dataToExport = processClientsForExport(selectedIds);
        exportDataToFile(dataToExport, type, 'clients', ['id']);

        // Call onSuccess callback before showing the success notification
        if (onSuccess) {
          onSuccess();
        }

        notifications.show({
          title: 'Export successful',
          message: `${
            dataToExport.length
          } client(s) exported successfully as ${type.toUpperCase()}`,
          color: 'green',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
              <img src={successIcon} alt='Success' className='w-4 h-4' />
            </span>
          ),
        });
      } catch (error) {
        console.error('Error exporting clients:', error);
        notifications.show({
          title: 'Export failed',
          message: 'Failed to export clients. Please try again.',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
      } finally {
        setIsExporting(false);
        closeExportModal();
      }
    },
    [clients, closeExportModal]
  );

  return {
    exportModalOpened,
    openExportModal,
    closeExportModal,
    handleExport,
    isExporting,
  };
};

/**
 * Hook for exporting staff data
 * @param staff Array of staff members to export
 * @returns Export functionality and state
 */
export const useExportStaff = (staff: StaffResponse[]) => {
  const [isExporting, setIsExporting] = useState(false);
  const [
    exportModalOpened,
    { open: openExportModal, close: closeExportModal },
  ] = useDisclosure(false);

  const processStaffForExport = (selectedIds: number[]) => {
    const staffToExport = staff.filter((member) =>
      selectedIds.includes(member.id)
    );

    return staffToExport.map((member) => ({
      id: member.id,
      first_name: member.user.first_name || '',
      last_name: member.user.last_name || '',
      email: member.user.email || '',
      phone_number: member.user.mobile_number || '',
      member_id: member.member_id || '',
      role: member.role || '',
      pay_type: member.pay_type || '',
      rate: member.rate || '',
      status: member.isActive ? 'Active' : 'Inactive',
      created_at: new Date(member.created_at).toLocaleDateString(),
      can_create_events: member.permissions?.can_create_events || false,
      can_add_clients: member.permissions?.can_add_clients || false,
      can_create_invoices: member.permissions?.can_create_invoices || false,
    }));
  };

  const handleExport = useCallback(
    (type: 'csv' | 'excel', selectedIds: number[]) => {
      if (selectedIds.length === 0) {
        notifications.show({
          title: 'No staff members selected',
          message: 'Please select at least one staff member to export',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
        return;
      }

      if (staff.length === 0) {
        notifications.show({
          title: 'No staff available',
          message: 'There are no staff members to export',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
        closeExportModal();
        return;
      }

      setIsExporting(true);

      try {
        const dataToExport = processStaffForExport(selectedIds);
        exportDataToFile(dataToExport, type, 'staff', ['id']);

        notifications.show({
          title: 'Export successful',
          message: `${
            dataToExport.length
          } staff member(s) exported successfully as ${type.toUpperCase()}`,
          color: 'green',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
              <img src={successIcon} alt='Success' className='w-4 h-4' />
            </span>
          ),
        });
      } catch (error) {
        console.error('Error exporting staff:', error);
        notifications.show({
          title: 'Export failed',
          message: 'Failed to export staff members. Please try again.',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
      } finally {
        setIsExporting(false);
        closeExportModal();
      }
    },
    [staff, closeExportModal]
  );

  return {
    exportModalOpened,
    openExportModal,
    closeExportModal,
    handleExport,
    isExporting,
  };
};

export const useExportPolicies = (policies: Policy[]) => {
  const [isExporting, setIsExporting] = useState(false);
  const [
    exportModalOpened,
    { open: openExportModal, close: closeExportModal },
  ] = useDisclosure(false);

  const processPoliciesForExport = (selectedIds: number[]) => {
    const policiesToExport = policies.filter((policy) =>
      selectedIds.includes(policy.id)
    );

    return policiesToExport.map((policy) => ({
      id: policy.id,
      title: policy.title || '',
      content: policy.content || '',
      policy_type: policy.policy_type || '',
      created_at: new Date(policy.last_modified).toLocaleDateString(),
    }));
  };
  const handleExport = useCallback(
    (type: 'csv' | 'excel', selectedIds: number[]) => {
      if (selectedIds.length === 0) {
        notifications.show({
          title: 'No policies selected',
          message: 'Please select at least one policy to export',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
        return;
      }

      if (policies.length === 0) {
        notifications.show({
          title: 'No policies available',
          message: 'There are no policies to export',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
        closeExportModal();
        return;
      }

      setIsExporting(true);

      try {
        const dataToExport = processPoliciesForExport(selectedIds);
        exportDataToFile(dataToExport, type, 'policies', ['id']);

        notifications.show({
          title: 'Export successful',
          message: `${
            dataToExport.length
          } policy(ies) exported successfully as ${type.toUpperCase()}`,
          color: 'green',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
              <img src={successIcon} alt='Success' className='w-4 h-4' />
            </span>
          ),
        });
      } catch (error) {
        console.error('Error exporting policies:', error);
        notifications.show({
          title: 'Export failed',
          message: 'Failed to export policies. Please try again.',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
      } finally {
        setIsExporting(false);
        closeExportModal();
      }
    },
    [policies, closeExportModal]
  );

  return {
    exportModalOpened,
    openExportModal,
    closeExportModal,
    handleExport,
    isExporting,
  };
};

export const useExportSubcategories = (
  subcategories: Subcategory[],
  skills: Skill[]
) => {
  const [isExporting, setIsExporting] = useState(false);
  const [
    exportModalOpened,
    { open: openExportModal, close: closeExportModal },
  ] = useDisclosure(false);

  const processSubcategoriesForExport = (selectedIds: number[]) => {
    const subcategoriesToExport = subcategories.filter((subcategory) =>
      selectedIds.includes(subcategory.id)
    );

    return subcategoriesToExport.map((subcategory) => ({
      id: subcategory.id,
      name: subcategory.name || '',
      description: subcategory.description || '',
      skills:
        skills
          .filter((skill) => skill.subcategory === subcategory.id)
          .map((skill) => skill.name) || [],
    }));
  };

  const handleExport = useCallback(
    (type: 'csv' | 'excel', selectedIds: number[]) => {
      if (selectedIds.length === 0) {
        notifications.show({
          title: 'No subcategories selected',
          message: 'Please select at least one subcategory to export',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
        return;
      }

      if (subcategories.length === 0) {
        notifications.show({
          title: 'No subcategories available',
          message: 'There are no subcategories to export',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
        closeExportModal();
        return;
      }

      setIsExporting(true);

      try {
        const dataToExport = processSubcategoriesForExport(selectedIds);
        exportDataToFile(dataToExport, type, 'subcategories', ['id']);

        notifications.show({
          title: 'Export successful',
          message: `${
            dataToExport.length
          } subcategory(ies) exported successfully as ${type.toUpperCase()}`,
          color: 'green',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
              <img src={successIcon} alt='Success' className='w-4 h-4' />
            </span>
          ),
        });
      } catch (error) {
        console.error('Error exporting subcategories:', error);
        notifications.show({
          title: 'Export failed',
          message: 'Failed to export subcategories. Please try again.',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
      } finally {
        setIsExporting(false);
        closeExportModal();
      }
    },
    [subcategories, closeExportModal]
  );

  return {
    exportModalOpened,
    openExportModal,
    closeExportModal,
    handleExport,
    isExporting,
  };
};

export const useExportSessionClients = (clients: Client[]) => {
  const [isExporting, setIsExporting] = useState(false);
  const [
    exportModalOpened,
    { open: openExportModal, close: closeExportModal },
  ] = useDisclosure(false);

  const processClientsForExport = (selectedIds: number[]) => {
    const clientsToExport = clients.filter((client) =>
      selectedIds.includes(client.id)
    );

    return clientsToExport.map((client) => {
      const attendance =
        client.attendances && client.attendances.length > 0
          ? client.attendances[0]
          : null;

      return {
        id: client.id,
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.email,
        phone_number: client.phone_number || '',
        attendance_status: attendance?.status_display || 'Not Recorded',
        attendance_timestamp: attendance?.timestamp
          ? new Date(attendance.timestamp).toLocaleString()
          : 'N/A',
        attended: attendance?.attended ? 'Yes' : 'No',
      };
    });
  };

  const handleExport = useCallback(
    (type: 'csv' | 'excel', selectedIds: number[]) => {
      if (selectedIds.length === 0) {
        notifications.show({
          title: 'No clients selected',
          message: 'Please select at least one client to export',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
        return;
      }

      if (clients.length === 0) {
        notifications.show({
          title: 'No clients available',
          message: 'There are no clients to export',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
        closeExportModal();
        return;
      }

      setIsExporting(true);

      try {
        const dataToExport = processClientsForExport(selectedIds);

        exportDataToFile(dataToExport, type, 'session_clients', ['id']);

        notifications.show({
          title: 'Export successful',
          message: `${
            dataToExport.length
          } client(s) exported successfully as ${type.toUpperCase()}`,
          color: 'green',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
              <img src={successIcon} alt='Success' className='w-4 h-4' />
            </span>
          ),
        });
      } catch {
        notifications.show({
          title: 'Export failed',
          message: 'An error occurred while exporting clients',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
      } finally {
        setIsExporting(false);
        closeExportModal();
      }
    },
    [clients, closeExportModal]
  );

  return {
    exportModalOpened,
    openExportModal,
    closeExportModal,
    handleExport,
    isExporting,
  };
};

export const useExportGroups = (groups: GroupData[], onSuccess?: () => void) => {
  const [isExporting, setIsExporting] = useState(false);
  const [
    exportModalOpened,
    { open: openExportModal, close: closeExportModal },
  ] = useDisclosure(false);

  const processGroupsForExport = (selectedIds: number[]) => {
    const groupsToExport = groups.filter((group) =>
      selectedIds.includes(group.id || 0)
    );

    return groupsToExport.map((group) => ({
      id: group.id,
      name: group.name || '',
      description: group.description || '',
      location: group.location || '',
      active: group.active ? 'Active' : 'Inactive',
      client_ids: group.client_ids || [],
      session_ids: group.session_ids || [],
      contact_person_id: group.contact_person || null,
    }));
  };
  const handleExport = useCallback(
    (type: 'csv' | 'excel', selectedIds: number[]) => {
      if (selectedIds.length === 0) {
        notifications.show({
          title: 'No groups selected',
          message: 'Please select at least one group to export',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
        return;
      }

      if (groups.length === 0) {
        notifications.show({
          title: 'No groups available',
          message: 'There are no groups to export',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
        closeExportModal();
        return;
      }

      setIsExporting(true);
      try {
        const dataToExport = processGroupsForExport(selectedIds);
        exportDataToFile(dataToExport, type, 'groups', ['id']);

        if (onSuccess) {
          onSuccess();
        }

        notifications.show({
          title: 'Export successful',
          message: `${
            dataToExport.length
          } group(s) exported successfully as ${type.toUpperCase()}`,
          color: 'green',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
              <img src={successIcon} alt='Success' className='w-4 h-4' />
            </span>
          ),
        });
      } catch {
        notifications.show({
          title: 'Export failed',
          message: 'An error occurred while exporting groups',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
      } finally {
        setIsExporting(false);
        closeExportModal();
      }
    },
    [groups, closeExportModal, onSuccess]
  );

  return {
    exportModalOpened,
    openExportModal,
    closeExportModal,
    handleExport,
    isExporting,
  };
};

export const useExportMakeupSessions = (makeupSessions: MakeUpSession[]) => {
  const [isExporting, setIsExporting] = useState(false);
  const [
    exportModalOpened,
    { open: openExportModal, close: closeExportModal },
  ] = useDisclosure(false);

  const processMakeupSessionsForExport = (selectedIds: string[]) => {
    const makeupSessionsToExport = makeupSessions.filter((session) =>
      selectedIds.includes(session?.id?.toString() || '')
    );

    return makeupSessionsToExport.map((makeupSession) => ({
      id: makeupSession?.id || '',
      client_name: makeupSession?.client_name || '',
      original_session_date: makeupSession?.original_date || '',
      new_session_date: makeupSession?.new_date || '',
      new_start_time: makeupSession?.new_start_time || '',
      new_end_time: makeupSession?.new_end_time || '',
    }));
  };

  const handleExport = useCallback(
    (type: 'csv' | 'excel', selectedIds: string[]) => {
      if (selectedIds.length === 0) {
        console.warn('No makeup sessions selected');
        notifications.show({
          title: 'No makeup sessions selected',
          message: 'Please select at least one makeup session to export',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
        closeExportModal();
        return;
      }

      if (makeupSessions.length === 0) {
        notifications.show({
          title: 'No makeup sessions available',
          message: 'There are no makeup sessions to export',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
        closeExportModal();
        return;
      }

      setIsExporting(true);
      try {
        const dataToExport = processMakeupSessionsForExport(selectedIds);
        exportDataToFile(dataToExport, type, 'makeup_sessions', ['id']);

        notifications.show({
          title: 'Export successful',
          message: `${
            dataToExport.length
          } makeup session(s) exported successfully as ${type.toUpperCase()}`,
          color: 'green',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
              <img src={successIcon} alt='Success' className='w-4 h-4' />
            </span>
          ),
        });
      } catch {
        notifications.show({
          title: 'Export failed',
          message: 'An error occurred while exporting makeup sessions',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
      } finally {
        setIsExporting(false);
        closeExportModal();
      }
    },
    [makeupSessions, closeExportModal]
  );

  return {
    exportModalOpened,
    openExportModal,
    closeExportModal,
    handleExport,
    isExporting,
  };
};

export const useExportAttendedSessions = (
  attendedSessions: AttendedSession[]
) => {
  const [isExporting, setIsExporting] = useState(false);
  const [
    exportModalOpened,
    { open: openExportModal, close: closeExportModal },
  ] = useDisclosure(false);

  const processAttendedSessionsForExport = (selectedIds: string[]) => {
    const attendedSessionsToExport = attendedSessions.filter((session) =>
      selectedIds.includes(session?.id?.toString() || '')
    );

    return attendedSessionsToExport.map((attendedSession) => ({
      id: attendedSession.id,
      client_name: attendedSession.client_name,
    }));
  };

  const handleExport = useCallback(
    (type: 'csv' | 'excel', selectedIds: string[]) => {
      if (selectedIds.length === 0) {
        console.warn('No attended sessions selected');
        notifications.show({
          title: 'No attended sessions selected',
          message: 'Please select at least one attended session to export',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
        closeExportModal();
        return;
      }

      if (attendedSessions.length === 0) {
        notifications.show({
          title: 'No attended sessions available',
          message: 'There are no attended sessions to export',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
        closeExportModal();
        return;
      }

      setIsExporting(true);
      try {
        const dataToExport = processAttendedSessionsForExport(selectedIds);
        exportDataToFile(dataToExport, type, 'attended_sessions', ['id']);

        notifications.show({
          title: 'Export successful',
          message: `${
            dataToExport.length
          } attended session(s) exported successfully as ${type.toUpperCase()}`,
          color: 'green',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
              <img src={successIcon} alt='Success' className='w-4 h-4' />
            </span>
          ),
        });
      } catch (error) {
        notifications.show({
          title: 'Export failed',
          message: 'An error occurred while exporting attended sessions',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
      } finally {
        setIsExporting(false);
        closeExportModal();
      }
    },
    [attendedSessions, closeExportModal]
  );

  return {
    exportModalOpened,
    openExportModal,
    closeExportModal,
    handleExport,
    isExporting,
  };
};

export const useExportCancelledSessions = (
  cancelledSessions: CancelledSession[]
) => {
  const [isExporting, setIsExporting] = useState(false);
  const [
    exportModalOpened,
    { open: openExportModal, close: closeExportModal },
  ] = useDisclosure(false);

  const processCancelledSessionsForExport = (selectedIds: string[]) => {
    const cancelledSessionsToExport = cancelledSessions.filter((session) =>
      selectedIds.includes(session?.id?.toString() || '')
    );

    return cancelledSessionsToExport.map((cancelledSession) => ({
      id: cancelledSession.id,
      client_name: cancelledSession.client_name,
    }));
  };

  const handleExport = useCallback(
    (type: 'csv' | 'excel', selectedIds: string[]) => {
      if (selectedIds.length === 0) {
        console.warn('No cancelled sessions selected');
        notifications.show({
          title: 'No cancelled sessions selected',
          message: 'Please select at least one cancelled session to export',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
        closeExportModal();
        return;
      }

      if (cancelledSessions.length === 0) {
        notifications.show({
          title: 'No cancelled sessions available',
          message: 'There are no cancelled sessions to export',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
        closeExportModal();
        return;
      }

      setIsExporting(true);
      try {
        const dataToExport = processCancelledSessionsForExport(selectedIds);
        exportDataToFile(dataToExport, type, 'cancelled_sessions', ['id']);

        notifications.show({
          title: 'Export successful',
          message: `${
            dataToExport.length
          } cancelled session(s) exported successfully as ${type.toUpperCase()}`,
          color: 'green',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
              <img src={successIcon} alt='Success' className='w-4 h-4' />
            </span>
          ),
        });
      } catch (error) {
        notifications.show({
          title: 'Export failed',
          message: 'An error occurred while exporting cancelled sessions',
          color: 'red',
          radius: 'md',
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
        });
      } finally {
        setIsExporting(false);
        closeExportModal();
      }
    },
    [cancelledSessions, closeExportModal]
  );

  return {
    exportModalOpened,
    openExportModal,
    closeExportModal,
    handleExport,
    isExporting,
  };
};
