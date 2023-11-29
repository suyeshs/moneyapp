import React from 'react';
import { StoreProvider,useStore } from '../../stores/StoreProvider';
import OptionsGrid from '../../app/components/DataGrid/OptionsGrid';
import { useWebSocket } from '../../hooks/useSocketMobx';

const Home: React.FC = () => {
  const isInitialLoadCompleted = useWebSocket('ws://localhost:8888/tradepod');

  

  return (
    <div>
      {isInitialLoadCompleted && <OptionsGrid />}
    </div>
  );
};

export default Home;
