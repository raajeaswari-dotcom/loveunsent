import { sendEmail, sendSMS, sendWhatsApp } from '@/utils/notificationSender';
import { Notification } from '@/models/Notification';
import { User } from '@/models/User';

type EventType = 'order_placed' | 'writer_assigned' | 'qc_completed' | 'shipped' | 'delivered';

export async function triggerNotification(eventType: EventType, order: any, recipientId?: string) {
    try {
        let user;
        if (recipientId) {
            user = await User.findById(recipientId);
        } else {
            user = await User.findById(order.customerId);
        }

        if (!user) {
            console.error(`Notification failed: User not found for order ${order.orderId}`);
            return;
        }

        const contactEmail = user.email;
        const contactPhone = user.phone;

        let title = '';
        let message = '';

        switch (eventType) {
            case 'order_placed':
                title = 'Order Confirmation';
                message = `Hi ${user.name}, your order ${order.orderId} has been placed successfully!`;
                break;
            case 'writer_assigned':
                title = 'Writer Assigned';
                message = `Good news! A writer has been assigned to your order ${order.orderId}.`;
                break;
            case 'qc_completed':
                title = 'Quality Check Passed';
                message = `Your letter for order ${order.orderId} has passed our quality check and is ready for packing.`;
                break;
            case 'shipped':
                title = 'Order Shipped';
                message = `Your order ${order.orderId} has been shipped! Tracking ID: ${order.fulfillment?.trackingId}`;
                break;
            case 'delivered':
                title = 'Order Delivered';
                message = `Your order ${order.orderId} has been delivered. We hope you love it!`;
                break;
        }

        // Log to DB
        await Notification.create({
            recipient: user._id,
            channel: 'email', // Defaulting to email for log, but we might send multiple
            type: 'order_update',
            title,
            message,
            metadata: { orderId: order._id }
        });

        // Send via Channels
        if (contactEmail) {
            await sendEmail(contactEmail, title, message);
        }

        if (contactPhone) {
            await sendSMS(contactPhone, message);
            await sendWhatsApp(contactPhone, message);
        }

    } catch (error) {
        console.error('Notification Trigger Error:', error);
    }
}
