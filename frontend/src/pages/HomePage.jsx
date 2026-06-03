import { useState, useEffect } from 'react';
import api from '../api/axios';

function HomePage() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api.get('/health')
      .then((res) => setHealth(res.data))
      .catch(() => setHealth({ status: 'not ok' }));
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1>RecipeHub</h1>
      <p style={{ fontSize: '1.25rem', marginTop: '1rem' }}>
        {health?.status === 'ok'
          ? "🔥 Up and running! Time to cook something awesome."
          : "⏳ Waking the chef... give it a sec."}
      </p>
      {health && (
        <p style={{ color: '#666', fontSize: '0.875rem' }}>
          Server says: <code>{health.status}</code>
        </p>
      )}
    </div>
  );
}

export default HomePage;
