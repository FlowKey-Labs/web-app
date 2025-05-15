import { useParams } from 'react-router-dom';
import MembersHeader from '../headers/MembersHeader';
import { Drawer, Loader } from '@mantine/core';
import { useMemo, useState } from 'react';
import Table from '../common/Table';
import { createColumnHelper } from '@tanstack/react-table';
import { useGetGroup, useGetGroupMembers } from '../../hooks/reactQuery';
import avatar from '../../assets/icons/newAvatar.svg';
import { Client, GroupData } from '../../types/clientTypes';
import { useNavigate } from 'react-router-dom';
import UpdateGroup from './updateGroup';

const GroupDetails = () => {
  const { id: groupId } = useParams();
  const navigate = useNavigate();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState({});

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const {
    data: groupDetails,
    isLoading,
    isError,
    error,
    refetch: refetchGroup,
  } = useGetGroup(groupId || '') as { data: GroupData | undefined, isLoading: boolean, isError: boolean, error: any, refetch: () => void };

  const {
    data: groupMembers = [],
    isLoading: membersLoading,
    error: membersError,
  } = useGetGroupMembers(groupId || '');

  const memberColumnHelper = createColumnHelper<Client>();
  const memberColumns = useMemo(
    () => [
      memberColumnHelper.accessor(
        (row) => `${row.first_name} ${row.last_name}`,
        { header: 'Name' }
      ),
      memberColumnHelper.accessor('email', { header: 'Email' }),
      memberColumnHelper.accessor('phone_number', { header: 'Phone' }),
      memberColumnHelper.accessor('active', {
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

  const isPageLoading = isLoading || membersLoading;

  if (isPageLoading) {
    return (
      <div className='flex justify-center items-center h-screen p-6 pt-12'>
        <Loader size='xl' color='#1D9B5E' />
      </div>
    );
  }

  if (isError) {
    return (
      <div className='w-full space-y-6 bg-white rounded-lg p-6'>
        <div className='space-y-4'>
          <p className='text-red-500'>
            Error loading group details:{' '}
            {error?.message || membersError?.message}
          </p>
          {/* TODO: Add retry buttons */}
        </div>
      </div>
    );
  }

  if (!groupDetails) {
    return (
      <div className='w-full min-h-screen space-y-6 bg-white rounded-lg p-6'>
        <p className='text-primary'>Group not found</p>
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-col h-screen bg-cardsBg w-full overflow-y-auto '>
        <MembersHeader
          title='Group Details'
          buttonText='Update Group'
          searchPlaceholder='Search Members...'
          onButtonClick={openDrawer}
          showFilterIcons={false}
        />
        <div className='items-center gap-4 p-6'>
          <div className='flex w-full'>
            <div className='flex flex-col w-[30%] items-center mt-6'>
              <div className='flex flex-col px-4 py-8 items-center justify-center border bg-white rounded-xl w-[290px]'>
                <div className='w-14 h-14 rounded-full flex items-center justify-center mb-2'>
                  <img src={avatar} alt='' />
                </div>
                <div className='mt-2 text-center space-y-1'>
                  <p className='font-medium text-gray-900 text-sm'>
                    {groupDetails.name}
                  </p>
                  <p className='text-sm text-gray-500'>
                    {groupDetails.description || 'No description'}
                  </p>
                </div>
                <div className='flex space-x-2 mt-4'>
                  <div
                    className={`flex justify-center items-center py-1.5 px-3 rounded-full gap-1.5 ${
                      groupDetails.active
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        groupDetails.active
                          ? 'bg-secondary animate-pulse'
                          : 'bg-red-500'
                      }`}
                    ></div>
                    <p
                      className={`text-xs font-medium ${
                        groupDetails.active ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {groupDetails.active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                <div className='h-[1px] bg-gray-300 w-full my-6'></div>
                <div className='w-full px-4 space-y-4'>
                  <div className='flex justify-between items-center w-full text-sm'>
                    <span className='text-gray-400 font-bold text-xs'>
                      GROUP ID
                    </span>
                    <span className='text-gray-400  text-xs'>
                      {groupDetails.id || 'N/A'}
                    </span>
                  </div>
                  <div className='flex justify-between items-center w-full text-sm'>
                    <span className='text-gray-400 font-bold text-xs'>
                      MEMBERS
                    </span>
                    <span className='text-gray-400  text-xs'>
                      {groupDetails.member_count ?? groupMembers.length}
                    </span>
                  </div>
                  <div className='flex justify-between items-center w-full text-sm'>
                    <span className='text-gray-400 font-bold text-xs'>
                      LOCATION
                    </span>
                    <span className='text-gray-400  text-xs'>
                      {groupDetails.location || 'N/A'}
                    </span>
                  </div>
                  {groupDetails.contact_person && (
                  <div className='flex justify-between items-center w-full text-sm'>
                    <span className='text-gray-400 font-bold text-xs'>
                      CONTACT PERSON
                    </span>
                    <span className='text-gray-400 text-xs'>
                      {groupDetails.contact_person.first_name} {groupDetails.contact_person.last_name}
                    </span>
                  </div>
                  )}
                </div>
                {groupDetails.created_at && (
                  <>
                    <div className='h-[1px] bg-gray-300 w-[80%] mx-auto my-6'></div>
                    <div className='w-full px-4'>
                      <div className='flex justify-between items-center w-full text-sm'>
                        <span className='text-gray-400 font-bold text-xs'>
                          DATE CREATED
                        </span>
                        <span className='text-gray-400 text-xs'>
                          {new Date(
                            groupDetails.created_at
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className=' w-[70%] p-4'>
              <div className='flex-1 mt-6'>
                <div className=''>
                  <div className='flex justify-between'>
                    <h3 className='text-primary text-xl font-semibold'>
                      Group Members ({groupMembers.length})
                    </h3>
                  </div>
                  <div className='flex-1 py-2'>
                    {groupMembers.length > 0 ? (
                      <Table
                        data={groupMembers}
                        columns={memberColumns}
                        rowSelection={rowSelection}
                        onRowSelectionChange={setRowSelection}
                        className='mt-4'
                        pageSize={10}
                        onRowClick={(row: Client) =>
                          navigate(`/clients/${row.id}`)
                        }
                      />
                    ) : (
                      <p className='mt-4 text-gray-500'>
                        No members found in this group.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Drawer
          opened={isDrawerOpen}
          onClose={closeDrawer}
          title="Update Group"
          position="right"
          size="md"
          overlayProps={{ opacity: 0.5, blur: 4 }}
        >
          {groupDetails && (
            <UpdateGroup 
              groupData={groupDetails} 
              onSuccess={() => {
                closeDrawer();
                refetchGroup();
              }}
            />
          )}
        </Drawer>
      </div>
    </>
  );
};

export default GroupDetails;
