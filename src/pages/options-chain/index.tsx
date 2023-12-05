import React from 'react';
import OptionsGrid from '../../app/components/DataGrid/OptionsGrid';
import { useWebSocket } from '../../hooks/useSocketMobx';

const Home: React.FC = () => {
  const isInitialLoadCompleted = useWebSocket('wss://ns3151328.ip-151-106-34.eu:8888/tradepod');

  // Render the OptionsGrid component only if the initial load is completed
  if (!isInitialLoadCompleted) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <OptionsGrid />
    </div>
  );
};

export default Home;
