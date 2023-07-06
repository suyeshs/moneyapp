// src/app/components/SignInWithGoogle.tsx
import React, { useState } from 'react';
import { auth, GoogleAuthProvider, signInWithPopup } from '../utils/firebase';

const SignInWithGoogle: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error(error);
      setError('There was an error signing in with Google. Please try again.');
    }
  };

  return (
    <div>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default SignInWithGoogle;
