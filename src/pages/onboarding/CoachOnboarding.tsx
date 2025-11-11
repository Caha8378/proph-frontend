import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SchoolSearchStep } from '../../components/onboarding/SchoolSearchStep';
import { GenderRoleStep } from '../../components/onboarding/GenderRoleStep';
import { CheckCircle, Loader2 } from 'lucide-react';
import type { School } from '../../types';

// Local School type for onboarding (extends the main School type)
interface OnboardingSchool extends Omit<School, 'id' | 'logo' | 'division' | 'location'> {
  id?: string;
  name: string;
  division: string;
  conference?: string;
  email_domain?: string;
  logo_url?: string;
  isManual?: boolean;
}

type Step = 1 | 2 | 'processing' | 'success';

export const CoachOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedSchool, setSelectedSchool] = useState<OnboardingSchool | null>(null);
  const [genderCoached, setGenderCoached] = useState<'mens' | 'womens' | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [customRole, setCustomRole] = useState<string>('');
  
  // Get user email from localStorage (set during signup)
  const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('pendingEmail') || 'coach@example.com';

  const handleSchoolSelect = (school: School | null) => {
    setSelectedSchool(school);
  };

  const handleManualSchool = (school: Omit<School, 'id'> & { isManual: true }) => {
    setSelectedSchool({ ...school, id: undefined });
  };

  const handleSubmit = async () => {
    setCurrentStep('processing');

    // Mock API call
    try {
      const emailDomain = userEmail.split('@')[1];
      const schoolDomain = selectedSchool?.email_domain;
      
      const verified = emailDomain === schoolDomain && emailDomain?.endsWith('.edu') && !selectedSchool?.isManual;

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store coach profile data
      localStorage.setItem('coachProfileComplete', 'true');
      localStorage.setItem('coachVerified', verified.toString());
      
      if (verified) {
        setCurrentStep('success');
        setTimeout(() => {
          navigate('/coach/home');
        }, 1500);
      } else {
        navigate('/coach/home');
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      navigate('/coach/home');
    }
  };

  if (currentStep === 'processing') {
    return (
      <div className="min-h-screen bg-proph-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6">
            <Loader2 className="w-full h-full text-proph-yellow animate-spin" />
          </div>
          <p className="text-2xl font-black text-proph-white">
            Setting Up Your Profile...
          </p>
        </div>
      </div>
    );
  }

  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-proph-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6">
            <CheckCircle className="w-full h-full text-proph-yellow" />
          </div>
          <p className="text-2xl font-black text-proph-white mb-2">
            Verifying Your Account...
          </p>
          <p className="text-proph-grey-text">
            Redirecting you to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-proph-black py-8 px-4">
      <div className="max-w-2xl mx-auto bg-proph-grey rounded-2xl p-8">
        {currentStep === 1 ? (
          <SchoolSearchStep
            selectedSchool={selectedSchool as any}
            onSchoolSelect={handleSchoolSelect as any}
            onManualSchool={handleManualSchool as any}
            userEmail={userEmail}
            onContinue={() => setCurrentStep(2)}
          />
        ) : (
          <GenderRoleStep
            selectedSchool={selectedSchool}
            genderCoached={genderCoached}
            role={role}
            customRole={customRole}
            userEmail={userEmail}
            onGenderChange={setGenderCoached}
            onRoleChange={setRole}
            onCustomRoleChange={setCustomRole}
            onBack={() => setCurrentStep(1)}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

