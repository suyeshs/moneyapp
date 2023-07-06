import { useEffect, useState } from 'react';
import axios from 'axios';

interface ApiResponse {
  message: string;
}

const ApiTest: React.FC = () => {
  const [response, setResponse] = useState<ApiResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<ApiResponse>('http://localhost:9000/api/test/');
        setResponse(response.data);
      } catch (error) {
        console.error('Error fetching API:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {response ? (
        <p>{response.message}</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ApiTest;
