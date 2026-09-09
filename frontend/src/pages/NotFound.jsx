import { Link } from "react-router-dom";

export default function Page() {

    return (

        <main className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4 py-16">

            <div className="w-full max-w-xl text-center">


                {/* 404 */}

                <p className="text-8xl font-black tracking-tight text-gray-900 sm:text-9xl">
                    404
                </p>


                {/* Title */}

                <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">
                    Page Not Found
                </h1>


                {/* Description */}

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
                    Sorry, the page you are looking for doesn't exist,
                    has been moved, or is no longer available.
                </p>


                {/* Actions */}

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

                    <Link
                        to="/"
                        className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
                    >
                        ← Back to Home
                    </Link>


                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                        Go Back
                    </button>

                </div>

            </div>

        </main>

    );
}

