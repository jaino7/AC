import Link from 'next/link';

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-4xl font-bold mb-8">Creator Platform</h1>
            <div className="grid gap-4 text-center">
                <Link
                    href="/creators/login"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Login
                </Link>
                <Link
                    href="/creators/signup"
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    Sign Up
                </Link>
                <Link
                    href="/creators/dashboard"
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Dashboard
                </Link>
            </div>
        </div>
    );
}
