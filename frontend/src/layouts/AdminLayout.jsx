import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Menu,
  Bell,
  UserCircle,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import AdminSidebar from "../components/admin/AdminSidebar";

export default function AdminLayout() {
  const location = useLocation();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // =====================================================
  // CLOSE SIDEBAR WHEN ROUTE CHANGES
  // =====================================================

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);


  // =====================================================
  // LOCK BODY SCROLL ON MOBILE
  // =====================================================

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);


  // =====================================================
  // ESCAPE KEY
  // =====================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);


  // =====================================================
  // LAYOUT
  // =====================================================

  return (
    <div className="min-h-dvh bg-zinc-100">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <AdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />


      {/* =================================================
          MAIN CONTENT AREA
      ================================================= */}

      <div className="lg:pl-[260px]">

        {/* =================================================
            TOP HEADER
        ================================================= */}

        <header
          className="
            sticky
            top-0
            z-30

            flex
            h-14
            w-full
            items-center

            border-b
            border-zinc-200

            bg-white/95
            shadow-sm
            backdrop-blur

            px-3

            sm:h-16
            sm:px-5

            lg:px-6
          "
        >

          {/* =================================================
              PAGE TITLE
          ================================================= */}

          <div className="min-w-0 flex-1">

            <h1
              className="
                truncate

                text-sm
                font-semibold
                text-zinc-900

                sm:text-base
              "
            >
              Admin Dashboard
            </h1>

            <p
              className="
                hidden

                text-xs
                text-zinc-500

                sm:block
              "
            >
              WatchStore Administration
            </p>

          </div>


          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div
            className="
              flex
              shrink-0
              items-center

              gap-1

              sm:gap-2
            "
          >

            {/* =================================================
                NOTIFICATION
            ================================================= */}

            <button
              type="button"
              className="
                relative

                flex
                h-9
                w-9
                items-center
                justify-center

                rounded-lg

                text-zinc-500

                transition

                hover:bg-zinc-100
                hover:text-zinc-900

                focus:outline-none
                focus:ring-2
                focus:ring-zinc-300
              "
              aria-label="Notifications"
            >

              <Bell
                size={19}
                strokeWidth={1.8}
              />

              {/* Notification dot */}

              <span
                className="
                  absolute
                  right-1.5
                  top-1.5

                  h-1.5
                  w-1.5

                  rounded-full

                  bg-red-500
                "
              />

            </button>


            {/* =================================================
                DIVIDER
            ================================================= */}

            <div
              className="
                hidden

                h-6
                w-px

                bg-zinc-200

                sm:block
              "
            />


            {/* =================================================
                ADMIN PROFILE
            ================================================= */}

            <button
              type="button"
              className="
                flex
                items-center
                gap-2

                rounded-lg

                px-1.5
                py-1.5

                transition

                hover:bg-zinc-100

                focus:outline-none
                focus:ring-2
                focus:ring-zinc-300

                sm:px-2
              "
              aria-label="Admin profile"
            >

              <UserCircle
                size={27}
                strokeWidth={1.7}
                className="text-zinc-600"
              />
              {/* Profile information */}

              <div className=" hidden text-left md:block " >
                <p className=" text-xs font-semibold text-zinc-800 " >
                  {user?.username || "Admin"}
                </p>
                <p className=" text-[10px] text-zinc-500 " >
                  {user?.role || "Administrator"} </p>
              </div>
            </button>


            {/* =================================================
                MOBILE HAMBURGER
            ================================================= */}

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center

                rounded-lg

                text-zinc-600

                transition

                hover:bg-zinc-100
                hover:text-zinc-900

                focus:outline-none
                focus:ring-2
                focus:ring-zinc-300

                lg:hidden
              "
              aria-label="Open admin menu"
              aria-expanded={sidebarOpen}
            >

              <Menu
                size={23}
                strokeWidth={2}
              />

            </button>

          </div>

        </header>


        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <main
          className="
            min-h-[calc(100dvh-3.5rem)]
            p-3 sm:p-5 md:p-6 lg:p-7 xl:p-8
            overflow-x-hidden
          "
        >
          <div className="mx-auto w-full max-w-[1600px] overflow-x-auto">
            <Outlet />
          </div>
        </main>

      </div>

    </div>
  );
}