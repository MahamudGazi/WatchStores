import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-6 sm:py-16 md:py-20 lg:grid-cols-2 lg:gap-14 lg:px-8">

        {/* Content */}
        <div className="text-center lg:text-left">

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-yellow-500 sm:text-base">
            Premium Collection
          </p>

          <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            Luxury Watches
            <br />
            <span className="text-yellow-500">
              For Every Moment
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-gray-300 sm:mt-6 sm:text-base md:text-lg lg:mx-0">
            Discover premium watches from Rolex,
            Omega, Casio and more. Find the perfect
            timepiece for every moment.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">

            <Link
              to="/products"
              className="rounded-lg bg-yellow-500 px-7 py-3 text-center font-semibold text-black transition duration-300 hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20 sm:px-8"
            >
              Shop Now
            </Link>

            <Link
              to="/products"
              className="rounded-lg border border-yellow-500 px-7 py-3 text-center font-semibold text-yellow-500 transition duration-300 hover:bg-yellow-500 hover:text-black sm:px-8"
            >
              Explore Collection
            </Link>

          </div>

        </div>

        {/* Image */}
        <div className="order-first lg:order-last">

          <div className="overflow-hidden rounded-2xl border border-yellow-500/20 shadow-2xl shadow-yellow-500/10">

            <img
              src="https://placehold.co/700x500"
              alt="Luxury Watches"
              className="h-auto w-full object-cover transition duration-500 hover:scale-105"
            />

          </div>

        </div>

      </div>
    </section>
  );
}

