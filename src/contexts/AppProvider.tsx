import React, { ReactNode } from 'react';
import { ConfigProvider } from './ConfigContext';
import { TrackingCycleProvider } from './TrackingCycleContext';
import { ThemeProvider } from './ThemeContext';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <ConfigProvider>
        <TrackingCycleProvider>
          {children}
        </TrackingCycleProvider>
      </ConfigProvider>
    </ThemeProvider>
  );
};
