"use client";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { toggleSidebar } from "@/store/themeConfigSlice";
import { IRootState } from "@/store";
import { useState, useEffect } from "react";
import IconCaretsDown from "@/components/icon/icon-carets-down";
import IconPet from "@/components/icon/icon-pet";
import IconBooking from "@/components/icon/icon-booking";
import IconMenuUsers from "@/components/icon/menu/icon-menu-users";
import IconMenuDocumentation from "@/components/icon/menu/icon-menu-documentation";
import IconMenuIncome from "@/components/icon/menu/IconMenuIncome"; // New icon import for Income
import IconMenuExpenses from "@/components/icon/menu/IconMenuExpenses"; // New icon import for Expenses
import IconMenuReports from "@/components/icon/icon-bar-chart";
import IconMenuSettings from "@/components/icon/menu/IconMenuSettings"; // New icon import for Settings
import { usePathname } from "next/navigation";
import { getTranslation } from "@/i18n";
import IconCaretDown from "@/components/icon/icon-caret-down";
import AnimateHeight from "react-animate-height";

const Sidebar = () => {
  const dispatch = useDispatch();
  const { t } = getTranslation();
  const pathname = usePathname();
  const [currentMenu, setCurrentMenu] = useState<string>("");
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const semidark = useSelector(
    (state: IRootState) => state.themeConfig.semidark
  );
  const toggleMenu = (value: string) => {
    setCurrentMenu((oldValue) => {
      return oldValue === value ? "" : value;
    });
  };

  useEffect(() => {
    const selector = document.querySelector(
      '.sidebar ul a[href="' + window.location.pathname + '"]'
    );
    if (selector) {
      selector.classList.add("active");
      const ul: any = selector.closest("ul.sub-menu");
      if (ul) {
        let ele: any =
          ul.closest("li.menu").querySelectorAll(".nav-link") || [];
        if (ele.length) {
          ele = ele[0];
          setTimeout(() => {
            ele.click();
          });
        }
      }
    }
  }, []);

  useEffect(() => {
    setActiveRoute();
    if (window.innerWidth < 1024 && themeConfig.sidebar) {
      dispatch(toggleSidebar());
    }
  }, [pathname]);

  const setActiveRoute = () => {
    let allLinks = document.querySelectorAll(".sidebar ul a.active");
    for (let i = 0; i < allLinks.length; i++) {
      const element = allLinks[i];
      element?.classList.remove("active");
    }
    const selector = document.querySelector(
      '.sidebar ul a[href="' + window.location.pathname + '"]'
    );
    selector?.classList.add("active");
  };

  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return null; // Don't render the sidebar on the login page
  }

  return (
    <div className={semidark ? "dark" : ""}>
      <nav
        className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${
          semidark ? "text-white-dark" : ""
        }`}
      >
        <div className="h-full bg-white dark:bg-black">
          <div className="flex items-center justify-between px-4 py-3">
            <Link
              href="/login"
              className="main-logo flex shrink-0 items-center"
            >
              <img
                className="ml-[5px] w-40 flex-none"
                src="/assets/images/logo.jpg"
                alt="logo"
              />
              <span className="align-middle text-2xl font-semibold dark:text-white-light lg:inline ltr:ml-1.5 rtl:mr-1.5"></span>
            </Link>

            <button
              type="button"
              className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 dark:text-white-light dark:hover:bg-dark-light/10 rtl:rotate-180"
              onClick={() => dispatch(toggleSidebar())}
            >
              <IconCaretsDown className="m-auto rotate-90" />
            </button>
          </div>
          <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
            <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
              <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                <span>{t("Cause for Paws")}</span>
              </h2>

              <li className="nav-item">
                <Link href="/owner" className="group">
                  <div className="flex items-center">
                    <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                      {t("Parents")}
                    </span>
                  </div>
                </Link>
              </li>

              <li className="nav-item">
                <Link href="/pet" className="group">
                  <div className="flex items-center">
                    <IconPet className="shrink-0 group-hover:!text-primary" />
                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                      {t("Pets")}
                    </span>
                  </div>
                </Link>
              </li>

              <li className="nav-item">
                <Link href="/veterinarian" className="group">
                  <div className="flex items-center">
                    <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                      {t("veterinarian")}
                    </span>
                  </div>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/booking" className="group">
                  <div className="flex items-center">
                    <IconBooking className="shrink-0 group-hover:!text-primary" />
                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                      {t("Booking")}
                    </span>
                  </div>
                </Link>
              </li>

              <li className="nav-item">
                <Link href="/services" className="group">
                  <div className="flex items-center">
                  <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                    <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                      {t("Services")}
                    </span>
                  </div>
                </Link>
              </li>
            </ul>
          </PerfectScrollbar>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
