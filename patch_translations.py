import json

file_path = "/home/satyam/Downloads/QuickBasket/src/constants/translations.ts"
with open(file_path, "r") as f:
    content = f.read()

en_add = """    },
    orderSuccessScreen: {
      title: 'Order Confirmed!',
      subtitle: 'Thank you for your purchase. Your order is being processed.',
      viewOrder: 'View Order',
      continueShopping: 'Continue Shopping'
    },
    ordersScreen: {
      title: 'My Orders',
      orderId: 'Order ID: ',
      items: 'items',
      placedOn: 'Placed on',
      status: {
        placed: 'Order Placed',
        confirmed: 'Confirmed',
        processing: 'Processing',
        packed: 'Packed',
        outForDelivery: 'Out for Delivery',
        delivered: 'Delivered',
        cancelled: 'Cancelled'
      }
    },
    orderStatusScreen: {
      title: 'Order Tracking',
      deliveryAddress: 'Delivery Address',
      estimatedDelivery: 'Estimated Delivery',
      invoice: 'Invoice',
      viewInvoice: 'View Invoice',
      downloadInvoice: 'Download Invoice'
    },
    invoiceScreen: {
      title: 'Invoice',
      invoiceNo: 'Invoice No:',
      orderId: 'Order ID:',
      orderDate: 'Order Date:',
      deliveryDate: 'Delivery Date:',
      customerDetails: 'Customer Details',
      shippingAddress: 'Shipping Address',
      item: 'Item',
      qty: 'Qty',
      price: 'Price',
      total: 'Total',
      itemTotal: 'Item Total',
      deliveryFee: 'Delivery Fee',
      taxes: 'Taxes & Fees',
      grandTotal: 'Grand Total',
      download: 'Download Invoice',
      share: 'Share Invoice',
      downloading: 'Downloading...',
      success: 'Success',
      savedTo: 'Invoice saved to',
      failed: 'Failed to download invoice',
      error: 'Error'
    }
  },"""

hi_add = """    },
    orderSuccessScreen: {
      title: 'ऑर्डर की पुष्टि हो गई!',
      subtitle: 'आपकी खरीदारी के लिए धन्यवाद। आपके ऑर्डर पर कार्रवाई की जा रही है।',
      viewOrder: 'ऑर्डर देखें',
      continueShopping: 'खरीदारी जारी रखें'
    },
    ordersScreen: {
      title: 'मेरे ऑर्डर',
      orderId: 'ऑर्डर आईडी: ',
      items: 'आइटम',
      placedOn: 'ऑर्डर किया गया',
      status: {
        placed: 'ऑर्डर दिया गया',
        confirmed: 'पुष्टि की गई',
        processing: 'प्रसंस्करण',
        packed: 'पैक किया गया',
        outForDelivery: 'वितरण के लिए तैयार',
        delivered: 'वितरित',
        cancelled: 'रद्द'
      }
    },
    orderStatusScreen: {
      title: 'ऑर्डर ट्रैकिंग',
      deliveryAddress: 'डिलीवरी का पता',
      estimatedDelivery: 'अनुमानित डिलीवरी',
      invoice: 'चालान',
      viewInvoice: 'चालान देखें',
      downloadInvoice: 'चालान डाउनलोड करें'
    },
    invoiceScreen: {
      title: 'चालान',
      invoiceNo: 'चालान नंबर:',
      orderId: 'ऑर्डर आईडी:',
      orderDate: 'ऑर्डर की तारीख:',
      deliveryDate: 'डिलीवरी की तारीख:',
      customerDetails: 'ग्राहक विवरण',
      shippingAddress: 'शिपिंग पता',
      item: 'आइटम',
      qty: 'मात्रा',
      price: 'मूल्य',
      total: 'कुल',
      itemTotal: 'आइटम कुल',
      deliveryFee: 'डिलीवरी शुल्क',
      taxes: 'कर और शुल्क',
      grandTotal: 'कुल योग',
      download: 'चालान डाउनलोड करें',
      share: 'चालान साझा करें',
      downloading: 'डाउनलोड हो रहा है...',
      success: 'सफलता',
      savedTo: 'चालान यहां सहेजा गया',
      failed: 'चालान डाउनलोड करने में विफल',
      error: 'त्रुटि'
    }
  },"""

