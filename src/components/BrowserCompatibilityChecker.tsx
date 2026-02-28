import { useEffect, useState } from 'react';
import { detectBrowser, checkBrowserFeatures } from '../utils/browserDetection';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';

/**
 * Browser Compatibility Checker Component
 * Displays warnings if the user's browser is not fully supported
 */
export function BrowserCompatibilityChecker() {
  const [showWarning, setShowWarning] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<string>('');

  useEffect(() => {
    const browser = detectBrowser();
    const features = checkBrowserFeatures();

    // Check if browser is supported
    if (!browser.isSupported) {
      setBrowserInfo(`${browser.name} ${browser.version}`);
      setShowWarning(true);
      return;
    }

    // Check for critical missing features
    const criticalFeatures = [
      'flexbox',
      'grid',
      'customProperties',
      'localStorage',
    ];

    const missingFeatures = criticalFeatures.filter(
      (feature) => !features[feature as keyof typeof features]
    );

    if (missingFeatures.length > 0) {
      setBrowserInfo(
        `${browser.name} ${browser.version} (missing: ${missingFeatures.join(', ')})`
      );
      setShowWarning(true);
    }
  }, []);

  if (!showWarning) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Browser Compatibility Warning</AlertTitle>
        <AlertDescription>
          Your browser ({browserInfo}) may not fully support all features of this
          application. For the best experience, please use the latest version of
          Chrome, Firefox, Safari, or Edge.
        </AlertDescription>
      </Alert>
    </div>
  );
}
