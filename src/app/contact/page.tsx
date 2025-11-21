import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function ContactPage() {
    return (
        <div className="container py-10 px-4 max-w-4xl">
            <h1 className="text-4xl font-serif font-bold mb-8 text-center">Contact Us</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
                    <p className="text-muted-foreground mb-6">
                        Have questions about your order or need help customizing your letter? We're here to help.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium">Email</h3>
                            <p className="text-muted-foreground">support@loveunsent.com</p>
                        </div>
                        <div>
                            <h3 className="font-medium">Phone</h3>
                            <p className="text-muted-foreground">+91 98765 43210</p>
                        </div>
                        <div>
                            <h3 className="font-medium">Address</h3>
                            <p className="text-muted-foreground">
                                123 Letter Lane, <br />
                                Stationery District, <br />
                                Mumbai, India 400001
                            </p>
                        </div>
                    </div>
                </div>

                <Card className="p-6">
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input placeholder="Your Name" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input type="email" placeholder="your@email.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Message</label>
                            <textarea
                                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="How can we help you?"
                            />
                        </div>
                        <Button className="w-full">Send Message</Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
