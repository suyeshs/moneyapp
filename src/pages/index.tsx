// pages/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';


const Home: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/nse-options');
  }, []);

  return null;
};

export default Home;
