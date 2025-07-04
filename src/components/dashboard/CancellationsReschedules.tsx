import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Skeleton,
  Card,
  Title,
  Text,
  Paper,
  Stack,
  Grid,
  Tabs,
  Badge,
  Select,
} from '@mantine/core';
import { useGetCancellationRescheduleAnalytics } from '../../hooks/react_query_hooks/analyticsHooks';
import { format } from 'date-fns';

const timeFilterOptions = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'this_year', label: 'This Year' },
];

export function CancellationsReschedules() {
  const [timeFilter, setTimeFilter] = useState('last_30_days');
  const { data, isLoading, error, rawData } =
    useGetCancellationRescheduleAnalytics(timeFilter);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions'>(
    'overview'
  );

  if (isLoading) {
    return <Skeleton height={600} radius='md' />;
  }

  if (error) {
    return (
      <Paper p='md' withBorder>
        <Text color='red'>Error loading data: {error.message}</Text>
        <Text size='sm' mt='sm'>
          Check the browser console for more details.
        </Text>
      </Paper>
    );
  }

  if (!data) {
    return (
      <Paper p='md' withBorder>
        <Text color='orange'>
          No data available for the selected time period
        </Text>
        <Text size='sm' mt='sm'>
          Raw response: {JSON.stringify(rawData, null, 2)}
        </Text>
      </Paper>
    );
  }

  const responseData = data.data || data;

  const {
    summary = {
      total_cancellations: 0,
      total_reschedules: 0,
      cancellation_rate: 0,
      time_period: {
        start: new Date().toISOString(),
        end: new Date().toISOString(),
      },
    },
    time_series = { cancellations: [], reschedules: [] },
    top_metrics = { cancelled_sessions: [], rescheduled_sessions: [] },
  } = responseData || {};

  // Create a map to combine data by date
  const dateMap = new Map();

  (time_series.cancellations || []).forEach((item) => {
    if (item?.created_date) {
      const date = new Date(item.created_date);
      const dateKey = date.toISOString().split('T')[0];
      dateMap.set(dateKey, {
        date: format(date, 'MMM d'),
        originalDate: date,
        cancellations: Number(item.count) || 0,
        reschedules: 0,
      });
    }
  });

  (time_series.reschedules || []).forEach((item) => {
    if (item?.created_date) {
      const date = new Date(item.created_date);
      const dateKey = date.toISOString().split('T')[0];
      const existing = dateMap.get(dateKey) || {
        date: format(date, 'MMM d'),
        originalDate: date,
        cancellations: 0,
        reschedules: 0,
      };
      dateMap.set(dateKey, {
        ...existing,
        reschedules: (Number(item.count) || 0) + (existing?.reschedules || 0),
      });
    }
  });

  const combinedTimeSeries = Array.from(dateMap.values()).sort(
    (a, b) => a.originalDate - b.originalDate
  );

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <Title order={3}>Cancellations & Reschedules</Title>
        <Select
          data={timeFilterOptions}
          value={timeFilter}
          onChange={(value) => setTimeFilter(value || 'last_30_days')}
          className='w-48'
        />
      </div>

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value as any)}>
        <Tabs.List>
          <Tabs.Tab value='overview'>Overview</Tabs.Tab>
          <Tabs.Tab value='sessions'>Top Sessions</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value='overview' pt='md'>
          <Grid gutter='md'>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card withBorder radius='md' p='md'>
                <Text size='sm' color='dimmed' mb='md'>
                  Summary
                </Text>
                <Stack gap='md'>
                  <div>
                    <Text size='sm' color='dimmed'>
                      Total Cancellations
                    </Text>
                    <Text size='xl' fw={700} color='red'>
                      {summary.total_cancellations}
                    </Text>
                  </div>
                  <div>
                    <Text size='sm' color='dimmed'>
                      Total Reschedules
                    </Text>
                    <Text size='xl' fw={700} color='blue'>
                      {summary.total_reschedules}
                    </Text>
                  </div>
                  <div>
                    <Text size='sm' color='dimmed'>
                      Cancellation Rate
                    </Text>
                    <Text size='xl' fw={700}>
                      {summary.cancellation_rate.toFixed(1)}%
                    </Text>
                  </div>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 8 }}>
              <Card withBorder radius='md' p='md'>
                <Text size='sm' color='dimmed' mb='md'>
                  Trend Over Time
                </Text>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={combinedTimeSeries}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='date' />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type='monotone'
                        dataKey='cancellations'
                        name='Cancellations'
                        stroke='#ef4444'
                        strokeWidth={2}
                      />
                      <Line
                        type='monotone'
                        dataKey='reschedules'
                        name='Reschedules'
                        stroke='#3b82f6'
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value='sessions' pt='md'>
          <Grid gutter='md'>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder radius='md' p='md'>
                <Text size='sm' color='dimmed' mb='md'>
                  Top Cancelled Sessions
                </Text>
                <Stack gap='sm'>
                  {top_metrics.cancelled_sessions.length > 0 ? (
                    top_metrics.cancelled_sessions.map((session) => (
                      <div
                        key={session.session__id}
                        className='flex justify-between items-center p-2 hover:bg-gray-50 rounded'
                      >
                        <div>
                          <Text fw={500}>{session.session__title}</Text>
                          <Text size='sm' color='dimmed'>
                            {session.session__session_type}
                          </Text>
                        </div>
                        <Badge color='red' size='lg'>
                          {session.count}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <Text color='dimmed'>No cancellation data available</Text>
                  )}
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder radius='md' p='md'>
                <Text size='sm' color='dimmed' mb='md'>
                  Top Rescheduled Sessions
                </Text>
                <Stack gap='sm'>
                  {top_metrics.rescheduled_sessions.length > 0 ? (
                    top_metrics.rescheduled_sessions.map((session) => (
                      <div
                        key={session.session__id}
                        className='flex justify-between items-center p-2 hover:bg-gray-50 rounded'
                      >
                        <div>
                          <Text fw={500}>{session.session__title}</Text>
                          <Text size='sm' color='dimmed'>
                            {session.session__session_type}
                          </Text>
                        </div>
                        <Badge color='blue' size='lg'>
                          {session.count}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <Text color='dimmed'>No reschedule data available</Text>
                  )}
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
