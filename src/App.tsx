import React, { useState } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ProgramSelector } from './components/ProgramSelector';
import { RecentTicker } from './components/RecentTicker';
import { LimitGrid } from './components/LimitGrid';
import { ApplicationModal } from './components/ApplicationModal';
import { EligibilityCalculator } from './components/EligibilityCalculator';
import { StatusTracker } from './components/StatusTracker';
import { UssdGuide } from './components/UssdGuide';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { PROGRAMS, TILL_NUMBER } from './data/programs';
import { ApplicationData, LimitOption } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'estimator' | 'status' | 'ussd' | 'faq'>('calculator');
  const [selectedProgramKey, setSelectedProgramKey] = useState<string>('mshwari');
  const currentProgram = PROGRAMS[selectedProgramKey] || PROGRAMS.mshwari;
  const [selectedLimit, setSelectedLimit] = useState<LimitOption>(currentProgram.limits[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [tillCopied, setTillCopied] = useState(false);
  const [userApplications, setUserApplications] = useState<ApplicationData[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleCopyTill = () => {
    navigator.clipboard.writeText(TILL_NUMBER);
    setTillCopied(true);
    showToast(`Till number ${TILL_NUMBER} copied to clipboard!`);
    setTimeout(() => setTillCopied(false), 2000);
  };

  const handleSelectProgram = (key: string) => {
    setSelectedProgramKey(key);
    const prog = PROGRAMS[key];
    if (prog) {
      setSelectedLimit(prog.limits[0]);
    }
  };

  const handleApplicationSuccess = (app: ApplicationData) => {
    setUserApplications((prev) => [app, ...prev]);
    showToast(`Application ${app.id} successfully queued!`);
  };

  const handleApplyFromEstimator = (amt: number) => {
    // Select closest limit or custom
    const match = currentProgram.limits.find((l) => l.amount === amt) || {
      amount: amt,
      fee: Math.round(amt * 0.012),
      badge: 'Estimated',
      badgeClass: 'popular' as const,
    };
    setSelectedLimit(match);
    setActiveTab('calculator');
    setIsModalOpen(true);
  };

  const handleScrollToPackages = () => {
    setActiveTab('calculator');
    setTimeout(() => {
      const section = document.getElementById('packages-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#eef5ee] text-[#1c2e24]">
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={(t) => setActiveTab(t as any)}
        onOpenApply={handleScrollToPackages}
      />

      {/* Hero Banner with Authentic Kenyan Photography */}
      <HeroBanner
        program={currentProgram}
        onSelectPackages={handleScrollToPackages}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 -mt-10 sm:-mt-14 relative z-20 pb-12">
        {/* Active Tab Router */}
        {activeTab === 'calculator' && (
          <div className="space-y-4">
            {/* Program Selection Cards */}
            <ProgramSelector
              programs={PROGRAMS}
              selectedProgramKey={selectedProgramKey}
              onSelectProgram={handleSelectProgram}
            />

            {/* Live Recent Applications Ticker */}
            <RecentTicker />

            {/* Limit Selection Grid & Primary CTA */}
            <LimitGrid
              program={currentProgram}
              selectedLimit={selectedLimit}
              onSelectLimit={setSelectedLimit}
              onContinue={() => setIsModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'estimator' && (
          <div className="pt-4">
            <EligibilityCalculator onApplyEstimated={handleApplyFromEstimator} />
          </div>
        )}

        {activeTab === 'status' && (
          <div className="pt-4">
            <StatusTracker
              recentApplications={userApplications}
              onOpenApply={handleScrollToPackages}
            />
          </div>
        )}

        {activeTab === 'ussd' && (
          <div className="pt-4">
            <UssdGuide
              onCopyText={(text) => {
                navigator.clipboard.writeText(text);
                showToast(`USSD Code ${text} copied!`);
              }}
            />
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="pt-4">
            <FaqSection />
          </div>
        )}
      </main>

      {/* Application & Payment Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        program={currentProgram}
        selectedLimit={selectedLimit}
        onSuccess={handleApplicationSuccess}
      />

      {/* Floating Toast Notification */}
      <Toast message={toastMessage} />

      {/* Footer */}
      <Footer
        onSelectTab={(t) => {
          if (t === 'calculator') {
            handleScrollToPackages();
          } else {
            setActiveTab(t as any);
          }
        }}
      />
    </div>
  );
}
