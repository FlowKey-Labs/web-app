import { useNavigate, useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import MembersHeader from "../headers/MembersHeader";
import Button from "../common/Button";
import { useUIStore } from "../../store/ui";

import {
  useGetStaffMember,
  useGetStaffSessions,
} from "../../hooks/reactQuery";

import avatar from "../../assets/icons/newAvatar.svg";
import editIcon from "../../assets/icons/edit.svg";
import Table from "../common/Table";
import { navigateToSessionDetails } from "../../utils/navigationHelpers";
import { Session } from "../../types/sessionTypes";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<Session>();

const StaffDetails = () => {
  const { id: staffId } = useParams();
  const {
    data: staffDetails,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetStaffMember(staffId || "");
  const navigate = useNavigate();
  const [rowSelection, setRowSelection] = useState({});
  
  const { openDrawer } = useUIStore();

  const handleOpenEditDrawer = () => {
    if (staffId) {
      openDrawer({
        type: 'staff',
        entityId: staffId,
        isEditing: true
      });
    }
  };

  const sessionColumns = useMemo(
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
            onClick={(e) => e.stopPropagation()}
            onChange={row.getToggleSelectedHandler()}
            className='w-4 h-4 rounded cursor-pointer bg-[#F7F8FA] accent-[#DBDEDF]'
          />
        ),
      }),
      columnHelper.accessor('title', {
        header: 'Session',
        cell: (info) => (
          <div className='text-start'>
            <p className='font-medium text-gray-900 text-sm'>
              {info.getValue()}
            </p>
            <p className='text-xs text-gray-500'>
              {info.row.original.category?.name || ''}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor('class_type', {
        header: 'Session Type',
        cell: (info) => {
          const SessionType = info.getValue();
          return SessionType
            ? SessionType.charAt(0).toUpperCase() + SessionType.slice(1)
            : '';
        },
      }),
      columnHelper.accessor('spots', {
        header: 'Slots',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('date', {
        header: 'Date',
        cell: (info) => {
          const dateValue = info.getValue();
          const date = new Date(dateValue);
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        },
      }),
      columnHelper.accessor(
        (row) => ({ start: row.start_time, end: row.end_time }),
        {
          id: 'duration',
          header: 'Duration',
          cell: (info) => {
            const { start, end } = info.getValue();

            const formatTo12Hour = (isoDateTimeStr: string) => {
              if (!isoDateTimeStr || typeof isoDateTimeStr !== 'string')
                return isoDateTimeStr;

              try {
                const timePart = isoDateTimeStr.split('T')[1];
                if (!timePart) {
                  return isoDateTimeStr;
                }

                const timeComponents = timePart.split(':');
                let hours = parseInt(timeComponents[0], 10);
                const minutes = timeComponents[1].padStart(2, '0');

                const ampm = hours >= 12 ? 'PM' : 'AM';

                hours = hours % 12;
                hours = hours ? hours : 12;

                return `${hours}:${minutes} ${ampm}`;
              } catch (e) {
                console.error('Error formatting time:', isoDateTimeStr, e);
                return isoDateTimeStr;
              }
            };

            return `${formatTo12Hour(start)} - ${formatTo12Hour(end)}`;
          },
        }
      ),
      columnHelper.accessor(
        (row) => ({
          repeat_on: row.repeat_on,
          repeat_unit: row.repeat_unit,
          repeat_every: row.repeat_every,
        }),
        {
          id: 'repeats',
          header: 'Repeats',
          cell: (info) => {
            const { repeat_on, repeat_unit, repeat_every } = info.getValue();

            const dayMap: Record<number, string> = {
              1: 'Mon',
              2: 'Tue',
              3: 'Wed',
              4: 'Thu',
              5: 'Fri',
              6: 'Sat',
              0: 'Sun',
            };

            if (repeat_unit === 'days' && repeat_every) {
              return `Daily`;
            }

            if (repeat_unit === 'weeks') {
              return `Weekly`;
            }
            if (repeat_unit === 'months' && repeat_every) {
              return `Monthly`;
            }

            if (repeat_on && repeat_on.length > 0) {
              return repeat_on
                .map((day: string) => dayMap[Number(day)] || '')
                .join(', ');
            }

            return 'No Repeats';
          },
        }
      ),
      columnHelper.accessor('is_active', {
        header: 'Status',
        cell: (info) => (
          <span
            className={`inline-block px-2 py-1 rounded-lg text-sm text-center min-w-[70px] ${
              info.getValue()
                ? 'bg-active text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {info.getValue() ? 'Active' : 'Inactive'}
          </span>
        ),
      }),
    ],
    []
  );

  const {
    data: staffSessionsData,
  } = useGetStaffSessions(staffDetails?.id);

  if (!staffDetails) {
    return (
      <div className="p-8">
        <h2 className="text-[40px] font-bold text-primary">Staff not found</h2>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full min-h-screen space-y-6 bg-white rounded-lg p-6">
        <p className="text-primary">Loading staff details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full min-h-screen space-y-6 bg-white rounded-lg p-6">
        <div className="space-y-4">
          <p className="text-red-500">
            Error loading staff details: {error?.message}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-cardsBg w-full pl-16 overflow-y-auto">
      <MembersHeader
        title="Staff Details"
        showFilterIcons={false}
        showButton={false}
        showSearch={false}
      />
      <div className="flex flex-col justify-center items-center mt-10 space-y-4 pb-4">
        <div className="border items-center rounded-xl w-[95%] p-8 bg-white">
          <div className="flex justify-between">
            <div className="flex justify-center items-center gap-4">
              <img
                src={staffDetails.profileImage || avatar}
                alt="avatar"
                className="rounded-full w-12 h-12 object-cover"
              />
              <div className="text-primary space-y-1">
                <p className="text-sm font-semibold">
                  {staffDetails?.user?.first_name}{" "}
                  {staffDetails?.user?.last_name}
                </p>
                <p className="text-xs text-gray-400 font-semibold">
                  {staffDetails.role}
                </p>
                <span className="text-xs text-gray-400 font-semibold">
                  ID:{staffDetails?.member_id}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-xl w-[95%] p-8 bg-white">
          <div className="flex justify-between items-start">
            <h3 className="text-primary text-sm font-semibold mb-4">
              Personal Information
            </h3>
            <Button
              variant="outline"
              color="gray"
              radius="md"
              h="40"
              leftSection={
                <img src={editIcon} alt="edit" className="w-4 h-4" />
              }
              size="sm"
              onClick={handleOpenEditDrawer}
            >
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">First Name</p>
              <p className="text-sm text-gray-500">
                {staffDetails?.user?.first_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Last Name</p>
              <p className="text-sm text-gray-500">
                {staffDetails?.user?.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Email Address</p>
              <p className="text-sm text-gray-500">
                {staffDetails?.user?.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Phone Number</p>
              <p className="text-sm text-gray-500">
                {staffDetails?.user?.mobile_number || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Staff Role</p>
              <p className="text-sm text-gray-500">
                {staffDetails?.user?.role?.name || "No role assigned"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Staff ID</p>
              <p className="text-sm text-gray-500">
                {staffDetails?.member_id || "Not assigned"}
              </p>
            </div>
          </div>
        </div>

        <div className="border rounded-xl w-[95%] p-8 bg-white">
          <div className="flex justify-between items-start">
            <h3 className="text-primary text-md font-semibold mb-4">
              Assigned Sessions
            </h3>
          </div>
          <div className="w-full">
          <Table
            data={staffSessionsData || []}
            columns={sessionColumns}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            className='mt-4'
            pageSize={7}
            onRowClick={(row: Session) =>
              navigateToSessionDetails(navigate, row.id.toString())
            }
          />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetails;
