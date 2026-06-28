import Navigation from '@/components/Navigation';
import HeroSection from '@/sections/HeroSection';
import DashboardSection from '@/sections/DashboardSection';
import AnalyticsSection from '@/sections/AnalyticsSection';
import ServiceEcosystem from '@/sections/ServiceEcosystem';
import SavingsOptimization from '@/sections/SavingsOptimization';
import FooterSection from '@/sections/FooterSection';
import AuthScreen from '@/components/AuthScreen';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-sm font-mono-data">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <DashboardSection />
      <AnalyticsSection />
      <ServiceEcosystem />
      <SavingsOptimization />
      <FooterSection />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
