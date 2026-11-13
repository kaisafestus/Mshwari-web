export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('[UpesiPay Vercel Callback] Received payload:', req.body);
    return res.status(200).json({ success: true, message: 'Callback received and processed.' });
  } catch {
    return res.status(200).json({ success: true });
  }
}
