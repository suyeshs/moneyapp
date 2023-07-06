// pages/index.tsx
import React from 'react';
import SignInWithGoogle from '../app/components/SignInWithGoogle'

const Home: React.FC = () => {
  return (
    <div>
      <h1>Welcome to my App</h1>
      <SignInWithGoogle />
    </div>
  );
};

export default Home;
