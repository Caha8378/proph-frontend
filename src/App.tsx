import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PlayerHomePage, PostingFeedPage, ApplicationsPage, ProfilePage } from './pages';
// Comparison design pages - commented out until files exist
// import { PostingCardComparison } from './pages/comparisonDesigns/PostingCardComparison.tsx';
// import { PlayerCardComparison } from './pages/comparisonDesigns/PlayerCardComparison.tsx';
// import { HeaderComparison } from './pages/comparisonDesigns/HeaderComparison.tsx';
// import { ApplyModalComparison } from './pages/comparisonDesigns/ApplyModalComparison.tsx';
// import { ApplicationCardComparison } from './pages/comparisonDesigns/ApplicationCardComparison.tsx';
// import { BottomNavComparison } from './pages/comparisonDesigns/BottomNavComparison';
import { PostingDetailPage } from './pages/PostingDetailPage';
import { SchoolPage } from './pages/SchoolPage';
import { LandingPage } from './pages/LandingPage';
import { LandingPage2 } from './pages/LandingPage2';
import { MissionPage } from './pages/MissionPage';
import { CoachHome } from './pages/coach/CoachHome';
import { CoachPostings } from './pages/coach/CoachPostings';
import { ReviewApplications } from './pages/coach/ReviewApplications';
import { MyTeam } from './pages/coach/MyTeam';
import { SignupPage } from './pages/auth/SignupPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SupporterHomePage } from './pages/supporter/SupporterHomePage';
import { PlayerOnboarding } from './pages/onboarding/PlayerOnboarding';
import { CoachOnboarding } from './pages/onboarding/CoachOnboarding';
import { EmailVerification } from './pages/auth/EmailVerification';
import { MessagesPage } from './pages/MessagesPage';
import { AuthProvider } from './context/authContext';
import { NotificationProvider } from './context/notificationContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage2 />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/mission" element={<MissionPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/welcome" element={<LandingPage />} />
        
        {/* Comparison/design routes (public for now) */}
        {/* <Route path="/posting-comparison" element={<PostingCardComparison />} />
        <Route path="/player-comparison" element={<PlayerCardComparison />} />
        <Route path="/header-comparison" element={<HeaderComparison />} />
        <Route path="/apply-modal-comparison" element={<ApplyModalComparison />} />
        <Route path="/application-card-comparison" element={<ApplicationCardComparison />} />
        <Route path="/bottom-nav-comparison" element={<BottomNavComparison />} /> */}
        
        {/* Protected onboarding routes */}
        <Route 
          path="/onboarding/player" 
          element={
            <ProtectedRoute allowedRoles={['player']}>
              <PlayerOnboarding />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/onboarding/coach" 
          element={
            <ProtectedRoute allowedRoles={['coach']}>
              <CoachOnboarding />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected player routes */}
        <Route 
          path="/player/home" 
          element={
            <ProtectedRoute allowedRoles={['player']}>
              <PlayerHomePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/player/postings" 
          element={
            <ProtectedRoute allowedRoles={['player']}>
              <PostingFeedPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/player/applications" 
          element={
            <ProtectedRoute allowedRoles={['player']}>
              <ApplicationsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/player/profile" 
          element={
            <ProtectedRoute allowedRoles={['player']}>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/player/messages" 
          element={
            <ProtectedRoute allowedRoles={['player']}>
              <MessagesPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected coach routes */}
        <Route 
          path="/coach/home" 
          element={
            <ProtectedRoute allowedRoles={['coach']}>
              <CoachHome />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/coach/postings" 
          element={
            <ProtectedRoute allowedRoles={['coach']}>
              <CoachPostings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/coach/applications" 
          element={
            <ProtectedRoute allowedRoles={['coach']}>
              <ReviewApplications />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/coach/team" 
          element={
            <ProtectedRoute allowedRoles={['coach']}>
              <MyTeam />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/coach/messages" 
          element={
            <ProtectedRoute allowedRoles={['coach']}>
              <MessagesPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected supporter routes */}
        <Route 
          path="/supporter/home" 
          element={
            <ProtectedRoute allowedRoles={['supporter', 'fan']}>
              <SupporterHomePage />
            </ProtectedRoute>
          } 
        />
        
        {/* Public posting detail route */}
        <Route path="/posting/:id" element={<PostingDetailPage />} />
        
        {/* Public school page route */}
        <Route path="/school/:schoolId" element={<SchoolPage />} />
      </Routes>
    </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
