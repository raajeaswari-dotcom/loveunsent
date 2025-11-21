import React from 'react';

export default function RefundPolicyPage() {
    return (
        <div className="container max-w-4xl py-12 px-4">
            <h1 className="text-4xl font-serif font-bold mb-8">Refund Policy</h1>
            <div className="prose prose-stone max-w-none space-y-6 text-muted-foreground">
                <p>Last updated: November 20, 2025</p>

                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">1. Returns</h2>
                    <p>
                        Due to the personalized nature of our handwritten letters, we generally do not accept returns. However, if there is an error on our part (e.g., incorrect text, wrong paper type), please contact us immediately, and we will rectify the issue.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">2. Refunds</h2>
                    <p>
                        We offer refunds in the following situations:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-2">
                        <li><strong>Order Cancellation:</strong> You may cancel your order within 2 hours of placing it for a full refund. After this period, if a writer has already been assigned, a cancellation fee may apply.</li>
                        <li><strong>Quality Issues:</strong> If the handwriting is illegible or significantly different from the sample style chosen, we will offer a rewrite or a partial/full refund upon review.</li>
                        <li><strong>Lost Shipments:</strong> If your order is lost in transit and confirmed by the courier, we will issue a full refund or resend the letter at no extra cost.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">3. Late or Missing Refunds</h2>
                    <p>
                        If you haven’t received a refund yet, first check your bank account again. Then contact your credit card company, it may take some time before your refund is officially posted. Next contact your bank. There is often some processing time before a refund is posted. If you’ve done all of this and you still have not received your refund yet, please contact us at <a href="mailto:support@loveunsent.com" className="text-primary hover:underline">support@loveunsent.com</a>.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">4. Exchanges</h2>
                    <p>
                        We only replace items if they are defective or damaged. If you need to exchange it for the same item, send us an email at <a href="mailto:support@loveunsent.com" className="text-primary hover:underline">support@loveunsent.com</a>.
                    </p>
                </section>
            </div>
        </div>
    );
}
