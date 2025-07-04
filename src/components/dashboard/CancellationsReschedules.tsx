import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@mantine/core';
import { CancellationData } from '../../types/dashboard';

interface CancellationsReschedulesProps {
  data: {
    total_cancellations: number;
    total_reschedules: number;
    trend: number;
    daily_data: CancellationData[];
  };
  isLoading: boolean;
}

export function CancellationsReschedules({ data, isLoading }: CancellationsReschedulesProps) {
  if (isLoading) {
    return <Skeleton height={200} radius="md" />;
  }

  const { total_cancellations, total_reschedules, trend, daily_data } = data;
  const isTrendPositive = trend >= 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-600 font-medium">Cancellations</p>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-bold text-red-900">{total_cancellations}</span>
            <span className={`ml-2 text-sm ${isTrendPositive ? 'text-red-600' : 'text-green-600'}`}>
              {isTrendPositive ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Reschedules</p>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-bold text-blue-900">{total_reschedules}</span>
            <span className={`ml-2 text-sm ${isTrendPositive ? 'text-red-600' : 'text-green-600'}`}>
              {isTrendPositive ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={daily_data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              width={25}
            />
            <Tooltip 
              contentStyle={{
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '8px',
                fontSize: '12px',
              }}
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                });
              }}
            />
            <Line 
              type="monotone" 
              dataKey="cancellations" 
              stroke="#EF4444" 
              strokeWidth={2}
              dot={false}
              name="Cancellations"
            />
            <Line 
              type="monotone" 
              dataKey="reschedules" 
              stroke="#3B82F6" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Reschedules"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
