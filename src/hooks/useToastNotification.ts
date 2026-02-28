import { useCallback } from 'react';
import { toast } from './useToast';

/**
 * Hook that provides convenient methods for showing toast notifications
 * This is a replacement for useNotification that uses the new toast system
 */
export const useToastNotification = () => {
  const showSuccess = useCallback((message: string, title?: string) => {
    toast({
      variant: 'success',
      title: title || 'Success',
      description: message,
    });
  }, []);

  const showError = useCallback((message: string, title?: string) => {
    toast({
      variant: 'error',
      title: title || 'Error',
      description: message,
    });
  }, []);

  const showWarning = useCallback((message: string, title?: string) => {
    toast({
      variant: 'warning',
      title: title || 'Warning',
      description: message,
    });
  }, []);

  const showInfo = useCallback((message: string, title?: string) => {
    toast({
      variant: 'info',
      title: title || 'Info',
      description: message,
    });
  }, []);

  const showNotification = useCallback(
    (message: string, variant: 'default' | 'success' | 'error' | 'warning' | 'info' = 'default', title?: string) => {
      toast({
        variant,
        title,
        description: message,
      });
    },
    []
  );

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
