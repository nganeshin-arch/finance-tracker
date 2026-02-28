import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { detectBrowser, checkBrowserFeatures, logBrowserInfo } from '../utils/browserDetection';
import { 
  getViewportSize, 
  getCurrentBreakpoint, 
  isTouchDevice, 
  getDevicePixelRatio,
  getOrientation,
  validateTouchTargets,
  logResponsiveInfo,
  BREAKPOINTS
} from '../utils/responsiveTest';
import { 
  testCSSFeatures, 
  testTailwindFeatures, 
  getUnsupportedFeatures,
  logCSSCompatibility 
} from '../utils/cssCompatibility';
import { CheckCircle2, XCircle, Info, Monitor, Smartphone, Tablet } from 'lucide-react';

/**
 * Browser Test Page
 * Comprehensive testing page for cross-browser compatibility
 */
export default function BrowserTestPage() {
  const [browserInfo] = useState(detectBrowser());
  const [features] = useState(checkBrowserFeatures());
  const [viewport, setViewport] = useState(getViewportSize());
  const [breakpoint, setBreakpoint] = useState(getCurrentBreakpoint());
  const [cssFeatures] = useState(testCSSFeatures());
  const [tailwindFeatures] = useState(testTailwindFeatures());

  useEffect(() => {
    const handleResize = () => {
      setViewport(getViewportSize());
      setBreakpoint(getCurrentBreakpoint());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogAll = () => {
    logBrowserInfo();
    logResponsiveInfo();
    logCSSCompatibility();
  };

  const handleValidateTouchTargets = () => {
    validateTouchTargets();
  };

  const unsupportedFeatures = getUnsupportedFeatures();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Browser Compatibility Test</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive cross-browser testing utilities
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleLogAll} variant="outline">
            Log All Info
          </Button>
          <Button onClick={handleValidateTouchTargets} variant="outline">
            Validate Touch Targets
          </Button>
        </div>
      </div>

      <Tabs defaultValue="browser" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browser">Browser</TabsTrigger>
          <TabsTrigger value="responsive">Responsive</TabsTrigger>
          <TabsTrigger value="css">CSS Features</TabsTrigger>
          <TabsTrigger value="visual">Visual Tests</TabsTrigger>
        </TabsList>

        {/* Browser Information Tab */}
        <TabsContent value="browser" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Browser Information</CardTitle>
              <CardDescription>Details about your current browser</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Browser</p>
                  <p className="text-lg font-semibold">{browserInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Version</p>
                  <p className="text-lg font-semibold">{browserInfo.version}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Engine</p>
                  <p className="text-lg font-semibold">{browserInfo.engine}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Supported</p>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    {browserInfo.isSupported ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Yes
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        No
                      </>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Browser Features</CardTitle>
              <CardDescription>Support for modern web features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(features).map(([feature, supported]) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 p-2 rounded-lg border"
                  >
                    {supported ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    )}
                    <span className="text-sm capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tailwind CSS Features</CardTitle>
              <CardDescription>Tailwind-specific feature support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(tailwindFeatures).map(([feature, supported]) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 p-2 rounded-lg border"
                  >
                    {supported ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    )}
                    <span className="text-sm capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Responsive Design Tab */}
        <TabsContent value="responsive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Viewport Information</CardTitle>
              <CardDescription>Current viewport and device details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Width</p>
                  <p className="text-lg font-semibold">{viewport.width}px</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Height</p>
                  <p className="text-lg font-semibold">{viewport.height}px</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Breakpoint</p>
                  <p className="text-lg font-semibold uppercase">{breakpoint}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Touch Device</p>
                  <p className="text-lg font-semibold">{isTouchDevice() ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pixel Ratio</p>
                  <p className="text-lg font-semibold">{getDevicePixelRatio()}x</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Orientation</p>
                  <p className="text-lg font-semibold capitalize">{getOrientation()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Standard Breakpoints</CardTitle>
              <CardDescription>Test at common device sizes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {BREAKPOINTS.map((bp) => (
                  <div
                    key={bp.name}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                  >
                    {bp.width < 640 ? (
                      <Smartphone className="h-5 w-5 text-blue-600" />
                    ) : bp.width < 1024 ? (
                      <Tablet className="h-5 w-5 text-green-600" />
                    ) : (
                      <Monitor className="h-5 w-5 text-purple-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{bp.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {bp.width}x{bp.height}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CSS Features Tab */}
        <TabsContent value="css" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CSS Feature Support</CardTitle>
              <CardDescription>
                Support for CSS features used in the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unsupportedFeatures.length > 0 && (
                <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900 dark:text-yellow-100">
                        Unsupported Features
                      </p>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                        {unsupportedFeatures.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cssFeatures.map((feature) => (
                  <div
                    key={feature.name}
                    className="flex items-center gap-2 p-2 rounded-lg border"
                  >
                    {feature.supported ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    )}
                    <span className="text-sm">{feature.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visual Tests Tab */}
        <TabsContent value="visual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visual Component Tests</CardTitle>
              <CardDescription>Test visual rendering of components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Animations */}
              <div>
                <h3 className="text-sm font-medium mb-3">Animations & Transitions</h3>
                <div className="flex gap-4">
                  <Button className="transition-transform hover:scale-105">
                    Hover Scale
                  </Button>
                  <Button className="transition-colors">Color Transition</Button>
                  <Button className="animate-pulse">Pulse Animation</Button>
                </div>
              </div>

              {/* Backdrop Blur */}
              <div>
                <h3 className="text-sm font-medium mb-3">Backdrop Filter</h3>
                <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/30 dark:bg-black/30 backdrop-blur-md p-4 rounded-lg">
                      <p className="text-white font-medium">Backdrop Blur Effect</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shadows */}
              <div>
                <h3 className="text-sm font-medium mb-3">Shadows</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    Small
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    Medium
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    Large
                  </div>
                </div>
              </div>

              {/* Grid & Flexbox */}
              <div>
                <h3 className="text-sm font-medium mb-3">Layout (Grid & Flexbox)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">1</div>
                  <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">2</div>
                  <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">3</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
