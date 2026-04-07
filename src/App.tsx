import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { PlannerPage } from './pages/PlannerPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { GuidePage } from './pages/GuidePage';

export default function App() {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main className="ml-14 md:ml-52 flex-1 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<PlannerPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
        </Routes>
      </main>
    </div>
  );
}
