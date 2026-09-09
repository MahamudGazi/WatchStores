import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) return;

    console.log("Subscribed:", email);

    setEmail("");
  };

  return (
    <section className="bg-black px-4 py-14 text-white sm:px-6 sm:py-20 lg:px-8">

      <div className="mx-auto max-w-3xl text-center">

        {/* Heading */}
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500 sm:text-sm">
          Stay Updated
        </p>

        <h2 className="mt-2 text-3xl font-bold sm:text-4xl md:text-5xl">
          Subscribe
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
          Get the latest offers, new arrivals and exclusive
          deals directly to your inbox.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:gap-0"
        >

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="w-full rounded-lg border border-gray-700 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 sm:rounded-l-lg sm:rounded-r-none"
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-yellow-500 px-6 py-3 text-sm font-semibold text-black transition duration-300 hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20 sm:w-auto sm:shrink-0 sm:rounded-l-none"
          >
            Subscribe
          </button>

        </form>

        <p className="mt-4 text-xs text-gray-500">
          We respect your privacy. No spam, ever.
        </p>

      </div>

    </section>
  );
}

