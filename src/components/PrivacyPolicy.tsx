import React from 'react';

export const PrivacyPolicy: React.FC = () => {
    React.useEffect(() => {
        document.documentElement.style.overflow = 'auto';
        document.body.style.overflow = 'auto';
        return () => {
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
        };
    }, []);

    return (
        <div className="min-h-screen w-full bg-gray-50 flex flex-col font-sans p-3 py-6 sm:p-6 md:p-12 overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-5 sm:p-8 md:p-12 border border-gray-100 my-8 sm:my-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-6">Privacy Policy</h1>
                <p className="text-gray-500 mb-6 sm:mb-8">Last updated: January 27, 2026</p>

                <div className="space-y-6 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">1. Introduction</h2>
                        <p>
                            Welcome to <strong>Travel Tracker</strong> ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.
                            This Privacy Policy explains what information we collect, how we use it, and your rights in relation to it.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">2. Information We Collect</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Account Information:</strong> When you register, we collect your username, email address (optional), and password.</li>
                            <li><strong>Travel Data:</strong> We store the lists of countries, states, and provinces you mark as "visited." This is the core functionality of the app.</li>
                            <li><strong>Device Information:</strong> We may collect basic device information (model, OS version) for analytics and troubleshooting.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">3. How We Use Your Information</h2>
                        <p>We use your information strictly to:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>Provide and manage your user account.</li>
                            <li>Save and sync your travel map across devices.</li>
                            <li>Respond to user inquiries or support requests.</li>
                        </ul>
                        <p className="mt-2 font-semibold">We do NOT sell your personal data to advertisers or third parties.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">4. Data Storage and Security</h2>
                        <p>
                            Your data is securely stored on our servers (hosted on Amazon Web Services). We implement standard security measures including hashing of passwords and
                            encryption of data in transit (HTTPS) to protect your information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">5. Children's Privacy</h2>
                        <p>
                            We do not knowingly collect personal information from children under the age of 13. If you are a parent or guardian and believe your child has provided
                            us with personal information, please contact us so we can delete it.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">6. Deleting Your Account</h2>
                        <p>
                            If you wish to delete your account and all associated travel data, you can do so by visiting our <a href="/delete-account" className="text-indigo-600 hover:underline font-semibold">Account Deletion Page</a>. This action is permanent and cannot be undone.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">7. Contact Us</h2>
                        <p>
                            If you have questions or comments about this policy, you may contact us at:
                            <a href="mailto:changzhiai@gmail.com" className="text-indigo-600 hover:underline"> changzhiai@gmail.com</a>
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 text-center">
                    <a href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
};
