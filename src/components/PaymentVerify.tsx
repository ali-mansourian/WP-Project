import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../api';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export const PaymentVerify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your payment with Zarinpal...');

  useEffect(() => {
    const verifyPayment = async () => {
      const authority = searchParams.get('Authority');
      const zarinpalStatus = searchParams.get('Status');
      
      // We retrieve the plan_id that we saved right before redirecting to Zarinpal
      const planId = localStorage.getItem('pending_subscription_plan_id');

      if (!authority || !planId) {
        setStatus('error');
        setMessage('Missing payment information. Please try again.');
        return;
      }

      try {
        const res = await apiFetch('/api/subscriptions/verify/', {
          method: 'POST',
          body: JSON.stringify({
            authority,
            plan_id: planId,
            status: zarinpalStatus
          })
        });

        if (res.subscription || res.detail) {
          setStatus('success');
          setMessage('Payment successful! Your premium subscription is now active.');
          localStorage.removeItem('pending_subscription_plan_id');
          
          // Force a hard reload to update the user's tier in the context and UI
          setTimeout(() => {
            window.location.href = '/profile';
          }, 2000);
        } else {
          setStatus('error');
          setMessage(res.error || 'Payment verification failed.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'An error occurred during verification.');
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-6">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-white">Processing Payment</h2>
            <p className="text-sm text-zinc-400">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h2 className="text-xl font-bold text-emerald-400">Payment Successful!</h2>
            <p className="text-sm text-zinc-300">{message}</p>
            <p className="text-xs text-zinc-500">Redirecting to your profile...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-xl font-bold text-rose-500">Payment Failed</h2>
            <p className="text-sm text-zinc-300">{message}</p>
            <button
              onClick={() => navigate('/profile')}
              className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition"
            >
              Back to Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
};