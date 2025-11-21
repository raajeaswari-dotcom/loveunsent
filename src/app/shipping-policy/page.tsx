import React from 'react';

export default function ShippingPolicyPage() {
    return (
        <div className="container max-w-4xl py-12 px-4">
            <h1 className="text-4xl font-serif font-bold mb-8">Shipping Policy</h1>
            <div className="prose prose-stone max-w-none space-y-6 text-muted-foreground">
                <p>Last updated: November 20, 2025</p>

                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">1. Processing Time</h2>
                    <p>
                        All orders are processed within 2-3 business days. Orders are not shipped or delivered on weekends or holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery. If there will be a significant delay in shipment of your order, we will contact you via email or telephone.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">2. Shipping Rates & Delivery Estimates</h2>
                    <p>
                        Shipping charges for your order will be calculated and displayed at checkout.
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-2">
                        <li><strong>Standard Shipping:</strong> 5-7 business days - Free for orders over ₹500.</li>
                        <li><strong>Express Shipping:</strong> 2-3 business days - ₹150.</li>
                    </ul>
                    <p className="mt-2">
                        Delivery delays can occasionally occur.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">3. Shipment Confirmation & Order Tracking</h2>
                    <p>
                        You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">4. Customs, Duties and Taxes</h2>
                    <p>
                        Love Unsent is not responsible for any customs and taxes applied to your order. All fees imposed during or after shipping are the responsibility of the customer (tariffs, taxes, etc.).
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">5. Damages</h2>
                    <p>
                        Love Unsent is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim. Please save all packaging materials and damaged goods before filing a claim.
                    </p>
                </section>
            </div>
        </div>
    );
}
