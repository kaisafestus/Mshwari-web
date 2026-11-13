import crypto from 'node:crypto';

const UPESIPAY_AUTH_HEADER =
  process.env.UPESIPAY_AUTH_HEADER ||
  'Basic RTcyT0FNU25BbW5lXzMzVXhVUjc6OU83Y2FSbDUtcVgxbXg0QXNoR2o1YmhFY0JUVy1JTXVkTGdlMS1Xaw==';
const UPESIPAY_CHANNEL_ID = parseInt(process.env.UPESIPAY_CHANNEL_ID || '270', 10);
const UPESIPAY_BASE_URL = 'https://upesipay.com';
const TOKEN_SECRET =
  process.env.UPESIPAY_PASSWORD || '9O7caRl5-qX1mx4AshGj5bhEcBTW-IMudLge1-Wk';

function createVerificationToken(payload: Record<string, unknown>): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { phone_number, amount, program_id, program_name, target_limit } = body;

    if (!phone_number || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and amount are required.',
      });
    }

    let cleanPhone = String(phone_number).replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '254' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('254')) {
      cleanPhone = '254' + cleanPhone;
    }

    const parsedAmount = Math.max(1, Math.round(Number(amount)));
    const host = req.headers?.host;
    const proto = req.headers?.['x-forwarded-proto'] || 'https';
    const appUrl = (process.env.APP_URL || (host ? `${proto}://${host}` : '')).replace(/\/$/, '');
    const callbackUrl =
      appUrl && appUrl.startsWith('https://') ? `${appUrl}/api/upesipay/callback` : undefined;

    const payload: Record<string, any> = {
      channel_id: UPESIPAY_CHANNEL_ID,
      phone_number: cleanPhone,
      amount: parsedAmount,
    };

    if (callbackUrl) {
      payload.callback_url = callbackUrl;
    }

    const upesiResponse = await fetch(`${UPESIPAY_BASE_URL}/api/v2/collections/initiate/`, {
      method: 'POST',
      headers: {
        Authorization: UPESIPAY_AUTH_HEADER,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const rawText = await upesiResponse.text();
    let data: any = {};
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      return res.status(502).json({
        success: false,
        message: 'Payment gateway returned an unexpected response.',
      });
    }

    if (!upesiResponse.ok || data.success === false) {
      return res.status(upesiResponse.status || 400).json({
        success: false,
        message: data.message || 'Failed to initiate M-Pesa STK push via UpesiPay gateway.',
        error_code: data.error_code || 'GATEWAY_ERROR',
        details: data.details || null,
      });
    }

    const checkoutRequestId =
      data.data?.checkout_request_id ||
      `ws_CO_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const merchantRequestId = data.data?.merchant_request_id || '';
    const createdAt = Date.now();

    const verificationToken = createVerificationToken({
      checkout_request_id: checkoutRequestId,
      merchant_request_id: merchantRequestId,
      phone_number: cleanPhone,
      amount: parsedAmount,
      program_id: program_id || 'mshwari',
      program_name: program_name || 'M-Shwari',
      target_limit: Number(target_limit) || 10000,
      created_at: createdAt,
    });

    return res.status(200).json({
      success: true,
      message: data.message || 'STK push sent. Enter your M-PESA PIN on your phone.',
      checkout_request_id: checkoutRequestId,
      merchant_request_id: merchantRequestId,
      phone_number: cleanPhone,
      amount: parsedAmount,
      verification_token: verificationToken,
    });
  } catch (error: any) {
    console.error('[UpesiPay Vercel STK] Error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Internal server error processing payment request.',
    });
  }
}
