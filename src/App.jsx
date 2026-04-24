import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import AirbnbRentals from './pages/AirbnbRentals';
import BicycleRentals from './pages/BicycleRentals';
import BicycleSales from './pages/BicycleSales';
import Maintenance from './pages/Maintenance';
import InventoryPage from './pages/InventoryPage';
import GuestExperiences from './pages/GuestExperiences';
import ActivityLogs from './pages/ActivityLogs';
import BusinessInsights from './pages/BusinessInsights';
import FinancialAnalysis from './pages/FinancialAnalysis';
import OperationsRentals from './pages/OperationsRentals';
import ConfigurationSystem from './pages/ConfigurationSystem';
import ChatOdoo from './pages/ChatOdoo';
import AdminAccess from './pages/AdminAccess';
import CoachAffaires from './pages/CoachAffaires';
import CrisisCommand from './pages/CrisisCommand';
import Accounting from './pages/Accounting';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-2xl">🐨</div>
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Chargement KOALAS ERP...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    else if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/Properties" element={<Properties />} />
        <Route path="/AirbnbRentals" element={<AirbnbRentals />} />
        <Route path="/BicycleRentals" element={<BicycleRentals />} />
        <Route path="/BicycleSales" element={<BicycleSales />} />
        <Route path="/Maintenance" element={<Maintenance />} />
        <Route path="/Inventory" element={<InventoryPage />} />
        <Route path="/GuestExperiences" element={<GuestExperiences />} />
        <Route path="/ActivityLogs" element={<ActivityLogs />} />
        <Route path="/BusinessInsights" element={<BusinessInsights />} />
        <Route path="/FinancialAnalysis" element={<FinancialAnalysis />} />
        <Route path="/OperationsRentals" element={<OperationsRentals />} />
        <Route path="/ConfigurationSystem" element={<ConfigurationSystem />} />
        <Route path="/ChatOdoo" element={<ChatOdoo />} />
        <Route path="/AdminAccess" element={<AdminAccess />} />
        <Route path="/CoachAffaires" element={<CoachAffaires />} />
        <Route path="/CrisisCommand" element={<CrisisCommand />} />
        <Route path="/Accounting" element={<Accounting />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App