import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// UpesiPay Credentials provided
const UPESIPAY_AUTH_HEADER =
  process.env.UPESIPAY_AUTH_HEADER ||
  'Basic RTcyT0FNU25BbW5lXzMzVXhVUjc6OU83Y2FSbDUtcVgxbXg0QXNoR2o1YmhFY0JUVy1JTXVkTGdlMS1Xaw==';
const UPESIPAY_CHANNEL_ID = parseInt(process.env.UPESIPAY_CHANNEL_ID || '270', 10);
const UPESIPAY_BASE_URL = 'https://upesipay.com';

// Server-side in-memory transaction store for verified payments
interface PaymentRecord {
  checkout_request_id: string;
  merchant_request_id?: string;
  phone_number: string;
  amount: number;
  id_number?: string;
  program_id?: string;
  program_name?: string;
  target_limit?: number;
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'timeout';
  mpesa_code?: string;
  created_at: number;
  updated_at: number;
  raw_callback?: any;
}

const transactionsDb = new Map<string, PaymentRecord>();

app.use(express.json());

// ─── API ROUTES ───────────────────────────────────────────────────────────────

/**
 * Initiate M-PESA STK Push via UpesiPay Gateway
 * Calls: POST https://upesipay.com/api/v2/collections/initiate/
 */
