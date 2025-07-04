import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

const GENDER_COLORS: Record<string, string> = {
  Male: '#00A76F',
  Female: '#FF4081',
  Other: '#4D96FF',
  'Prefer not to say': '#9B51E0',
  default: '#EEEEF0',
};

interface DonutChartData {
  name: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  height?: number;
  width?: number;
  innerRadius?: number | string;
  outerRadius?: number | string;
}

export function DonutChart({
  data,
  height = 400,
  width = 400,
  innerRadius = '60%',
  outerRadius = '80%',
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const normalizedData = data.reduce((acc, item) => {
    const gender = item.name
      ? item.name.trim().charAt(0).toUpperCase() +
        item.name.trim().slice(1).toLowerCase()
      : 'Unknown';

    // Find existing entry
    const existing = acc.find((x) => x.name === gender);

    if (existing) {
      // Sum values for duplicate genders
      existing.value += item.value;
    } else {
      // Add new entry
      acc.push({
        ...item,
        name: gender,
        value: item.value,
      });
    }
    return acc;
  }, [] as DonutChartData[]);

  const chartData = normalizedData.map((item) => {
    const color = GENDER_COLORS[item.name] || GENDER_COLORS['default'];
    const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;

    return {
      ...item,
      color: item.color || color,
      percentage,
      label: `${item.name}: ${item.value} (${percentage}%)`,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className='bg-white p-3 rounded-lg shadow-md border border-gray-100 text-sm'>
          <p className='font-medium text-gray-900 mb-1'>{data.name}</p>
          <div className='flex items-center gap-2'>
            <div
              className='w-3 h-3 rounded-full flex-shrink-0'
              style={{ backgroundColor: data.color }}
            />
            <span className='text-gray-700'>
              {data.value} client{data.value !== 1 ? 's' : ''}
            </span>
            <span className='text-primary-600 font-semibold ml-2'>
              {data.percentage}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Check if there's any data to display
  const hasData = chartData.some(item => item.value > 0);

  if (!hasData) {
    return (
      <div className='w-full h-full flex flex-col items-center justify-center p-4 text-center'>
        <div className='text-gray-400 mb-2'>
          <svg xmlns="http://www.w3.org/2000/svg" className='h-12 w-12 mx-auto' fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className='text-gray-500 text-sm'>No data available for this period</p>
      </div>
    );
  }

  return (
    <div className='w-full h-full flex flex-col items-center justify-center'>
      <div className='relative' style={{ width, height }}>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={chartData}
              cx='50%'
              cy='50%'
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              dataKey='value'
              startAngle={90}
              endAngle={-270}
              label={({ name, percentage }) => `${name} ${percentage}%`}
              labelLine={true}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke='#fff'
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout='horizontal'
              verticalAlign='bottom'
              align='center'
              iconType='circle'
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DonutChart;
