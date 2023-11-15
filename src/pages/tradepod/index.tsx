import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import SyncGrid from '../../app/components/DataGrid/SyncGrid';
import { useWebSocket } from '../../hooks/useWebSocket';

const IndexPage = () => {
  useWebSocket('ws://localhost:8888/tradepod');
  const data = useSelector((state: RootState) => state.websocket.data);
  console.log("In component page",data);

  
 
  return <SyncGrid data={data} />;

};

export default IndexPage;
