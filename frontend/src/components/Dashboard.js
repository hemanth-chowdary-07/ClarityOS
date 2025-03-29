import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/productivity')
      .then((res) => res.json())
      .then((result) => {
        console.log('Fetched data:', result);
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, []);
  

  if (loading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Productivity Dashboard
      </Typography>
  
      {data.map((user, index) => (
        <Card key={index} sx={{ mb: 2, p: 2 }}>
          <CardContent>
            <Typography variant="h6">{user.name}</Typography>
            <Typography>Tasks Completed: {user.task_count}</Typography>
            <Typography>Focus Hours: {user.focus_hours}</Typography>
            <Typography>Stress Level: {user.stress_level}</Typography>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
  
}

export default Dashboard;
