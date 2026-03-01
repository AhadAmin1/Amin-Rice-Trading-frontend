import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { dataStore } from '@/store/dataStore';
import { BellRing } from 'lucide-react';

const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"; // Subtle digital notification

export function DueNotifications() {
  const notifiedIds = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio(NOTIFICATION_SOUND);
    audioRef.current.volume = 0.5;

    const checkOverdue = async () => {
      try {
        const [bills, stock] = await Promise.all([
          dataStore.getBills(),
          dataStore.getStock()
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overdueItems: any[] = [];

        // Check Bills (Receivables)
        bills.forEach(bill => {
          if (bill.status !== 'paid' && bill.dueDate) {
            const dueDate = new Date(bill.dueDate);
            if (dueDate < today && !notifiedIds.current.has(bill.id)) {
              overdueItems.push({
                id: bill.id,
                title: `Overdue: ${bill.billNumber}`,
                description: `${bill.buyerName} owes RS ${ (bill.totalAmount - (bill.paidAmount || 0)).toLocaleString() }`,
                type: 'bill'
              });
            }
          }
        });

        // Check Stock (Payables)
        stock.forEach(item => {
          if (item.status !== 'paid' && item.dueDate) {
            const dueDate = new Date(item.dueDate);
            if (dueDate < today && !notifiedIds.current.has(item.id)) {
              overdueItems.push({
                id: item.id,
                title: `Overdue: Payment to ${item.millerName}`,
                description: `RS ${ (item.totalAmount - (item.paidAmount || 0)).toLocaleString() } is due (#${item.receiptNumber})`,
                type: 'stock'
              });
            }
          }
        });

        if (overdueItems.length > 0) {
          audioRef.current?.play().catch(e => console.log("Sound play blocked by browser", e));

          if (overdueItems.length > 3) {
            toast.error(`Multiple Overdue Payments (${overdueItems.length})`, {
              description: "Please check the notification bell for details.",
              duration: 10000,
              icon: <BellRing className="h-4 w-4" />
            });
            overdueItems.forEach(item => notifiedIds.current.add(item.id));
          } else {
            overdueItems.forEach(item => {
              toast.error(item.title, {
                description: item.description,
                duration: 8000,
                icon: <BellRing className="h-4 w-4" />
              });
              notifiedIds.current.add(item.id);
            });
          }
        }

        const currentOverdueItems = [
          ...bills.filter(b => b.status !== 'paid' && b.dueDate && new Date(b.dueDate) < today).map(b => ({
            id: b.id,
            title: b.billNumber,
            party: b.buyerName,
            amount: b.totalAmount - (b.paidAmount || 0),
            date: b.dueDate,
            type: 'sale'
          })),
          ...stock.filter(s => s.status !== 'paid' && s.dueDate && new Date(s.dueDate) < today).map(s => ({
            id: s.id,
            title: s.receiptNumber,
            party: s.millerName,
            amount: s.totalAmount - (s.paidAmount || 0),
            date: s.dueDate,
            type: 'purchase'
          }))
        ];
        
        dataStore.setOverdueItems(currentOverdueItems);
        (window as any).overdueCount = currentOverdueItems.length;
      } catch (error) {
        console.error("Error checking overdue notifications:", error);
      }
    };

    // Check on mount and then every 5 minutes
    checkOverdue();
    const interval = setInterval(checkOverdue, 5 * 60 * 1000);
    
    const unsubscribe = dataStore.onUpdate(checkOverdue);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  return null; // Invisible logic component
}
