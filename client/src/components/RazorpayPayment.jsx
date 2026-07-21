import React, { useState } from 'react';
import { paymentAPI } from '../utils/api';
import { useOrder } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

function RazorpayPayment({ amount, orderData, onSuccess, onError }) {
  const [processing, setProcessing] = useState(false);
  const { addOrder } = useOrder();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);

      // Check if Razorpay is loaded
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert('Failed to load payment gateway. Please check your internet connection.');
        return;
      }

      // Step 1: Create order on backend
      const orderResponse = await paymentAPI.createOrder({
        amount: amount,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      });

      // Step 2: Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Your Key ID
        amount: orderResponse.amount, // Amount in paise
        currency: orderResponse.currency,
        name: 'FootCap',
        description: 'Premium Footwear Purchase',
        order_id: orderResponse.orderId,
        handler: async function (response) {
          try {
            // Step 3: Verify payment on backend
            const verificationResponse = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verificationResponse.success) {
              // Step 4: Save order in database
              const orderId = await addOrder({
                ...orderData,
                paymentMethod: 'razorpay',
                paymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature
              });

              // Step 5: Clear cart
              await clearCart();

              // Step 6: Success callback
              if (onSuccess) {
                onSuccess(orderId, response.razorpay_payment_id);
              }

              alert(`✅ Payment Successful!\nPayment ID: ${response.razorpay_payment_id}\nOrder ID: ${orderId}`);
              navigate('/orders');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            if (onError) {
              onError(error);
            }
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: orderData.deliveryDetails?.name || '',
          email: orderData.deliveryDetails?.email || '',
          contact: orderData.deliveryDetails?.phone || ''
        },
        theme: {
          color: '#C41E3A' // Your brand color (crimson)
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            console.log('Payment modal closed');
          }
        }
      };

      // Step 3: Open Razorpay checkout
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      if (onError) {
        onError(error);
      }
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={processing}
      style={{
        width: '100%',
        padding: '14px',
        background: processing ? '#999' : '#3b82f6',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: processing ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}
    >
      {processing ? (
        <>
          <span className="spinner"></span>
          Processing...
        </>
      ) : (
        <>
          <img 
            src="https://razorpay.com/assets/razorpay-glyph.svg" 
            alt="Razorpay" 
            style={{ width: '20px', height: '20px' }}
          />
          Pay with Razorpay
        </>
      )}
    </button>
  );
}

export default RazorpayPayment;