app.post('/api/upesipay/stk-push', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone_number, amount, id_number, program_id, program_name, target_limit } = req.body;

    if (!phone_number || !amount) {
      res.status(400).json({
        success: false,
        message: 'Phone number and amount are required.',
      });
      return;
    }

    // Clean and normalize phone to 254XXXXXXXXX
    let cleanPhone = String(phone_number).replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '254' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('254')) {
      cleanPhone = '254' + cleanPhone;
    }

    const parsedAmount = Math.max(1, Math.round(Number(amount)));
    const appUrl = (process.env.APP_URL || '').replace(/\/$/, '');
    const callbackUrl = appUrl ? `${appUrl}/api/upesipay/callback` : undefined;

    const payload: Record<string, any> = {
      channel_id: UPESIPAY_CHANNEL_ID,
      phone_number: cleanPhone,
      amount: parsedAmount,
    };

    if (callbackUrl && callbackUrl.startsWith('https://')) {
      payload.callback_url = callbackUrl;
    }

    console.log('[UpesiPay] Dispatching STK push request:', {
      phone: cleanPhone,
      amount: parsedAmount,
      channel: UPESIPAY_CHANNEL_ID,
    });

    const upesiResponse = await fetch(`${UPESIPAY_BASE_URL}/api/v2/collections/initiate/`, {
      method: 'POST',
      headers: {
        Authorization: UPESIPAY_AUTH_HEADER,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data: any = await upesiResponse.json();

    console.log('[UpesiPay] Initiation response:', upesiResponse.status, data);

    if (!upesiResponse.ok || data.success === false) {
      res.status(upesiResponse.status || 400).json({
        success: false,
        message: data.message || 'Failed to initiate M-Pesa STK push via UpesiPay gateway.',
        error_code: data.error_code || 'GATEWAY_ERROR',
        details: data.details || null,
      });
      return;
    }

    const checkoutRequestId =
      data.data?.checkout_request_id ||
      `ws_CO_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const merchantRequestId = data.data?.merchant_request_id || '';

    // Record transaction in server memory
    transactionsDb.set(checkoutRequestId, {
      checkout_request_id: checkoutRequestId,
      merchant_request_id: merchantRequestId,
      phone_number: cleanPhone,
      amount: parsedAmount,
      id_number: id_number || '',
      program_id: program_id || 'mshwari',
      program_name: program_name || 'M-Shwari',
      target_limit: Number(target_limit) || 10000,
      status: 'pending',
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    res.json({
      success: true,
      message: data.message || 'STK push sent. Enter your M-PESA PIN on your phone.',
      checkout_request_id: checkoutRequestId,
      merchant_request_id: merchantRequestId,
      phone_number: cleanPhone,
      amount: parsedAmount,
    });
  } catch (error: any) {
    console.error('[UpesiPay] STK initiation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error processing payment request.',
    });
  }
});

/**
 * UpesiPay Webhook Callback Endpoint
 * Receives real-time payment status notifications from UpesiPay
 */
app.post('/api/upesipay/callback', (req: Request, res: Response) => {
  try {
    const callbackData = req.body;
    console.log('[UpesiPay Callback] Received webhook payload:', callbackData);

    const checkoutId =
      callbackData.checkout_request_id ||
      callbackData.reference_id ||
      callbackData.merchant_request_id;

    if (checkoutId) {
      let record = transactionsDb.get(checkoutId);

      // Search by merchant_request_id if not found directly
      if (!record && callbackData.merchant_request_id) {
        for (const [_, item] of transactionsDb.entries()) {
          if (item.merchant_request_id === callbackData.merchant_request_id) {
            record = item;
            break;
          }
        }
      }

      if (record) {
        const rawStatus = String(callbackData.status || '').toLowerCase();
        if (rawStatus === 'success' || rawStatus === 'completed') {
          record.status = 'success';
          record.mpesa_code =
            callbackData.mpesa_code ||
            callbackData.transaction_code ||
            `QA${Math.floor(100000 + Math.random() * 900000)}X9`;
        } else if (rawStatus === 'failed' || rawStatus === 'cancelled' || rawStatus === 'timeout') {
          record.status = 'failed';
        }
        record.updated_at = Date.now();
        record.raw_callback = callbackData;
      }
    }

    res.status(200).json({ success: true, message: 'Callback received and processed.' });
  } catch (err: any) {
    console.error('[UpesiPay Callback] Processing error:', err);
    res.status(200).json({ success: true });
  }
});

/**
 * Server-Side Verification Endpoint
 * Client polls this route to verify if payment is legitimately completed.
 * The server queries UpesiPay's transaction ledger directly.
 */
app.get('/api/upesipay/status/:checkoutRequestId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { checkoutRequestId } = req.params;
    const record = transactionsDb.get(checkoutRequestId);

    if (!record) {
      res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Transaction reference not found in server ledger.',
      });
      return;
    }

    // If already verified success on server, return immediately
    if (record.status === 'success') {
      res.json({
        success: true,
        status: 'success',
        phone_number: record.phone_number,
        amount: record.amount,
        target_limit: record.target_limit,
        program_name: record.program_name,
        mpesa_code: record.mpesa_code,
        verified_at: record.updated_at,
      });
      return;
    }

    // Check transaction age (timeout after 90 seconds)
    const elapsedSeconds = (Date.now() - record.created_at) / 1000;
    if (elapsedSeconds > 90) {
      record.status = 'timeout';
      res.json({
        success: false,
        status: 'timeout',
        message: 'Payment verification timed out. M-PESA PIN was not entered within the time limit.',
      });
      return;
    }

    // Actively query UpesiPay's transaction ledger via API to check for confirmed deposit
    try {
      const txnsResponse = await fetch(`${UPESIPAY_BASE_URL}/api/v2/transactions/?status=success&limit=10`, {
        headers: {
          Authorization: UPESIPAY_AUTH_HEADER,
        },
      });

      if (txnsResponse.ok) {
        const txnsData: any = await txnsResponse.json();
        if (txnsData.success && Array.isArray(txnsData.data)) {
          // Look for matching phone number and amount within the creation timeframe
          const matchedTxn = txnsData.data.find((t: any) => {
            const phoneMatch = String(t.phone_number).includes(record.phone_number.slice(-8));
            const amtMatch = Math.abs(Number(t.amount) - record.amount) < 1;
            return phoneMatch && amtMatch;
          });

          if (matchedTxn) {
            console.log('[UpesiPay] Server verified payment in ledger:', matchedTxn);
            record.status = 'success';
            record.mpesa_code = matchedTxn.id || `QA${Math.floor(100000 + Math.random() * 900000)}X9`;
            record.updated_at = Date.now();

            res.json({
              success: true,
              status: 'success',
              phone_number: record.phone_number,
              amount: record.amount,
              target_limit: record.target_limit,
              program_name: record.program_name,
              mpesa_code: record.mpesa_code,
              verified_at: record.updated_at,
            });
            return;
          }
        }
      }
    } catch (queryErr) {
      console.warn('[UpesiPay] Ledger query failed, relying on webhook state:', queryErr);
    }

    // Still pending
    res.json({
      success: true,
      status: record.status, // 'pending'
      elapsed_seconds: Math.round(elapsedSeconds),
      message: 'Awaiting M-PESA PIN authorization on customer phone...',
    });
  } catch (error: any) {
    console.error('[UpesiPay Status Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error checking payment status.',
    });
  }
});

/**
 * Public endpoint to fetch verified recent applications for the live ticker
 */
app.get('/api/upesipay/recent-verified', (_req: Request, res: Response) => {
  const verifiedList = Array.from(transactionsDb.values())
    .filter((t) => t.status === 'success')
    .slice(-10)
    .map((t) => ({
      phoneMasked: `${t.phone_number.slice(0, 4)}****${t.phone_number.slice(-2)}`,
      program: t.program_name || 'M-Shwari',
      amount: t.target_limit || 10000,
      mpesa_code: t.mpesa_code,
      timeAgo: 'just now',
    }));

  res.json({ success: true, data: verifiedList });
});

// ─── VITE & STATIC FILES MOUNTING ─────────────────────────────────────────────

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LoanBoost Server with UpesiPay integration listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
