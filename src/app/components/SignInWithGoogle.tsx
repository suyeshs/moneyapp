import React from 'react';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import { observer } from 'mobx-react';
import { useStore } from '../providers/StoreProvider';
import { useRouter } from 'next/router';

const SignInWithGoogle: React.FC = observer(() => {
  const router = useRouter();
  const { optionStore } = useStore();

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      console.log(codeResponse);
      try {
        const response = await axios.post('http://localhost:8000/api/google-auth/', {
          code: codeResponse.code,
        });

        const tokens = response.data;
        console.log('Google', tokens);

        // Update the authentication state and idinfo in the OptionStore
        optionStore.setAuthenticated(true);
        optionStore.setUserData(tokens.data);

        // Set the isClient flag in the OptionStore
        optionStore.setIsClient(true);

        // Redirect to the '/sync-option' page
        router.push('/sync-option');
      } catch (error) {
        console.error('Error during token exchange:', error);
      }
    },
    onError: errorResponse => console.log(errorResponse),
  });

  return (
    <div>
      <button onClick={googleLogin}>Sign in with Google here</button>
    </div>
  );
});

export default SignInWithGoogle;
