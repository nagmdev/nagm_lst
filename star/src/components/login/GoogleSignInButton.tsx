import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import config from '../../config/environment';

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

let hasLoggedMissingClientId = false;

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ 
  onSuccess, 
  onError, 
  disabled = false 
}) => {
  const handleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      onSuccess(credentialResponse.credential);
    } else {
      onError('No credential received from Google');
    }
  };

  const handleError = () => {
    onError('Google Sign-In failed. Please try again.');
  };

  if (!config.googleClientId) {
    if (!hasLoggedMissingClientId) {
      // Log once in development so it's visible, but don't spam the console on every render
      if (import.meta?.env?.DEV) {
        // eslint-disable-next-line no-console
        console.warn('Google Client ID is not configured. Google Sign-In will be hidden.');
      }
      hasLoggedMissingClientId = true;
    }
    return null;
  }

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        disabled={disabled}
        useOneTap={false}
        theme="outline"
        size="large"
        text="signin_with"
        shape="rectangular"
        logo_alignment="left"
        width="100%"
      />
    </div>
  );
};

export default GoogleSignInButton;