hinglish_add = """    },
    orderSuccessScreen: {
      title: 'Order Confirm Ho Gaya!',
      subtitle: 'Aapki purchase ke liye shukriya. Aapka order process ho raha hai.',
      viewOrder: 'Order Dekhein',
      continueShopping: 'Shopping Continue Karein'
    },
    ordersScreen: {
      title: 'Mere Orders',
      orderId: 'Order ID: ',
      items: 'items',
      placedOn: 'Place kiya gaya',
      status: {
        placed: 'Order Placed',
        confirmed: 'Confirm Ho Gaya',
        processing: 'Process Ho Raha Hai',
        packed: 'Pack Ho Gaya',
        outForDelivery: 'Delivery Ke Liye Nikal Gaya',
        delivered: 'Deliver Ho Gaya',
        cancelled: 'Cancel Ho Gaya'
      }
    },
    orderStatusScreen: {
      title: 'Order Track Karein',
      deliveryAddress: 'Delivery Address',
      estimatedDelivery: 'Estimated Delivery',
      invoice: 'Invoice',
      viewInvoice: 'Invoice Dekhein',
      downloadInvoice: 'Invoice Download Karein'
    },
    invoiceScreen: {
      title: 'Invoice',
      invoiceNo: 'Invoice No:',
      orderId: 'Order ID:',
      orderDate: 'Order Date:',
      deliveryDate: 'Delivery Date:',
      customerDetails: 'Customer Details',
      shippingAddress: 'Shipping Address',
      item: 'Item',
      qty: 'Qty',
      price: 'Price',
      total: 'Total',
      itemTotal: 'Item Total',
      deliveryFee: 'Delivery Fee',
      taxes: 'Taxes',
      grandTotal: 'Grand Total',
      download: 'Invoice Download Karein',
      share: 'Invoice Share Karein',
      downloading: 'Download ho raha hai...',
      success: 'Success',
      savedTo: 'Invoice save ho gaya hai',
      failed: 'Invoice download nahi ho paya',
      error: 'Error'
    }
  },"""

ml_add = """    },
    orderSuccessScreen: {
      title: 'ഓർഡർ സ്ഥിരീകരിച്ചു!',
      subtitle: 'നിങ്ങളുടെ പർച്ചേസിന് നന്ദി. നിങ്ങളുടെ ഓർഡർ പ്രോസസ്സ് ചെയ്യുകയാണ്.',
      viewOrder: 'ഓർഡർ കാണുക',
      continueShopping: 'ഷോപ്പിംഗ് തുടരുക'
    },
    ordersScreen: {
      title: 'എന്റെ ഓർഡറുകൾ',
      orderId: 'ഓർഡർ ഐഡി: ',
      items: 'ഇനങ്ങൾ',
      placedOn: 'ഓർഡർ ചെയ്തത്',
      status: {
        placed: 'ഓർഡർ നൽകി',
        confirmed: 'സ്ഥിരീകരിച്ചു',
        processing: 'പ്രോസസ്സ് ചെയ്യുന്നു',
        packed: 'പാക്ക് ചെയ്തു',
        outForDelivery: 'ഡെലിവറിക്ക് തയ്യാറായി',
        delivered: 'ഡെലിവർ ചെയ്തു',
        cancelled: 'റദ്ദാക്കി'
      }
    },
    orderStatusScreen: {
      title: 'ഓർഡർ ട്രാക്കിംഗ്',
      deliveryAddress: 'ഡെലിവറി വിലാസം',
      estimatedDelivery: 'കണക്കാക്കിയ ഡെലിവറി',
      invoice: 'ഇൻവോയ്സ്',
      viewInvoice: 'ഇൻവോയ്സ് കാണുക',
      downloadInvoice: 'ഇൻവോയ്സ് ഡൗൺലോഡ് ചെയ്യുക'
    },
    invoiceScreen: {
      title: 'ഇൻവോയ്സ്',
      invoiceNo: 'ഇൻവോയ്സ് നമ്പർ:',
      orderId: 'ഓർഡർ ഐഡി:',
      orderDate: 'ഓർഡർ തീയതി:',
      deliveryDate: 'ഡെലിവറി തീയതി:',
      customerDetails: 'ഉപഭോക്തൃ വിവരങ്ങൾ',
      shippingAddress: 'ഷിപ്പിംഗ് വിലാസം',
      item: 'ഇനം',
      qty: 'എണ്ണം',
      price: 'വില',
      total: 'ആകെ',
      itemTotal: 'ഇനത്തിന്റെ ആകെത്തുക',
      deliveryFee: 'ഡെലിവറി ഫീ',
      taxes: 'നികുതികൾ',
      grandTotal: 'ആകെത്തുക',
      download: 'ഇൻവോയ്സ് ഡൗൺലോഡ് ചെയ്യുക',
      share: 'ഇൻവോയ്സ് പങ്കിടുക',
      downloading: 'ഡൗൺലോഡ് ചെയ്യുന്നു...',
      success: 'വിജയിച്ചു',
      savedTo: 'ഇൻവോയ്സ് സംരക്ഷിച്ചിരിക്കുന്നു',
      failed: 'ഇൻവോയ്സ് ഡൗൺലോഡ് പരാജയപ്പെട്ടു',
      error: 'പിശക്'
    }
  }"""

content = content.replace("      other: 'Other'\n    }\n  },", "      other: 'Other'\n" + en_add)
content = content.replace("      other: 'अन्य'\n    }\n  },", "      other: 'अन्य'\n" + hi_add)
content = content.replace("      other: 'Other'\n    }\n  },", "      other: 'Other'\n" + hinglish_add)
content = content.replace("      other: 'മറ്റുള്ളവ'\n    }\n  }\n};", "      other: 'മറ്റുള്ളവ'\n" + ml_add + "\n};")

with open(file_path, "w") as f:
    f.write(content)
