const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function verifyPassword(password: string) {
  const response = await fetch(`${API_URL}/api/verify-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  
  if (!response.ok) {
    throw new Error('Invalid password');
  }
  
  return response.json();
}

export async function getJourneyData(token: string) {
  const response = await fetch(`${API_URL}/api/journey`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch journey data');
  }
  
  return response.json();
}