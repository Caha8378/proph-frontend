import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SchoolSearchStep } from '../../components/onboarding/SchoolSearchStep';
import { GenderRoleStep } from '../../components/onboarding/GenderRoleStep';
import { CheckCircle, Loader2 } from 'lucide-react';
import type { School } from '../../types';
import * as coachesService from '../../api/coaches';
import { useNotification } from '../../hooks';
import { useAuth } from '../../context/authContext';

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
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedSchool, setSelectedSchool] = useState<OnboardingSchool | null>(null);
  const [name, setName] = useState<string>('');
  const [genderCoached, setGenderCoached] = useState<'mens' | 'womens' | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [customRole, setCustomRole] = useState<string>('');
  
  // Get user email and userId from the current user object in localStorage or auth context
  const storedUser = user || (() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  })();

  const userEmail = storedUser?.email || 'coach@example.com';
  const userId = storedUser?.id || null;

  const handleSchoolSelect = (school: School | null) => {
    setSelectedSchool(school);
  };

  const handleManualSchool = (school: Omit<School, 'id'> & { isManual: true }) => {
    setSelectedSchool({ ...school, id: undefined });
  };

  const handleSubmit = async () => {
    if (!selectedSchool || !name.trim() || !genderCoached || !role) {
      showNotification('Please complete all required fields', 'error');
      return;
    }

    setCurrentStep('processing');

    try {
      // Determine final role (use customRole if role is 'Other')
      const finalRole = role === 'Other' ? customRole.trim() : role;
      if (!finalRole) {
        throw new Error('Please specify your role');
      }

      // Map gender: 'mens' -> 'male', 'womens' -> 'female'
      const genderCoachedValue: 'male' | 'female' = genderCoached === 'mens' ? 'male' : 'female';

      // Get school_id - only if school was selected from dropdown (not manual)
      const schoolId = selectedSchool.id && !selectedSchool.isManual 
        ? parseInt(selectedSchool.id) 
        : null;

      // If manual school entry, we can't register yet (backend needs school_id)
      // For now, we'll require selecting from dropdown
      if (selectedSchool.isManual) {
        throw new Error('Please select your school from the dropdown. Manual school entry is not yet supported.');
      }

      if (!schoolId) {
        throw new Error('Please select a school from the dropdown');
      }

      // Prepare data for backend
      const registerData: coachesService.RegisterCoachData = {
        userId: userId ? parseInt(String(userId)) : undefined,
        school_id: schoolId,
        name: name.trim(),
        position_title: finalRole,
        gender_coached: genderCoachedValue,
        // phone_number not collected in onboarding
      };

      // Call backend API to register coach
      // Note: We need to get the full response to access the user object
      // Since registerCoach returns CoachProfile, we'll need to check the actual API response
      // For now, we'll update the user object after successful registration by fetching it
      const profile = await coachesService.registerCoach(registerData);
      
      // After successful registration, backend should have updated account_status to 'active'
      // We need to refresh the user object from localStorage or fetch it
      // The auth context should pick up the updated user on next page load
      // But we can also manually update it if the backend returns it in the response
      // For now, ProtectedRoute will handle redirects based on account_status

      // Check verification status (backend may set this automatically based on email domain)
      const isVerified = profile.is_verified === true || profile.is_verified === 1;

      // Store coach profile data (legacy - may not be needed with account_status)
      localStorage.setItem('coachProfileComplete', 'true');
      localStorage.setItem('coachVerified', String(isVerified));

      if (isVerified) {
        setCurrentStep('success');
        setTimeout(() => {
          navigate('/coach/home');
        }, 1500);
      } else {
        navigate('/coach/home');
      }
    } catch (error: any) {
      console.error('Failed to complete onboarding:', error);
      showNotification(error.message || 'Failed to complete onboarding. Please try again.', 'error');
      setCurrentStep(2); // Go back to step 2
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
            name={name}
            genderCoached={genderCoached}
            role={role}
            customRole={customRole}
            userEmail={userEmail}
            onNameChange={setName}
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

