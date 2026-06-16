import React from 'react';
import { Modal, StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export type RazorpayOptions = {
  key: string;
  amount: number | string;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    email?: string;
    contact?: string;
    name?: string;
  };
  theme?: {
    color?: string;
  };
};

type Props = {
  visible: boolean;
  options: RazorpayOptions | null;
  onSuccess: (data: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onCancel: () => void;
};

export default function RazorpayWebView({ visible, options, onSuccess, onCancel }: Props) {
  if (!options) return null;

  // The HTML snippet that loads the Razorpay script and initializes it.
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Razorpay Checkout</title>
      <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background-color: #f5f5f5; font-family: sans-serif; }
        .loader { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div id="loading" class="loader"></div>
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      <script>
        var options = {
          "key": "${options.key}",
          "amount": "${options.amount}",
          "currency": "${options.currency}",
          "name": "${options.name}",
          "description": "${options.description || ''}",
          "order_id": "${options.order_id}",
          "prefill": ${JSON.stringify(options.prefill || {})},
          "theme": ${JSON.stringify(options.theme || {})},
          "handler": function (response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'SUCCESS', data: response }));
          },
          "modal": {
            "ondismiss": function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'DISMISS' }));
            }
          }
        };

        window.onload = function() {
          try {
            var rzp = new Razorpay(options);
            rzp.on('payment.failed', function (response){
               window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'ERROR', data: response.error }));
            });
            rzp.open();
          } catch (e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'ERROR', data: e.message }));
          }
        };
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const parsedData = JSON.parse(event.nativeEvent.data);
      if (parsedData.event === 'SUCCESS') {
        onSuccess(parsedData.data);
      } else if (parsedData.event === 'DISMISS') {
        onCancel();
      } else if (parsedData.event === 'ERROR') {
        console.error("Razorpay WebView Error:", parsedData.data);
        onCancel();
      }
    } catch (error) {
      console.error("Failed to parse message from WebView:", error);
      onCancel();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onCancel}>
      <SafeAreaView style={styles.container}>
        <WebView
          source={{ html: htmlContent }}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}
          style={{ flex: 1 }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  }
});
