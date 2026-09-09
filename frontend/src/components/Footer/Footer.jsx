import {
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-yellow-500/20 bg-black text-gray-300">

      {/* Main Footer */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-12 sm:px-6 sm:py-14 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">

        {/* Company */}
        <div className="text-center md:text-left">
          <Link
            to="/"
            className="inline-block text-2xl font-bold tracking-wide text-yellow-500 sm:text-3xl"
          >
            WATCHSTORE
          </Link>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-gray-400 md:mx-0 sm:text-base">
            Premium Luxury Watch Collection.
            Discover Rolex, Omega, Casio, Seiko
            and many more premium brands.
          </p>

          {/* Social Icons */}
          <div className="mt-6 flex justify-center gap-4 md:justify-start">
            <a
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 transition hover:border-yellow-500 hover:bg-yellow-500 hover:text-black"
            >
              <FaFacebookF />
            </a>

            <a
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 transition hover:border-yellow-500 hover:bg-yellow-500 hover:text-black"
            >
              <FaInstagram />
            </a>

            <a
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 transition hover:border-yellow-500 hover:bg-yellow-500 hover:text-black"
            >
              <FaLinkedinIn />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="text-center md:text-left">
          <h3 className="mb-5 text-lg font-semibold text-white sm:text-xl">
            Quick Links
          </h3>

          <ul className="space-y-3 text-sm sm:text-base">
            <li>
              <Link
                to="/"
                className="transition hover:text-yellow-500"
              >
                Home
              </Link>
            </li>

            <li>
              <Link
                to="/products"
                className="transition hover:text-yellow-500"
              >
                Products
              </Link>
            </li>

            <li>
              <Link
                to="/wishlist"
                className="transition hover:text-yellow-500"
              >
                Wishlist
              </Link>
            </li>

            <li>
              <Link
                to="/cart"
                className="transition hover:text-yellow-500"
              >
                Cart
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer */}
        <div className="text-center md:text-left">
          <h3 className="mb-5 text-lg font-semibold text-white sm:text-xl">
            Customer
          </h3>

          <ul className="space-y-3 text-sm sm:text-base">
            <li>
              <Link
                to="/login"
                className="transition hover:text-yellow-500"
              >
                Login
              </Link>
            </li>

            <li>
              <Link
                to="/register"
                className="transition hover:text-yellow-500"
              >
                Register
              </Link>
            </li>

            <li>
              <Link
                to="/profile"
                className="transition hover:text-yellow-500"
              >
                Profile
              </Link>
            </li>

            <li>
              <Link
                to="/my-orders"
                className="transition hover:text-yellow-500"
              >
                My Orders
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="text-center md:text-left">
          <h3 className="mb-5 text-lg font-semibold text-white sm:text-xl">
            Contact
          </h3>

          <div className="space-y-4 text-sm sm:text-base">

            {/* Location */}
            <div className="flex items-start justify-center gap-3 md:justify-start">
              <MapPin
                size={19}
                className="mt-1 shrink-0 text-yellow-500"
              />

              <span>
                Dhaka, Bangladesh
              </span>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-center gap-3 md:justify-start">
              <Phone
                size={19}
                className="shrink-0 text-yellow-500"
              />

              <a
                href="tel:+8801700000000"
                className="transition hover:text-yellow-500"
              >
                +8801700000000
              </a>
            </div>

            {/* Email */}
            <div className="flex items-start justify-center gap-3 md:justify-start">
              <Mail
                size={19}
                className="mt-1 shrink-0 text-yellow-500"
              />

              <a
                href="mailto:support@watchstore.com"
                className="break-all transition hover:text-yellow-500"
              >
                support@watchstore.com
              </a>
            </div>

          </div>
        </div>

      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800 px-5 py-5 text-center">

        <p className="text-xs text-gray-500 sm:text-sm">
          © {new Date().getFullYear()}{" "}
          <span className="font-medium text-yellow-500">
            WatchStore
          </span>
          . All Rights Reserved.
        </p>

      </div>

    </footer>
  );
}