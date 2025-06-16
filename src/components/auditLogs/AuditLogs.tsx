import React, { useState, useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Group, Menu, Badge, TextInput, Select, Button as MantineButton, Card, Loader } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useGetBookingAuditLogs } from '../../hooks/reactQuery';
import { BookingAuditLog } from '../../types/bookingTypes';
import MembersHeader from '../headers/MembersHeader';
import Table from '../common/Table';
import EmptyDataPage from '../common/EmptyDataPage';
import ErrorBoundary from '../common/ErrorBoundary';
import actionOptionIcon from '../../assets/icons/actionOption.svg';
import filterIcon from '../../assets/icons/filter.svg';
import { SearchIcon } from '../../assets/icons';

const columnHelper = createColumnHelper<BookingAuditLog>();

// Mobile-friendly audit log card component
const AuditLogCard = ({ log }: { log: BookingAuditLog }) => {
  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATED':
        return 'blue';
      case 'STATUS_CHANGED':
        return 'yellow';
      case 'EMAIL_SENT':
        return 'green';
      case 'EMAIL_FAILED':
        return 'red';
      case 'ADMIN_ACTION':
        return 'purple';
      case 'SYSTEM_ACTION':
        return 'gray';
      case 'CALENDAR_GENERATED':
        return 'teal';
      case 'CLIENT_CREATED':
        return 'lime';
      case 'CLIENT_CREATION_FAILED':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Card className="p-4 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header with timestamp and action */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900">
              {new Date(log.timestamp).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(log.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          <Badge 
            color={getActionBadgeColor(log.action)}
            variant="light"
            size="sm"
          >
            {log.action_display}
          </Badge>
        </div>

        {/* Booking details */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Booking Details</span>
            <span className="text-sm font-medium text-gray-900">#{log.booking_request.booking_reference}</span>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-700">{log.booking_request.client_name}</div>
            {log.booking_request.session && (
              <div className="text-xs text-gray-500">{log.booking_request.session.title}</div>
            )}
          </div>
        </div>

        {/* Details */}
        <div>
          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Details</span>
          <p className="text-sm text-gray-700 mt-1 leading-relaxed">{log.details}</p>
        </div>

        {/* User and time info */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="text-sm">
            {log.user ? (
              <div>
                <div className="font-medium text-gray-900">{log.user.full_name}</div>
                <div className="text-xs text-gray-500">{log.user.email}</div>
              </div>
            ) : (
              <span className="text-gray-500 italic">System</span>
            )}
          </div>
          <span className="text-xs text-gray-400">{log.time_since}</span>
        </div>
      </div>
    </Card>
  );
};

const AuditLogs = () => {
  const { data: auditLogs, isLoading, error } = useGetBookingAuditLogs();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  // Action type options for filtering
  const actionOptions = [
    { value: '', label: 'All Actions' },
    { value: 'CREATED', label: 'Booking Created' },
    { value: 'STATUS_CHANGED', label: 'Status Changed' },
    { value: 'EMAIL_SENT', label: 'Email Sent' },
    { value: 'EMAIL_FAILED', label: 'Email Failed' },
    { value: 'ADMIN_ACTION', label: 'Admin Action' },
    { value: 'SYSTEM_ACTION', label: 'System Action' },
    { value: 'CALENDAR_GENERATED', label: 'Calendar Generated' },
    { value: 'CLIENT_CREATED', label: 'Client Created' },
    { value: 'CLIENT_CREATION_FAILED', label: 'Client Creation Failed' },
  ];

  // Filter logs based on search and filters
  const filteredLogs = useMemo(() => {
    if (!auditLogs) return [];

    return auditLogs.filter((log: BookingAuditLog) => {
      // Search filter
      const matchesSearch = !searchTerm || 
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.booking_request.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.booking_request.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user?.full_name && log.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

      // Action filter
      const matchesAction = !actionFilter || log.action === actionFilter;

      // Date filters
      const logDate = new Date(log.timestamp);
      const matchesDateFrom = !dateFrom || logDate >= dateFrom;
      const matchesDateTo = !dateTo || logDate <= dateTo;

      return matchesSearch && matchesAction && matchesDateFrom && matchesDateTo;
    });
  }, [auditLogs, searchTerm, actionFilter, dateFrom, dateTo]);

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATED':
        return 'blue';
      case 'STATUS_CHANGED':
        return 'yellow';
      case 'EMAIL_SENT':
        return 'green';
      case 'EMAIL_FAILED':
        return 'red';
      case 'ADMIN_ACTION':
        return 'purple';
      case 'SYSTEM_ACTION':
        return 'gray';
      case 'CALENDAR_GENERATED':
        return 'teal';
      case 'CLIENT_CREATED':
        return 'lime';
      case 'CLIENT_CREATION_FAILED':
        return 'red';
      default:
        return 'gray';
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('timestamp', {
        header: 'Timestamp',
        cell: (info) => (
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-900">
              {new Date(info.getValue()).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(info.getValue()).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        ),
        size: 120,
      }),
      
      columnHelper.accessor('action', {
        header: 'Action',
        cell: (info) => (
          <Badge 
            color={getActionBadgeColor(info.getValue())}
            variant="light"
            size="sm"
          >
            {info.row.original.action_display}
          </Badge>
        ),
        size: 140,
      }),

      columnHelper.accessor('booking_request', {
        header: 'Booking Details',
        cell: (info) => {
          const booking = info.getValue();
          return (
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-900">
                #{booking.booking_reference}
              </div>
              <div className="text-xs text-gray-600">
                {booking.client_name}
              </div>
              <div className="text-xs text-gray-500">
                {booking.session && booking.session.title}
              </div>
            </div>
          );
        },
        size: 200,
      }),

      columnHelper.accessor('details', {
        header: 'Details',
        cell: (info) => (
          <div className="text-sm text-gray-700 max-w-xs">
            <p className="line-clamp-2" title={info.getValue()}>
              {info.getValue()}
            </p>
          </div>
        ),
        size: 300,
      }),

      columnHelper.accessor('user', {
        header: 'User',
        cell: (info) => {
          const user = info.getValue();
          return (
            <div className="text-sm">
              {user ? (
                <div className="space-y-1">
                  <div className="font-medium text-gray-900">{user.full_name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              ) : (
                <span className="text-gray-500 italic">System</span>
              )}
            </div>
          );
        },
        size: 150,
      }),

      columnHelper.accessor('time_since', {
        header: 'Time Ago',
        cell: (info) => (
          <span className="text-xs text-gray-500">
            {info.getValue()}
          </span>
        ),
        size: 100,
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
                  <img src={actionOptionIcon} alt='Action options' />
                </Menu.Target>
              </Menu>
            </Group>
          </div>
        ),
        cell: () => (
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
                  <img src={actionOptionIcon} alt='Action options' />
                </Menu.Target>
              </Menu>
            </Group>
          </div>
        ),
        size: 80,
      }),
    ],
    []
  );

  const clearFilters = () => {
    setSearchTerm('');
    setActionFilter(null);
    setDateFrom(null);
    setDateTo(null);
  };

  if (isLoading) {
    return (
      <div className='flex flex-col h-screen bg-gray-50 w-full overflow-y-auto'>
        <div className='bg-white border-b border-gray-100 shadow-sm'>
          <MembersHeader showSearch={true} />
        </div>
        <div className='flex-1 p-3 sm:p-4 lg:p-6'>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader size="lg" color="#1D9B5E" />
              <p className="mt-4 text-gray-600">Loading audit logs...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col h-screen bg-gray-50 w-full overflow-y-auto'>
        <div className='bg-white border-b border-gray-100 shadow-sm'>
          <MembersHeader showSearch={true} />
        </div>
        <div className='flex-1 p-3 sm:p-4 lg:p-6'>
          <ErrorBoundary />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className='flex flex-col h-screen bg-gray-50 w-full overflow-y-auto'>
        <div className='bg-white border-b border-gray-100 shadow-sm'>
          <MembersHeader showSearch={true} />
        </div>
        
        <div className='flex-1 p-3 sm:p-4 lg:p-6'>
          {/* Header */}
          <div className='mb-6 lg:mb-8'>
            <div className='px-2 sm:px-4 lg:px-6'>
              <h1 className='text-primary text-xl sm:text-2xl lg:text-3xl font-bold mb-2'>Audit Logs</h1>
              <p className='text-gray-600 text-sm lg:text-base'>Track all system activities and changes</p>
            </div>
          </div>

          <div className='px-2 sm:px-4 lg:px-6'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
              {/* Filters Section */}
              <div className='p-4 lg:p-6 border-b border-gray-200'>
                <div className='flex items-center gap-3 mb-4'>
                  <img src={filterIcon} alt='Filter' className='w-5 h-5' />
                  <h3 className='text-base font-semibold text-gray-900'>Filters</h3>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4'>
                  {/* Search */}
                  <TextInput
                    placeholder='Search logs..'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftSection={<SearchIcon className='w-4 h-4 text-gray-400' />}
                    className='w-full'
                  />

                  {/* Action Filter */}
                  <Select
                    placeholder='Filter by action'
                    data={actionOptions}
                    value={actionFilter}
                    onChange={setActionFilter}
                    clearable
                    className='w-full'
                  />

                  {/* Date From */}
                  <DateInput
                    placeholder='From date'
                    value={dateFrom}
                    onChange={setDateFrom}
                    clearable
                    className='w-full'
                  />

                  {/* Date To */}
                  <DateInput
                    placeholder='To date'
                    value={dateTo}
                    onChange={setDateTo}
                    clearable
                    className='w-full'
                  />
                </div>

                {/* Filter Stats and Clear */}
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100'>
                  <p className='text-sm text-gray-600'>
                    Showing {filteredLogs.length} of {auditLogs?.length || 0} audit logs
                  </p>
                  {(searchTerm || actionFilter || dateFrom || dateTo) && (
                    <MantineButton
                      variant='light'
                      color='gray'
                      size='sm'
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </MantineButton>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className='p-4 lg:p-6'>
                {filteredLogs.length === 0 ? (
                  <EmptyDataPage 
                    message="No audit logs found"
                    description="No logs match your current filter criteria"
                  />
                ) : (
                  <>
                    {/* Mobile Card View */}
                    <div className='block lg:hidden space-y-3'>
                      {filteredLogs.map((log) => (
                        <AuditLogCard key={`${log.id}-${log.timestamp}`} log={log} />
                      ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className='hidden lg:block'>
                      <Table
                        data={filteredLogs}
                        columns={columns}
                        pageSize={20}
                        showPagination={true}
                        className='shadow-none border-none'
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AuditLogs; 