import crypto from 'node:crypto';

const UPESIPAY_AUTH_HEADER =
  process.env.UPESIPAY_AUTH_HEADER ||
  'Basic RTcyT0FNU25BbW5lXzMzVXhVUjc6OU83Y2FSbDUtcVgxbXg0QXNoR2o1YmhFY0JUVy1JTXVkTGdlMS1Xaw==';
const UPESIPAY_BASE_URL = 'https://upesipay.com';
const TOKEN_SECRET =
  process.env.UPESIPAY_PASSWORD || '9O7caRl5-qX1mx4AshGj5bhEcBTW-IMudLge1-Wk';

function verifyToken(token: string): Record<string, any> | null {
  try {
    const [encoded, sig] = token.split('.');
    if (!encoded || !sig) return null;
    const expectedSig = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(encoded)
      .digest('base64url');
    if (sig.length !== expectedSig.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return null;
    }
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const checkoutRequestId = String(req.query?.checkoutRequestId || '');
    const token = String(req.query?.token || '');
    const record = verifyToken(token);

    if (!checkoutRequestId || !record || record.checkout_request_id !== checkoutRequestId) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Transaction verification token missing or invalid.',
      });
    }

    const elapsedSeconds = (Date.now() - Number(record.created_at)) / 1000;
    if (elapsedSeconds > 95) {
      return res.status(200).json({
        success: false,
        status: 'timeout',
        message: 'Payment verification timed out. M-PESA PIN was not entered within the time limit.',
      });
    }

    // 1. Query specific transaction ID directly on UpesiPay
    try {
      const directResp = await fetch(
        `${UPESIPAY_BASE_URL}/api/v2/transactions/${encodeURIComponent(checkoutRequestId)}/`,
        {
          headers: { Authorization: UPESIPAY_AUTH_HEADER },
        }
      );
      if (directResp.ok) {
        const directData: any = await directResp.json();
        const txn = directData?.data;
        const st = String(txn?.status || '').toLowerCase();
        if (st === 'success' || st === 'completed') {
          return res.status(200).json({
            success: true,
            status: 'success',
            phone_number: record.phone_number,
            amount: record.amount,
            target_limit: record.target_limit,
            program_name: record.program_name,
            mpesa_code: txn.mpesa_code || txn.id || `QA${Math.floor(100000 + Math.random() * 900000)}X9`,
            verified_at: Date.now(),
          });
        }
        if (st === 'failed' || st === 'cancelled' || st === 'timeout') {
          return res.status(200).json({
            success: false,
            status: st,
            message: 'The M-PESA payment was cancelled or failed.',
          });
        }
      }
    } catch {
      // Fall through to ledger query
    }

    // 2. Query recent transactions ledger on UpesiPay
    try {
      const txnsResponse = await fetch(
        `${UPESIPAY_BASE_URL}/api/v2/transactions/?limit=20`,
        {
          headers: { Authorization: UPESIPAY_AUTH_HEADER },
        }
      );

      if (txnsResponse.ok) {
        const txnsData: any = await txnsResponse.json();
        if (txnsData.success && Array.isArray(txnsData.data)) {
          const minCreatedAt = Number(record.created_at) - 60_000;
          const matchedTxn = txnsData.data.find((t: any) => {
            const idMatch =
              t.id === checkoutRequestId ||
              t.checkout_request_id === checkoutRequestId ||
              (record.merchant_request_id && t.merchant_request_id === record.merchant_request_id);

            const phoneMatch = String(t.phone_number || '').includes(
              String(record.phone_number).slice(-9)
            );
            const amtMatch = Math.abs(Number(t.amount) - Number(record.amount)) < 1;
            const txnTime = t.created_at ? new Date(t.created_at).getTime() : Date.now();
            const recentMatch = txnTime >= minCreatedAt;

            return idMatch || (phoneMatch && amtMatch && recentMatch);
          });

          if (matchedTxn) {
            const st = String(matchedTxn.status || '').toLowerCase();
            if (st === 'success' || st === 'completed') {
              return res.status(200).json({
                success: true,
                status: 'success',
                phone_number: record.phone_number,
                amount: record.amount,
                target_limit: record.target_limit,
                program_name: record.program_name,
                mpesa_code:
                  matchedTxn.mpesa_code ||
                  matchedTxn.id ||
                  `QA${Math.floor(100000 + Math.random() * 900000)}X9`,
                verified_at: Date.now(),
              });
            }
            if (st === 'failed' || st === 'cancelled' || st === 'timeout') {
              return res.status(200).json({
                success: false,
                status: st,
                message: 'The M-PESA STK prompt was cancelled or declined.',
              });
            }
          }
        }
      }
    } catch (queryErr) {
      console.warn('[UpesiPay Vercel Status] Ledger query failed:', queryErr);
    }

    return res.status(200).json({
      success: true,
      status: 'pending',
      elapsed_seconds: Math.round(elapsedSeconds),
      message: 'Awaiting M-PESA PIN authorization on customer phone...',
    });
  } catch (error: any) {
    console.error('[UpesiPay Vercel Status] Error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Error checking payment status.',
    });
  }
}
