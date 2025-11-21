import { PurchaseOrder } from '@/models/PurchaseOrder';
import { InventoryItem } from '@/models/InventoryItem';

export const POService = {
    async createPO(data: any, userId: string) {
        const po = await PurchaseOrder.create({
            ...data,
            createdBy: userId,
            status: 'created'
        });
        return po;
    },

    async updateStatus(poId: string, status: string) {
        const po = await PurchaseOrder.findByIdAndUpdate(poId, { status }, { new: true });

        if (status === 'received') {
            // Auto-update inventory stock
            for (const item of po.items) {
                await InventoryItem.findByIdAndUpdate(item.itemId, {
                    $inc: { stock: item.quantity }
                });
            }
            po.receivedDate = new Date();
            await po.save();
        }

        return po;
    }
};
