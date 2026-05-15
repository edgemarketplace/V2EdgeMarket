export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Minimal test function works',
    timestamp: new Date().toISOString() 
  });
}
