import React from 'react';

export default function TermsPage() {
    return (
        <div className="container max-w-4xl py-12 px-4">
            <h1 className="text-4xl font-serif font-bold mb-8">Terms & Conditions</h1>
            <div className="prose prose-stone max-w-none space-y-6 text-muted-foreground">
                <p>Last updated: November 20, 2025</p>

                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">1. Agreement to Terms</h2>
                    <p>
                        These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and Love Unsent (“we,” “us” or “our”), concerning your access to and use of the Love Unsent website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the “Site”).
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">2. Intellectual Property Rights</h2>
                    <p>
                        Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Representations</h2>
                    <p>
                        By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Terms and Conditions.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">4. Products</h2>
                    <p>
                        We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors, and your electronic display may not accurately reflect the actual colors and details of the products.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">5. Purchases and Payment</h2>
                    <p>
                        We accept the following forms of payment: Credit Cards, Debit Cards, Net Banking, UPI. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site. You further agree to promptly update account and payment information, including email address, payment method, and payment card expiration date, so that we can complete your transactions and contact you as needed.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">6. Contact Us</h2>
                    <p>
                        In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: <a href="mailto:support@loveunsent.com" className="text-primary hover:underline">support@loveunsent.com</a>
                    </p>
                </section>
            </div>
        </div>
    );
}
