import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { lazy, Suspense } from 'react';
import { AppProvider } from './contexts';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Loading } from './components/ui/loading';
import { BrowserCompatibilityChecker } from './components/BrowserCompatibilityChecker';

// Lazy load page components for better performance
const UnifiedHomePage = lazy(() => import('./pages/UnifiedHomePage').then(module => ({ default: module.UnifiedHomePage })));
const AdminPage = lazy(() => import('./pages/AdminPage.new'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const BrowserTestPage = lazy(() => import('./pages/BrowserTestPage'));
const AccessibilityAuditPage = lazy(() => import('./pages/AccessibilityAuditPage'));
const PerformanceTestPage = lazy(() => import('./pages/PerformanceTestPage').then(module => ({ default: module.PerformanceTestPage })));
const DualPieChartsTestPage = lazy(() => import('./pages/DualPieChartsTestPage'));
const DataAccuracyTestPage = lazy(() => import('./pages/DataAccuracyTestPage'));
const FinalVisualPolishTestPage = lazy(() => import('./pages/FinalVisualPolishTestPage'));

function App() {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      autoHideDuration={4000}
      preventDuplicate
    >
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <BrowserCompatibilityChecker />
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* Public routes - accessible without authentication */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected routes - require authentication */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Navigate to="/dashboard" replace />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <UnifiedHomePage />
                    </ProtectedRoute>
                  } 
                />

                {/* Admin routes - require admin role */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Test routes - protected for authenticated users */}
                <Route 
                  path="/browser-test" 
                  element={
                    <ProtectedRoute>
                      <BrowserTestPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/accessibility-audit" 
                  element={
                    <ProtectedRoute>
                      <AccessibilityAuditPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/performance-test" 
                  element={
                    <ProtectedRoute>
                      <PerformanceTestPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/test/dual-pie-charts" 
                  element={
                    <ProtectedRoute>
                      <DualPieChartsTestPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/test/data-accuracy" 
                  element={
                    <ProtectedRoute>
                      <DataAccuracyTestPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/test/final-visual-polish" 
                  element={
                    <ProtectedRoute>
                      <FinalVisualPolishTestPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Unauthorized page for role-based access denial */}
                <Route 
                  path="/unauthorized" 
                  element={
                    <div className="min-h-screen flex items-center justify-center bg-background">
                      <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold text-destructive">403</h1>
                        <h2 className="text-2xl font-semibold">Access Denied</h2>
                        <p className="text-muted-foreground">
                          You don't have permission to access this page.
                        </p>
                        <a 
                          href="/dashboard" 
                          className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                          Go to Dashboard
                        </a>
                      </div>
                    </div>
                  } 
                />

                {/* Catch-all route for 404 */}
                <Route 
                  path="*" 
                  element={
                    <div className="min-h-screen flex items-center justify-center bg-background">
                      <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold text-destructive">404</h1>
                        <h2 className="text-2xl font-semibold">Page Not Found</h2>
                        <p className="text-muted-foreground">
                          The page you're looking for doesn't exist.
                        </p>
                        <a 
                          href="/dashboard" 
                          className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                          Go to Dashboard
                        </a>
                      </div>
                    </div>
                  } 
                />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </SnackbarProvider>
  );
}

export default App;
