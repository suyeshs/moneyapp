// pages/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';


const Home: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/options-chain');
  }, []);

  return null;
};

export default Home;
