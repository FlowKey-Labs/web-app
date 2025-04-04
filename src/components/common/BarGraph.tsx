import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { chartData } from '../../utils/dummyData';

export function BarGraph() {
  return (
    <div className='w-full h-[300px]'>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray='3 3' vertical={false} />
          <XAxis
            dataKey='day'
            axisLine={false}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            ticks={[0, 10, 20, 30, 40, 50]}
            domain={[0, 50]}
          />
          <Tooltip
            cursor={false}
            contentStyle={{
              background: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '8px',
            }}
          />
          <Bar
            dataKey='clients'
            fill='#00A76F'
            radius={[4, 4, 0, 0]}
            barSize={35}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
