// Serverless function to proxy Google Maps API requests
// This keeps your API key secure on the server side

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!GOOGLE_MAPS_API_KEY) {
    return res.status(500).json({ error: 'Google Maps API key not configured' });
  }

  try {
    const { endpoint, ...params } = req.query;
    
    // Construct the Google Maps API URL
    const baseUrl = 'https://maps.googleapis.com/maps/api';
    const url = new URL(`${baseUrl}/${endpoint}`);
    
    // Add API key and other parameters
    url.searchParams.append('key', GOOGLE_MAPS_API_KEY);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Google Maps API proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}