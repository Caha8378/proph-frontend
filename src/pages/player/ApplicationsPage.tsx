import React, { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { ApplicationCardV1 as ApplicationCard } from '../../components/application/ApplicationCardV1';
import { useApplications } from '../../hooks';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

type TabType = 'pending' | 'accepted' | 'rejected';

export const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const { applications, loading, error, refetch } = useApplications();

  // Filter applications by active tab
  const filteredApplications = applications.filter(
    (app) => app.status === activeTab
  );

  const getTabCount = (status: TabType) => {
    return applications.filter((app) => app.status === status).length;
  };

  const handleWithdraw = async (_applicationId: string) => {
    // TODO: Implement withdraw API call
    // After successful withdraw, refetch applications
    await refetch();
  };

  const handleRemove = async (applicationId: string) => {
    // TODO: Implement remove API call
    console.log('Remove application:', applicationId);
    // After successful remove, refetch applications
    await refetch();
  };

  const handleMessage = async (applicationId: string) => {
    // Navigate to messages with the coach
    const application = applications.find(app => String(app.id) === applicationId);
    if (application?.posting.coachName) {
      // TODO: Navigate to conversation with coach
      navigate('/messages');
    }
  };

  return (
    <div className="min-h-screen bg-proph-black pb-20">
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <h1 className="text-3xl font-bold text-proph-white">My Applications</h1>

        {/* Tab Navigation */}
        <div className="flex border-b border-proph-white/20">
          {(['pending', 'accepted', 'rejected'] as TabType[]).map((tab) => {
            const count = getTabCount(tab);
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'flex-1 py-3 font-semibold text-sm uppercase transition-colors',
                  'border-b-2',
                  isActive
                    ? 'text-proph-yellow border-proph-yellow'
                    : 'text-proph-white border-transparent hover:text-proph-white'
                )}
              >
                {tab} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        {/* Application List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-proph-grey-text">Loading applications...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-proph-violet">Error loading applications</p>
              <p className="text-sm text-proph-violet">{error}</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-proph-violet">
                No {activeTab} applications
              </p>
              {activeTab === 'pending' && (
                <p className="text-sm text-proph-violet">
                  Start browsing postings to apply!
                </p>
              )}
            </div>
          ) : (
            filteredApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onMessage={handleMessage}
                onWithdraw={handleWithdraw}
                onRemove={handleRemove}
              />
            ))
          )}
        </div>
      </main>

      <BottomNav 
        hasApplicationUpdate={applications.some(app => app.status === 'pending')}
        hasProfileUpdate={false}
      />
    </div>
  );
};
