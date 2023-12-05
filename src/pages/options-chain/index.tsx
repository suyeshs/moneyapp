import React from 'react';
import OptionsGrid from '../../app/components/DataGrid/OptionsGrid';
import { useWebSocket } from '../../hooks/useSocketMobx';

const Home: React.FC = () => {
  const isInitialLoadCompleted = useWebSocket('ws://localhost:8888/tradepod');

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
