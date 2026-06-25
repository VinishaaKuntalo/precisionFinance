import Navigation from '@/components/Navigation';
import HeroSection from '@/sections/HeroSection';
import DashboardSection from '@/sections/DashboardSection';
import ServiceEcosystem from '@/sections/ServiceEcosystem';
import SavingsOptimization from '@/sections/SavingsOptimization';
import FooterSection from '@/sections/FooterSection';
import AuthScreen from '@/components/AuthScreen';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-500 text-sm font-mono-data">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <DashboardSection />
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
