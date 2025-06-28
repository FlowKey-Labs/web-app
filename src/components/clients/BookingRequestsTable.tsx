import React, { useState, useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge, Button, Group, Modal, Text, Textarea, Tooltip, Alert } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { BookingRequest } from '../../types/clientTypes';
import Table from '../common/Table';
import { formatDistanceToNow } from 'date-fns';
import { useCancelBookingRequest } from '../../hooks/reactQuery';
import { formatSessionTimes } from '../../utils/timezone';

interface BookingRequestsTableProps {
  data: BookingRequest[];
  onApprove: (requestId: number) => Promise<void>;
  onReject: (requestId: number, reason?: string) => Promise<void>;
  onCancel?: (requestId: number, reason?: string) => Promise<void>;
  isLoading?: boolean;
}

const columnHelper = createColumnHelper<BookingRequest>();

const BookingRequestsTable: React.FC<BookingRequestsTableProps> = ({
  data,
  onApprove,
  onReject,
  onCancel,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModalOpened, { open: openRejectModal, close: closeRejectModal }] = useDisclosure(false);
  const [cancelModalOpened, { open: openCancelModal, close: closeCancelModal }] = useDisclosure(false);

  const cancelBookingMutation = useCancelBookingRequest();

  const handleApprove = async (request: BookingRequest) => {
    setActionLoading(true);
    try {
      await onApprove(request.id);
      // Success notification handled by parent component
    } catch {
      // Error notification handled by parent component  
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    setActionLoading(true);
    try {
      await onReject(selectedRequest.id, rejectionReason);
      // Success notification handled by parent component
      closeRejectModal();
      setRejectionReason('');
    } catch {
      // Error notification handled by parent component
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedRequest) return;
    
    setActionLoading(true);
    try {
      if (onCancel) {
        await onCancel(selectedRequest.id, cancellationReason);
      } else {
        await cancelBookingMutation.mutateAsync({ 
          requestId: selectedRequest.id, 
          reason: cancellationReason 
        });
      }
      // Success notification handled by parent component or mutation
      closeCancelModal();
      setCancellationReason('');
    } catch {
      // Error notification handled by parent component or mutation
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectConfirmation = (request: BookingRequest) => {
    setSelectedRequest(request);
    openRejectModal();
  };

  const openCancelConfirmation = (request: BookingRequest) => {
    setSelectedRequest(request);
    openCancelModal();
  };

  const handleViewDetails = (booking: BookingRequest) => {
    navigate(`/booking-requests/${booking.id}`);
  };

  const getStatusColor = (status: BookingRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      case 'expired':
        return 'gray';
      default:
        return 'blue';
    }
  };

  const columns = useMemo(() => [
    columnHelper.accessor('client_name', {
      header: 'Client Name',
      cell: (info) => (
        <div className="flex flex-col">
          <Text size="sm" fw={500}>{info.getValue()}</Text>
          <Text size="xs" c="dimmed">{info.row.original.client_email}</Text>
        </div>
      ),
    }),
    columnHelper.accessor('client_phone', {
      header: 'Phone',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('session_title', {
      header: 'Session Details',
      cell: (info) => {
        const booking = info.row.original;
        const businessTimezone = booking.business_timezone || 'Africa/Nairobi';
        const sessionTimes = formatSessionTimes(booking.session_date, booking.session_end_time, businessTimezone);
        return (
          <div className="flex flex-col">
            <Text size="sm" fw={500}>{booking.session_title}</Text>
            <Text size="xs" c="dimmed">
              {new Date(booking.session_date).toLocaleDateString()} - {sessionTimes.timeRange}
            </Text>
            <Text size="xs" c="dimmed">{booking.category_name}</Text>
          </div>
        );
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <Badge color={getStatusColor(info.getValue())} variant="light">
          {info.getValue().charAt(0).toUpperCase() + info.getValue().slice(1)}
        </Badge>
      ),
    }),
    columnHelper.accessor('created_at', {
      header: 'Requested',
      cell: (info) => (
        <Tooltip label={new Date(info.getValue()).toLocaleString()}>
          <Text size="sm">
            {formatDistanceToNow(new Date(info.getValue()), { addSuffix: true })}
          </Text>
        </Tooltip>
      ),
    }),
    columnHelper.accessor('expires_at', {
      header: 'Expires',
      cell: (info) => {
        const expiresAt = new Date(info.getValue());
        const isExpired = expiresAt < new Date();
        return (
          <Tooltip label={expiresAt.toLocaleString()}>
            <Text size="sm" c={isExpired ? 'red' : 'dimmed'}>
              {isExpired ? 'Expired' : formatDistanceToNow(expiresAt, { addSuffix: true })}
            </Text>
          </Tooltip>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const request = info.row.original;
        const isPending = request.status === 'pending';
        const isApproved = request.status === 'approved';
        const isExpired = new Date(request.expires_at) < new Date();
        const canTakeAction = isPending && !isExpired;
        const canCancel = isApproved && !isExpired;
        
        return (
          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              onClick={() => handleViewDetails(request)}
            >
              View Details
            </Button>
            
            {canTakeAction && (
              <>
                <Button
                  size="xs"
                  color="green"
                  variant="light"
                  onClick={() => handleApprove(request)}
                  loading={actionLoading}
                >
                  Approve
                </Button>
                <Button
                  size="xs"
                  color="red"
                  variant="light"
                  onClick={() => openRejectConfirmation(request)}
                  loading={actionLoading}
                >
                  Reject
                </Button>
              </>
            )}
            
            {canCancel && (
              <Button
                size="xs"
                color="red"
                variant="light"
                onClick={() => openCancelConfirmation(request)}
                loading={actionLoading}
              >
                Cancel
              </Button>
            )}
          </Group>
        );
      },
    }),
  ], [actionLoading]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Text>Loading booking requests...</Text>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Alert color="blue" title="No Booking Requests" className="mt-4">
        <Text size="sm">
          No booking requests found. When clients use your booking links to request sessions, 
          they will appear here for your approval.
        </Text>
      </Alert>
    );
  }

  return (
    <>
      <Table<BookingRequest>
        data={data}
        columns={columns}
        className="mt-4"
        pageSize={10}
      />

      <Modal
        opened={rejectModalOpened}
        onClose={closeRejectModal}
        title="Reject Booking Request"
        centered
      >
        <div className="space-y-4">
          <Text size="sm">
            Are you sure you want to reject the booking request from{' '}
            <strong>{selectedRequest?.client_name}</strong>?
          </Text>
          
          <Textarea
            label="Rejection Reason (Optional)"
            placeholder="Let the client know why their request was rejected..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            minRows={3}
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={closeRejectModal}>
              Cancel
            </Button>
            <Button 
              color="red" 
              onClick={handleReject}
              loading={actionLoading}
            >
              Reject Request
            </Button>
          </Group>
        </div>
      </Modal>

      <Modal
        opened={cancelModalOpened}
        onClose={closeCancelModal}
        title="Cancel Booking Request"
        centered
      >
        <div className="space-y-4">
          <Text size="sm">
            Are you sure you want to cancel the booking request from{' '}
            <strong>{selectedRequest?.client_name}</strong>?
          </Text>
          
          <Textarea
            label="Cancellation Reason (Optional)"
            placeholder="Let the client know why their request was cancelled..."
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            minRows={3}
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={closeCancelModal}>
              Cancel
            </Button>
            <Button 
              color="red" 
              onClick={handleCancel}
              loading={actionLoading}
            >
              Cancel Request
            </Button>
          </Group>
        </div>
      </Modal>
    </>
  );
};

export default BookingRequestsTable; 