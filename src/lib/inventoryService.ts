import { InventoryItem } from '@/models/InventoryItem';
import { triggerNotification } from '@/lib/notificationService';

export const InventoryService = {
    async adjustStock(itemId: string, quantity: number, reason: string, type: 'add' | 'remove' | 'reserve' | 'release') {
        const item = await InventoryItem.findById(itemId);
        if (!item) throw new Error('Item not found');

        if (type === 'add') {
            item.stock += quantity;
        } else if (type === 'remove') {
            if (item.stock < quantity) throw new Error('Insufficient stock');
            item.stock -= quantity;
        } else if (type === 'reserve') {
            if (item.stock - item.reserved < quantity) throw new Error('Insufficient available stock');
            item.reserved += quantity;
        } else if (type === 'release') {
            if (item.reserved < quantity) throw new Error('Cannot release more than reserved');
            item.reserved -= quantity;
        }

        await item.save();

        // Check low stock threshold
        if ((type === 'remove' || type === 'reserve') && (item.stock - item.reserved) <= item.threshold) {
            // Trigger low stock alert
            // triggerNotification('low_stock', item); 
            console.log(`Low stock alert for ${item.name}`);
        }

        return item;
    },

    async getLowStockItems() {
        // Find items where (stock - reserved) <= threshold
        // MongoDB doesn't support virtuals in queries directly easily without aggregation
        return await InventoryItem.aggregate([
            { $addFields: { available: { $subtract: ['$stock', '$reserved'] } } },
            { $match: { $expr: { $lte: ['$available', '$threshold'] } } }
        ]);
    },

    async reserveStockForOrder(orderItems: any[]) {
        // Transactional logic ideally
        for (const item of orderItems) {
            // Assuming orderItems have a mapping to inventory itemId
            // This requires mapping Product (Paper/Perfume) to InventoryItem
            // For now, we assume direct mapping or skip if not implemented
        }
    }
};
