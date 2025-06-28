import React from 'react';
import WithBrandingLayout from '../components/common/WithBrandingLayout';

interface WithBrandingOptions {
  showHelpText?: boolean;
}

export function withBranding<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  options: WithBrandingOptions = { showHelpText: true }
) {
  const WithBrandingHOC = (props: T) => {
    return (
      <WithBrandingLayout showHelpText={options.showHelpText}>
        <WrappedComponent {...props} />
      </WithBrandingLayout>
    );
  };

  WithBrandingHOC.displayName = `withBranding(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithBrandingHOC;
} 