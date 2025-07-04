import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface BarData {
  day: string;
  clients: number;
}

interface BarGraphProps {
  data: BarData[];
  height?: number | string;
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-md border border-gray-100">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-primary-600 font-semibold">
          {payload[0].value} {payload[0].value === 1 ? 'client' : 'clients'}
        </p>
      </div>
    );
  }
  return null;
};

export function BarGraph({ data, height = 300, className = '' }: BarGraphProps) {
  const maxValue = Math.max(...data.map(item => item.clients), 10);
  const yAxisTicks = Array.from({ length: Math.min(5, maxValue + 1) }, (_, i) => 
    Math.ceil((maxValue * i) / 4)
  );

  return (
    <div className={`w-full ${className}`} style={{ height: typeof height === 'number' ? `${height}px` : height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
          barSize={24}
        >
          <defs>
            <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00A76F" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#00A76F" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            vertical={false} 
            stroke="#f0f0f0" 
            strokeDasharray="3 3" 
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickMargin={12}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickMargin={10}
            ticks={yAxisTicks}
            domain={[0, maxValue]}
            width={30}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(0, 167, 111, 0.05)' }}
          />
          <Bar
            dataKey="clients"
            radius={[4, 4, 0, 0]}
            fill="url(#colorBar)"
            barSize={35}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
