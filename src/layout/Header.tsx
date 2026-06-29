"use client";

import { FiSearch, FiUser, FiShoppingCart, FiLogOut, FiXCircle } from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { CgClose } from "react-icons/cg";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCartStore } from "@/src/store/cartStore";
import useAuthStore from "@/src/store/authStore";

const Header = () => {
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathName = usePathname();
  const router = useRouter();
  const totalItems = useCartStore((state) => state.totalItems());
  const clearCart = useCartStore((state) => state.clearCart);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [mounted, setMounted] = useState(false);

  const pages = [
    { name: "Home", href: "/", id: 1 },
    { name: "About Us", href: "/about-us", id: 2 },
    { name: "Shop", href: "/shop", id: 3 },
    { name: "Deals To Steal", href: "/deals", id: 4, icon: FaFire },
    { name: "Contact Us", href: "/contact-us", id: 5 },
  ];

  const closeMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowMenu(false);
      setIsClosing(false);
    }, 300);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setShowMenu(false);
    } else {
      router.push(`/shop`);
      setIsSearchOpen(false);
      setShowMenu(false);
    }
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(mobileSearchQuery.trim())}`);
      setIsMobileSearchOpen(false);
      setShowMenu(false);
    } else {
      router.push(`/shop`);
      setIsMobileSearchOpen(false);
      setShowMenu(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
      if (
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target as Node)
      ) {
        setIsMobileSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Persist search query from URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("search") || "";
      setSearchQuery(q);
      setMobileSearchQuery(q);
    }
  }, [pathName]);

  // Global API Interceptor for 403 errors
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch;

    window.fetch = async function (...args) {
      const response = await originalFetch.apply(this, args);

      // If any API returns 403 Forbidden
      if (response.status === 403) {
        // Only clear cart and logout if they are an authenticated user
        // We do NOT want to wipe a guest's local cart if they accidentally hit a 403
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          logout();
          clearCart();
        }
        router.push("/login");
      }

      return response;
    };

    return () => {
      // Restore original fetch when component unmounts (though Header rarely unmounts)
      window.fetch = originalFetch;
    };
  }, [logout, clearCart, router]);

  const isCartActive = pathName === "/cart";

  return (
    <>
      <header
        className={`w-full shadow-md bg-white sticky top-0 z-40 transition-all duration-300`}
      >
        <div className="container mx-auto px-4 h-24 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Image src="/logo.svg" alt="logo" width={140} height={140} />
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-2 xl:gap-5">
            {pages.map((item) => {
              // const activeLink =
              //   item.href === "/"
              //     ? pathName === "/" || !pathName
              //     : pathName?.startsWith(item.href);
              const activeLink =
                item.href === "/"
                  ? pathName === "/" || pathName === ""
                  : pathName === item.href ||
                    pathName?.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-1.5 xl:gap-2 rounded-full px-3 xl:px-5 py-2 xl:py-2.5 text-base xl:text-lg transition-colors font-medium whitespace-nowrap ${
                    activeLink
                      ? "bg-primary text-white font-medium"
                      : "text-slate-800 hover:text-black hover:bg-primary-light/20"
                  }`}
                >
                  {item.name}
                  {Icon && (
                    <Icon className="text-red-500/80 text-base xl:text-lg" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 lg:gap-3 xl:gap-5">
            <div className="flex items-center gap-3 xl:gap-5 text-gray-700">
              <div
                ref={searchRef}
                className="relative invisible lg:visible lg:flex items-center h-8"
              >
                <FiSearch
                  className={`text-2xl cursor-pointer transition-colors ${isSearchOpen ? "text-primary" : "hover:text-black"}`}
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                />

                {isSearchOpen && (
                  <div className="absolute right-0 top-full mt-4 w-80 bg-white border border-gray-100 rounded-xl shadow-lg py-2 px-3 z-50">
                    <form
                      onSubmit={handleSearch}
                      className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all"
                    >
                      <input
                        type="text"
                        placeholder="Search for products..."
                        className="bg-transparent outline-none text-sm w-full text-black placeholder:text-gray-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="text-gray-400 hover:text-gray-600 px-1"
                        >
                          <FiXCircle size={16} />
                        </button>
                      )}
                      <button
                        type="submit"
                        className="text-gray-400 hover:text-primary p-1.5 ml-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                        title="Search"
                      >
                        <FiSearch size={18} />
                      </button>
                      <div className="w-px h-4 bg-gray-200 mx-2 shrink-0"></div>
                      <CgClose
                        className="text-lg cursor-pointer text-gray-400 hover:text-red-500 shrink-0 transition-colors"
                        onClick={() => setIsSearchOpen(false)}
                        title="Close"
                      />
                    </form>
                  </div>
                )}
              </div>

              <div
                ref={mobileSearchRef}
                className="relative flex items-center h-8 lg:hidden"
              >
                <FiSearch
                  className={`text-2xl cursor-pointer transition-colors ${isMobileSearchOpen ? "text-primary" : "hover:text-black"}`}
                  onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                />

                {isMobileSearchOpen && (
                  <div className="fixed left-4 right-4 top-28 bg-white border border-gray-100 rounded-xl shadow-lg py-2 px-3 z-50">
                    <form
                      onSubmit={handleMobileSearch}
                      className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all"
                    >
                      <input
                        type="text"
                        placeholder="Search for products..."
                        className="bg-transparent outline-none text-sm w-full text-black placeholder:text-gray-500"
                        value={mobileSearchQuery}
                        onChange={(e) => setMobileSearchQuery(e.target.value)}
                        autoFocus
                      />
                      {mobileSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setMobileSearchQuery("")}
                          className="text-gray-400 hover:text-gray-600 px-1"
                        >
                          <FiXCircle size={16} />
                        </button>
                      )}
                      <button
                        type="submit"
                        className="text-gray-400 hover:text-primary p-1.5 ml-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                        title="Search"
                      >
                        <FiSearch size={18} />
                      </button>
                      <div className="w-px h-4 bg-gray-200 mx-2 shrink-0"></div>
                      <CgClose
                        className="text-lg cursor-pointer text-gray-400 hover:text-red-500 shrink-0 transition-colors"
                        onClick={() => setIsMobileSearchOpen(false)}
                        title="Close"
                      />
                    </form>
                  </div>
                )}
              </div>

              {hasHydrated && user ? (
                <div ref={userMenuRef} className="relative hidden lg:block">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center text-gray-700 hover:text-black transition focus:outline-none cursor-pointer"
                    title="User Menu"
                  >
                    <FiUser className="text-2xl" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-4 w-56 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-50 flex flex-col mb-1">
                        <span className="text-lg font-semibold text-gray-900 truncate">
                          {user?.first_name
                            ? `${user.first_name} ${user.last_name || ""}`
                            : user?.username || "My Account"}
                        </span>
                        <span className="text-sm text-gray-500 truncate">
                          {user?.email}
                        </span>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-md text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors font-medium"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-md text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors font-medium"
                      >
                        Orders
                      </Link>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsLogoutModalOpen(true);
                        }}
                        className="w-full text-left px-4 py-2.5 text-md text-red-600 hover:bg-red-50 transition-colors font-medium mt-1 border-t border-gray-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  title="Login / Profile"
                  className="hidden lg:block"
                >
                  <FiUser className=" text-2xl cursor-pointer hover:text-black" />
                </Link>
              )}

              <Link href="/cart" className="relative">
                <FiShoppingCart
                  className={`text-2xl cursor-pointer hover:text-black ${isCartActive && "text-cyan-500"}`}
                />
                {mounted && totalItems > 0 && (
                  <span className="absolute top-[-50%] right-[-50%] text-[11px] bg-red-500 font-bold text-white w-5 h-5 flex items-center justify-center rounded-full p-1">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>

            <button
              className="lg:hidden text-2xl"
              onClick={() => setShowMenu(true)}
            >
              <RxHamburgerMenu className="text-2xl" />
            </button>
          </div>
        </div>
      </header>

      {(showMenu || isClosing) && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => closeMenu()}
          />

          <div
            className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-xl p-6 flex flex-col gap-6 overflow-y-auto ${isClosing ? "animate-slideOut" : "animate-slideIn"}`}
          >
            <div className="flex justify-between items-center shrink-0">
              <Image src={"/logo.svg"} alt="logo" width={100} height={70} />
              <button className="text-2xl" onClick={() => closeMenu()}>
                <CgClose />
              </button>
            </div>

            {hasHydrated && user && (
              <div className="flex items-center gap-3 px-1 py-3 bg-gray-50 rounded-xl shrink-0 -mt-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base shrink-0">
                  {user?.first_name
                    ? user.first_name.charAt(0).toUpperCase()
                    : user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-gray-900 truncate">
                    {user?.first_name
                      ? `${user.first_name} ${user.last_name || ""}`
                      : user?.username || "My Account"}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </span>
                </div>
              </div>
            )}

            <nav className="flex flex-col gap-4 mt-0">
              {/* <form
                onSubmit={handleSearch}
                className="flex items-center bg-gray-100 rounded-lg px-4 py-2 border border-gray-200 mb-2"
              >
                <FiSearch className="text-gray-500 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="bg-transparent outline-none text-base w-full text-black placeholder:text-gray-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form> */}

              {pages.map((item) => {
                const Icon = item.icon;
                const activeLink =
                  item.href === "/"
                    ? pathName === "/" || pathName === ""
                    : pathName === item.href ||
                      pathName?.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      closeMenu();
                    }}
                    className={`flex items-center justify-between text-base py-2  border-b border-gray-100 last:border-0 ${
                      activeLink
                        ? "text-black font-medium"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {item.name}
                      {Icon && <Icon className="text-red-500/80 text-base" />}
                    </span>
                  </Link>
                );
              })}

              {hasHydrated && user ? (
                <>
                  <div className="my-2 border-t border-gray-100"></div>
                  <Link
                    href="/profile"
                    onClick={() => closeMenu()}
                    className="flex items-center gap-2 text-base py-2 text-gray-600 hover:text-black font-medium"
                  >
                    {/* <FiUser className="text-primary text-lg" /> */}
                    My Profile
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => closeMenu()}
                    className="flex items-center gap-2 text-base py-2 text-gray-600 hover:text-black font-medium"
                  >
                    {/* <FiBox className="text-primary text-lg" /> */}
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      closeMenu();
                      setIsLogoutModalOpen(true);
                    }}
                    className="flex items-center gap-2 text-base py-2 text-red-500 hover:text-red-700 font-medium w-full text-left"
                  >
                    <FiLogOut className="text-lg" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  {/* <div className="my-2 border-t border-gray-100"></div> */}
                  <Link
                    href="/login"
                    onClick={() => closeMenu()}
                    className="flex items-center gap-2 text-base py-2 text-gray-600 hover:text-black font-medium mt-1"
                  >
                    <FiUser className="text-primary text-lg" />
                    Sign In / Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsLogoutModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl transform transition-all">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-2 ring-8 ring-red-50/50">
                <FiLogOut className="text-2xl ml-1 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Sign Out</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Are you sure you want to sign out of your account? You will need
                to log back in to access your cart and orders.
              </p>
              <div className="flex items-center gap-3 w-full mt-4">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors focus:ring-4 focus:ring-gray-100 outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsLogoutModalOpen(false);
                    logout();
                    clearCart();
                    toast.success("Logout successful!");
                    router.push("/login");
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/80 transition-colors shadow-sm shadow-red-200 focus:ring-4 focus:ring-red-100 outline-none cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
