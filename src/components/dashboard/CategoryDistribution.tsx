import { Progress, Skeleton } from '@mantine/core';
import type { CategoryDistribution } from '../../types/categoryDistribution';
import { useGetCategoryDistribution } from '../../hooks/react_query_hooks/analyticsHooks';

export function CategoryDistribution() {
  const { data, isLoading } = useGetCategoryDistribution();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <Skeleton height={16} width={80} />
              <Skeleton height={16} width={40} />
            </div>
            <Skeleton height={8} radius="xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data?.categories?.map(({ id, name, session_count }) => (
        <div key={id}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-900">{name}</span>
            <span className="text-gray-600">{session_count} sessions</span>
          </div>
          <Progress
            value={session_count / data?.total_sessions * 100}
            color="#00A76F"
            radius="xl"
            size="sm"
            className="[&>div:first-child]:bg-green-100"
          />
        </div>
      ))}
      {data?.categories?.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No category data available
        </p>
      )}
    </div>
  );
}
