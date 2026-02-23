import React from 'react';

export const DeleteAccountInfo: React.FC = () => {
    return (
        <div className="min-h-screen h-auto bg-gray-50 flex flex-col font-sans p-6 md:p-12 overflow-y-auto">
            <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8 md:p-12 border border-gray-100 my-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-red-600">Request Account Deletion</h1>

                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                    At <strong>Travel Tracker</strong>, you have full control over your data. If you wish to delete your account and all associated data, you can do so directly within the app or by contacting us.
                </p>

                <div className="space-y-8">
                    <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                            <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                            Delete via App (Instant)
                        </h2>
                        <ol className="list-decimal pl-5 space-y-2 text-gray-600 ml-11">
                            <li>Log in to the <strong>Travel Tracker</strong> app.</li>
                            <li>Tap on your <strong>Avatar / Profile Picture</strong> in the top right.</li>
                            <li>Select <strong>My Profile</strong>.</li>
                            <li>Go to the <strong>Edit Profile</strong> tab.</li>
                            <li>Scroll down to the <strong>Danger Zone</strong>.</li>
                            <li>Click <strong>Delete Account</strong> and confirm your password.</li>
                        </ol>
                        <p className="mt-3 text-sm text-gray-500 ml-11">
                            <em>Result: Your account, profile, and all travel history are immediately and permanently deleted from our database.</em>
                        </p>
                    </section>

                    <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                            <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                            Request via Email
                        </h2>
                        <p className="text-gray-600 mb-4 ml-11">
                            If you cannot access the app, you may request deletion by email. We will process your request within 7 business days.
                        </p>
                        <div className="ml-11">
                            <a
                                href="mailto:changzhiai@gmail.com?subject=Travel Tracker Account Deletion Request"
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 hover:text-red-600 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                Email Deletion Request
                            </a>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-800 mb-2">Data Retention Policy</h2>
                        <p className="text-gray-600 text-sm">
                            When your account is deleted, we remove your username, password (hash), email address, and all visited location records. No personal data is retained after deletion.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 text-center">
                    <a href="/" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
                        &larr; Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
};
