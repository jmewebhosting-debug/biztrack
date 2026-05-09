export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const sendNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/logo.png' // Make sure you have a logo.png in public folder
    });
  }
};

// Check for renewals and notify
export const checkRenewalsAndNotify = (sales: any[]) => {
  const today = new Date();
  sales.forEach(sale => {
    const renewalDate = new Date(sale.renewalDate);
    const diffDays = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 3 || diffDays === 1) {
      sendNotification(
        'Renewal Reminder!', 
        `${sale.productName} for ${sale.customerName} expires in ${diffDays} day(s).`
      );
    }
  });
};
