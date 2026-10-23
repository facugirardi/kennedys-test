import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import IconPhone from "../icon-phone"
import NavSearch from "./NavSearch"
import { useAuth } from "@/src/contexts/AuthContext"
import { useContact } from "@/src/contexts/ContactContext"
import { useNewsletter } from "@/src/contexts/NewsletterContext"
import { Mail, Menu, Newspaper, Search, UserCircle, X } from "lucide-react";

import { useAgentPortfolioSite } from "@/src/contexts/AgentPortfolioContext";
import {
  FOOTER_COMPANY_LINKS,
  FOOTER_EXPLORE_LINKS,
  FOOTER_SERVICE_LINKS,
} from "@/lib/footerNavLinks";
import { getMyOwnedProperties } from "@/lib/api/ownerReports";
import { resolveMediaUrl } from "@/lib/utils";

const MENU_COMPANY_LINKS = FOOTER_COMPANY_LINKS.filter(
  (item) => item.label !== "Login" && item.label !== "Sitemap"
);

interface NavbarProps {
  textBlack?: boolean;
  className?: string;
  pdfExport?: boolean;
  /** When true with pdfExport: no bar chrome (logo only) — used when embedding Navbar in special layouts. */
  pdfExportBare?: boolean;
  /** When true with pdfExport: use document flow instead of fixed — better for /pdf print and logo visibility. */
  pdfFlowLayout?: boolean;
  /** Reports the rendered height of the navbar (px) whenever it changes — used by pages that need to offset other fixed elements below it. */
  onHeightChange?: (height: number) => void;
  /** When true: the bar stays fixed at the top and, once the user scrolls past the hero, turns into a solid-white bar with dark text and a shadow. */
  stickyOnScroll?: boolean;
  /** Resting background classes for the sticky bar before the user scrolls (only used with stickyOnScroll). Defaults to a transparent overlay; pass e.g. "bg-white" for pages whose hero needs a solid bar from the start. */
  stickyRestBg?: string;
  /** When true: below `md` the bar sits in normal document flow (scrolls away with the page); from `md` up it stays fixed at the top as usual. Lets a page keep a lower sticky element (e.g. a section nav) pinned on mobile without the navbar stacking on top of it. */
  staticBelowMd?: boolean;
  /** Scrolls away with the page instead of staying fixed. 'flow' takes its own space above the content; 'overlay' sits on top of the first section (e.g. a hero) without pushing it down. */
  scrollsAway?: 'flow' | 'overlay';
}

const navLinkClass = (textBlack: boolean | undefined, active: boolean) =>
  `cursor-pointer ${textBlack ? "text-[#172338]" : "text-white"} ${active ? "font-medium" : "font-normal"}`;

/** Account menu trigger icon: the user's profile picture when they have one, else the generic person icon. */
const AccountAvatar: React.FC<{ profilePicture?: string | null; className: string }> = ({ profilePicture, className }) => {
  const url = resolveMediaUrl(profilePicture);
  if (!url) return <UserCircle className={className} strokeWidth={1.25} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="Account" className={`${className} rounded-full object-cover`} />
  );
};

const Navbar: React.FC<NavbarProps> = ({
  textBlack,
  className,
  pdfExport = false,
  pdfExportBare = false,
  pdfFlowLayout = false,
  onHeightChange,
  stickyOnScroll = false,
  stickyRestBg = "bg-transparent",
  staticBelowMd = false,
  scrollsAway,
}) => {
  const isAgentPortfolioSite = useAgentPortfolioSite();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { openContactForm } = useContact();
  const { openNewsletter } = useNewsletter();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hasOwnedProperties, setHasOwnedProperties] = useState(false);
  const accountMenuRefMobile = useRef<HTMLDivElement>(null);
  const accountMenuRefDesktop = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!onHeightChange) return;
    const el = sectionRef.current;
    if (!el) return;
    const report = () => onHeightChange(el.offsetHeight);
    report();
    const resizeObserver = new ResizeObserver(report);
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, [onHeightChange, mobileNavOpen]);

  const isVacationRentalsActive = router.pathname.includes("villas");
  const isConciergeActive = router.pathname.includes("concierge");
  const isEventsActive = router.pathname.includes("events");
  const isRealEstateActive =
    router.pathname.includes("real-estate") ||
    router.pathname.includes("sell-with-us");
  const isWeManagePropertyActive = router.pathname === "/we-manage-your-property";

  useEffect(() => {
    if (!isAuthenticated) setAccountMenuOpen(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!stickyOnScroll || pdfExport) return;
    const onScroll = () => {
      const y =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      setScrolled(y > 20);
    };
    onScroll();
    // capture:true en document para captar el scroll aunque venga de un contenedor anidado
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll, { capture: true } as any);
    };
  }, [stickyOnScroll, pdfExport]);

  const isStuck = stickyOnScroll && scrolled;
  const effectiveTextBlack = isStuck ? true : textBlack;

  useEffect(() => {
    setMobileNavOpen(false);
    setSearchOpen(false);
  }, [router.asPath]);

  useEffect(() => {
    if (mobileNavOpen) setAccountMenuOpen(false);
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen || pdfExport) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen, pdfExport]);

  useEffect(() => {
    if (!accountMenuOpen || !isAuthenticated) return;
    let removeListener: (() => void) | undefined;
    const timer = window.setTimeout(() => {
      const onDocPointerDown = (event: PointerEvent) => {
        const t = event.target as Node;
        if (accountMenuRefMobile.current?.contains(t)) return;
        if (accountMenuRefDesktop.current?.contains(t)) return;
        setAccountMenuOpen(false);
      };
      document.addEventListener("pointerdown", onDocPointerDown);
      removeListener = () =>
        document.removeEventListener("pointerdown", onDocPointerDown);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      removeListener?.();
    };
  }, [accountMenuOpen, isAuthenticated]);

  const onCardContainerClick = useCallback(() => {
    router.push("/real-estate");
  }, [router]);

  const onCardContainerClickEv = useCallback(() => {
    router.push("/events");
  }, [router]);

  const onCardContainerClick2 = useCallback(() => {
    router.push("/concierge");
  }, [router]);

  const onLogoClick = useCallback(() => {
    router.push("/");
  }, [router]);

  const onViewMoreTextClick = useCallback(() => {
    router.push("/villas");
  }, [router]);

  const onWeManagePropertyClick = useCallback(() => {
    router.push("/we-manage-your-property");
  }, [router]);

  const handleLogout = useCallback(() => {
    setAccountMenuOpen(false);
    void router.replace("/");
    logout();
  }, [logout, router]);

  const goToProfile = useCallback(() => {
    setAccountMenuOpen(false);
    router.push("/my-profile");
  }, [router]);

  const goToSaved = useCallback(() => {
    setAccountMenuOpen(false);
    router.push("/my-profile?tab=favorites");
  }, [router]);

  const goToReports = useCallback(() => {
    setAccountMenuOpen(false);
    router.push("/my-profile?tab=reports");
  }, [router]);

  // Determina si mostrar el link "Reports" en el menú de cuenta (solo owners con propiedades vinculadas)
  useEffect(() => {
    if (!isAuthenticated) {
      setHasOwnedProperties(false);
      return;
    }
    getMyOwnedProperties()
      .then((res: any) => setHasOwnedProperties(Array.isArray(res?.data) && res.data.length > 0))
      .catch(() => setHasOwnedProperties(false));
  }, [isAuthenticated]);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  const iconBtnClass = `inline-flex items-center justify-center rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-opacity hover:opacity-85 ${
    effectiveTextBlack
      ? "text-[#172338] focus:ring-[#172338] focus:ring-offset-white"
      : "text-white focus:ring-white focus:ring-offset-transparent"
  }`;

  const mobileNavBtnClass =
    "touch-manipulation text-left py-3 px-1 text-base font-haas border-b border-gray-100 text-[#172338] active:bg-gray-50";

  const desktopNavBtnClass =
    "touch-manipulation text-left py-2.5 px-1 text-[15px] font-haas font-light text-[#172338] active:bg-gray-50";

  const menuSectionLabelClass =
    "mb-2 mt-5 first:mt-1 text-[11px] font-normal uppercase tracking-[0.22em] text-[#172338]/55";

  const goMenuHref = useCallback(
    (href: string) => {
      closeMobileNav();
      void router.push(href);
    },
    [closeMobileNav, router]
  );

  const positionShell =
    pdfExport && pdfFlowLayout
      ? "relative w-full z-40 pb-2 md:pb-3"
      : scrollsAway === "flow"
        ? "pb-4 md:pb-6 relative z-50"
        : scrollsAway === "overlay"
          ? "pb-4 md:pb-6 absolute top-0 left-0 right-0 z-50"
      : stickyOnScroll
        ? `fixed top-0 left-0 right-0 z-50 ${isStuck ? "pb-0" : "pb-4 md:pb-6"}`
        : staticBelowMd
          ? "pb-4 md:pb-6 relative md:fixed md:top-0 md:left-0 md:right-0 z-50"
          : "pb-4 md:pb-6 fixed top-0 left-0 right-0 z-50";

  // Curva de easing suave (ease-out-expo) para la transición del navbar sticky
  const stickyTransition = stickyOnScroll && !pdfExport
    ? "transition-[background-color,color,box-shadow,padding,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[background-color,transform]"
    : "";

  if (isAgentPortfolioSite && !pdfExport) return null;

  return (
    <section
      ref={sectionRef}
      className={`${positionShell} flex flex-col overflow-visible ${
        pdfExport && pdfFlowLayout
          ? "w-full px-4 pt-2 pb-2 md:px-6 md:pt-2 md:pb-2"
          : isStuck
            ? "px-3 sm:px-4 md:px-12 pt-2 pb-2 md:pt-2 md:pb-3"
            : "px-3 sm:px-4 md:px-12 pt-3 md:pt-5"
      } ${
        pdfExport
          ? pdfExportBare
            ? "bg-transparent text-[#172338] border-0 shadow-none !pt-0 !pb-0 !mb-0 !px-0"
            : pdfFlowLayout
              ? "pdf-branded-header-bar mb-0 w-full bg-white text-[#172338] border-0 border-b-[3px] border-[#D99330] shadow-none"
              : "bg-white/95 text-[#172338] border-b-[3px] border-[#D99330] backdrop-blur-[2px] !pt-0.5 !pb-1 !mb-0 shadow-[0_1px_0_0_rgba(23,35,56,0.05)] md:!pt-1 md:!pb-1.5"
          : isStuck
            ? "border-t-[5px] border-primary text-black bg-white shadow-[0_8px_24px_-8px_rgba(23,35,56,0.18)]"
            : stickyOnScroll
              ? `border-t-[5px] border-primary ${stickyRestBg} shadow-[0_0_0_0_rgba(0,0,0,0)] ${textBlack ? "text-black" : "text-white"}`
              : `border-t-[5px] border-primary ${textBlack ? "text-black bg-white" : "text-white"}`
      } ${stickyOnScroll ? "" : className || ""} ${stickyTransition}`}
    >
      <header className={`flex flex-col w-full overflow-visible ${pdfExport ? 'gap-0' : 'gap-5'}`}>
        <div className={`flex flex-col w-full overflow-visible ${pdfExport ? 'gap-0' : 'gap-2'}`}>
          {!pdfExport && (
          <div className="hidden md:flex justify-end gap-5 px-6 mb-2">
            <div className="flex items-center gap-2">
              <IconPhone
                iconPhone="/images/icon--phone.svg"
                className={effectiveTextBlack ? "brightness-0" : ""}
              />
              <a
                className=""
                href="https://wa.me/306946455757"
                target="_blank"
                rel="noreferrer"
              >
                +30 694 645 5757
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail
                className={effectiveTextBlack ? "h-5 w-5 text-black" : "h-5 w-5 text-white"}
                strokeWidth={1.5}
              />
              <button type="button" className="" onClick={() => openContactForm()}>
                Contact
              </button>
            </div>
          </div>
          )}

          {pdfExport ? (
            <div
              className={`grid w-full grid-cols-1 items-center ${pdfFlowLayout && !pdfExportBare ? "justify-items-start" : "justify-start"}`}
            >
              <div
                className={`cursor-pointer justify-self-start ${pdfExportBare ? "" : "opacity-95"}`}
                onClick={onLogoClick}
              >
                {textBlack ? (
                  <img
                    loading="eager"
                    decoding="sync"
                    alt="Kennedys"
                    src="/images/capa-1-3.svg"
                    className={
                      pdfExportBare
                        ? "max-h-8 w-auto md:max-h-9"
                        : pdfFlowLayout
                          ? "h-6 w-auto max-h-[1.5rem] print:h-6 print:max-h-[1.5rem]"
                          : "max-h-7 w-auto md:max-h-8"
                    }
                  />
                ) : (
                  <img
                    loading="eager"
                    decoding="sync"
                    alt="Kennedys"
                    src="/images/capa-1.svg"
                    className={
                      pdfExportBare
                        ? "max-h-8 w-auto md:max-h-9"
                        : pdfFlowLayout
                          ? "h-6 w-auto max-h-[1.5rem] print:h-6 print:max-h-[1.5rem]"
                          : "max-h-7 w-auto md:max-h-8"
                    }
                  />
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex md:hidden items-center justify-between gap-2 w-full min-w-0 py-0.5">
                <button
                  type="button"
                  className={`touch-manipulation rounded-md p-2 -ml-2 ${effectiveTextBlack ? "text-[#172338]" : "text-white"}`}
                  aria-expanded={mobileNavOpen}
                  aria-controls="site-menu-nav"
                  aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
                  onClick={() => setMobileNavOpen((o) => !o)}
                >
                  {mobileNavOpen ? <X className="h-6 w-6" strokeWidth={1.75} /> : <Menu className="h-6 w-6" strokeWidth={1.75} />}
                </button>
                <div className="relative flex flex-1 justify-center min-w-0 px-1 cursor-pointer" onClick={onLogoClick}>
                  {stickyOnScroll ? (
                    <>
                      <img loading="lazy" alt="Kennedys" src="/images/capa-1.svg" className={`max-h-9 w-auto transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${effectiveTextBlack ? "opacity-0" : "opacity-100"}`} />
                      <img loading="lazy" alt="" aria-hidden src="/images/capa-1-3.svg" className={`absolute inset-0 m-auto max-h-9 w-auto transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${effectiveTextBlack ? "opacity-100" : "opacity-0"}`} />
                    </>
                  ) : effectiveTextBlack ? (
                    <img loading="lazy" alt="Kennedys" src="/images/capa-1-3.svg" className="max-h-9 w-auto" />
                  ) : (
                    <img loading="lazy" alt="Kennedys" src="/images/capa-1.svg" className="max-h-9 w-auto" />
                  )}
                </div>
                <div className="relative z-[60] flex shrink-0 items-center justify-end gap-1">
                  <button
                    type="button"
                    className={`touch-manipulation rounded-full p-2 ${effectiveTextBlack ? "text-[#172338]" : "text-white"}`}
                    aria-label="Search"
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search className="h-5 w-5" strokeWidth={1.75} />
                  </button>
                  {!isAuthenticated && (
                    <button
                      type="button"
                      className="touch-manipulation cursor-pointer rounded-full bg-[#D99330] px-4 py-2 font-light text-white transition-colors hover:bg-[#C8842A]"
                      onClick={() => router.push('/login')}
                    >
                      <span className="font-haas text-sm text-white">Log In</span>
                    </button>
                  )}
                  {isAuthenticated && (
                    <div className="relative shrink-0" ref={accountMenuRefMobile}>
                      <button
                        type="button"
                        className={iconBtnClass}
                        onClick={() => setAccountMenuOpen((o) => !o)}
                        aria-expanded={accountMenuOpen}
                        aria-haspopup="menu"
                        aria-label="Account menu"
                      >
                        <AccountAvatar profilePicture={user?.profilePicture} className="h-9 w-9" />
                      </button>
                      {accountMenuOpen && (
                        <div
                          className="fixed left-3 right-3 top-[4.5rem] z-[9999] min-w-0 border border-gray-200 bg-white py-2 text-left md:hidden"
                          role="menu"
                        >
                          <p className="truncate border-b border-gray-100 px-4 py-2 text-xs text-gray-500">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <button type="button" role="menuitem" className="block w-full px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-50 sm:py-2.5" onClick={goToProfile}>
                            My profile
                          </button>
                          <button type="button" role="menuitem" className="block w-full px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-50 sm:py-2.5" onClick={goToSaved}>
                            Saved
                          </button>
                          {hasOwnedProperties && (
                            <button type="button" role="menuitem" className="block w-full px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-50 sm:py-2.5" onClick={goToReports}>
                              Reports
                            </button>
                          )}
                          <button type="button" role="menuitem" className="block w-full px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-50 sm:py-2.5" onClick={handleLogout}>
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:items-center w-full overflow-visible">
                <div className="flex min-w-0 items-center">
                  <nav className="flex flex-wrap gap-x-2 gap-y-1 text-sm md:gap-5 md:text-base" aria-label="Primary">
                    <button
                      type="button"
                      className={navLinkClass(effectiveTextBlack, isVacationRentalsActive)}
                      aria-current={isVacationRentalsActive ? "page" : undefined}
                      onClick={onViewMoreTextClick}
                    >
                      <span>Vacation Rentals</span>
                    </button>
                    <button
                      type="button"
                      className={navLinkClass(effectiveTextBlack, isConciergeActive)}
                      aria-current={isConciergeActive ? "page" : undefined}
                      onClick={onCardContainerClick2}
                    >
                      Concierge
                    </button>
                    <button
                      type="button"
                      className={navLinkClass(effectiveTextBlack, isEventsActive)}
                      aria-current={isEventsActive ? "page" : undefined}
                      onClick={onCardContainerClickEv}
                    >
                      Events
                    </button>
                    <button
                      type="button"
                      className={navLinkClass(effectiveTextBlack, isRealEstateActive)}
                      aria-current={isRealEstateActive ? "page" : undefined}
                      onClick={onCardContainerClick}
                    >
                      Real Estate
                    </button>
                  </nav>
                </div>

                <div className="relative cursor-pointer justify-self-center" onClick={onLogoClick}>
                  {stickyOnScroll ? (
                    <>
                      <img loading="lazy" alt="Kennedys" src="/images/capa-1.svg" className={`transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${effectiveTextBlack ? "opacity-0" : "opacity-100"}`} />
                      <img loading="lazy" alt="" aria-hidden src="/images/capa-1-3.svg" className={`absolute inset-0 transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${effectiveTextBlack ? "opacity-100" : "opacity-0"}`} />
                    </>
                  ) : effectiveTextBlack ? (
                    <img loading="lazy" alt="Kennedys" src="/images/capa-1-3.svg" />
                  ) : (
                    <img loading="lazy" alt="Kennedys" src="/images/capa-1.svg" />
                  )}
                </div>

                <div className="relative z-[60] flex flex-wrap items-center justify-end justify-self-end gap-3 md:gap-5 overflow-visible">
                  <button
                    type="button"
                    className={iconBtnClass}
                    aria-label="Search"
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search className="h-5 w-5" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    className={`cursor-pointer border-0 bg-transparent p-0 font-haas underline decoration-current decoration-[0.5px] underline-offset-4 whitespace-nowrap font-thin ${effectiveTextBlack ? "text-[#172338]" : "text-white"}`}
                    aria-current={isWeManagePropertyActive ? "page" : undefined}
                    onClick={onWeManagePropertyClick}
                  >
                    We Manage Your Property
                  </button>
                  {!isAuthenticated && (
                    <button
                      type="button"
                      className="cursor-pointer rounded-full bg-[#D99330] px-6 py-1 font-light transition-colors hover:bg-[#C8842A]"
                      onClick={() => router.push('/login')}
                    >
                      <span className="font-haas text-white">Log In</span>
                    </button>
                  )}
                  {isAuthenticated && (
                    <div className="relative shrink-0" ref={accountMenuRefDesktop}>
                      <button
                        type="button"
                        className={iconBtnClass}
                        onClick={() => setAccountMenuOpen((o) => !o)}
                        aria-expanded={accountMenuOpen}
                        aria-haspopup="menu"
                        aria-label="Account menu"
                      >
                        <AccountAvatar profilePicture={user?.profilePicture} className="h-9 w-9 md:h-10 md:w-10" />
                      </button>
                      {accountMenuOpen && (
                        <div
                          className="absolute right-0 top-full z-[9999] mt-2 min-w-[220px] border border-gray-300 bg-white py-2 text-left"
                          role="menu"
                        >
                          <p className="truncate border-b border-gray-300 px-4 py-2 text-xs text-gray-500">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <button type="button" role="menuitem" className="block w-full px-4 py-2.5 text-left text-sm text-gray-800 hover:bg-gray-50" onClick={goToProfile}>
                            My profile
                          </button>
                          <button type="button" role="menuitem" className="block w-full px-4 py-2.5 text-left text-sm text-gray-800 hover:bg-gray-50" onClick={goToSaved}>
                            Saved
                          </button>
                          {hasOwnedProperties && (
                            <button type="button" role="menuitem" className="block w-full px-4 py-2.5 text-left text-sm text-gray-800 hover:bg-gray-50" onClick={goToReports}>
                              Reports
                            </button>
                          )}
                          <button type="button" role="menuitem" className="block w-full px-4 py-2.5 text-left text-sm text-gray-800 hover:bg-gray-50" onClick={handleLogout}>
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    className={`touch-manipulation shrink-0 rounded-md p-2 -mr-2 ${effectiveTextBlack ? "text-[#172338]" : "text-white"}`}
                    aria-expanded={mobileNavOpen}
                    aria-controls="site-menu-nav"
                    aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
                    onClick={() => setMobileNavOpen((o) => !o)}
                  >
                    {mobileNavOpen ? <X className="h-6 w-6" strokeWidth={1.75} /> : <Menu className="h-6 w-6" strokeWidth={1.75} />}
                  </button>
                </div>
              </div>

              {mobileNavOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-[65] bg-black/40"
                    aria-label="Close menu"
                    onClick={closeMobileNav}
                  />
                  {/* Mobile: layout original + About Us / We are on the News */}
                  <div
                    id="site-menu-nav"
                    className="fixed left-0 top-0 z-[70] flex h-[100dvh] w-[min(100%,20rem)] flex-col bg-white shadow-xl md:hidden"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
                      <span className="font-haas text-lg font-medium text-[#172338]">Menu</span>
                      <button type="button" className="touch-manipulation rounded-md p-2 text-[#172338]" aria-label="Close menu" onClick={closeMobileNav}>
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    <nav className="flex flex-1 flex-col overflow-y-auto px-4 pb-6" aria-label="Mobile primary">
                      <button type="button" className={mobileNavBtnClass} onClick={() => { closeMobileNav(); onViewMoreTextClick(); }}>
                        Vacation Rentals
                      </button>
                      <button type="button" className={mobileNavBtnClass} onClick={() => { closeMobileNav(); onCardContainerClick2(); }}>
                        Concierge
                      </button>
                      <button type="button" className={mobileNavBtnClass} onClick={() => { closeMobileNav(); onCardContainerClickEv(); }}>
                        Events
                      </button>
                      <button type="button" className={mobileNavBtnClass} onClick={() => { closeMobileNav(); onCardContainerClick(); }}>
                        Real Estate
                      </button>
                      {MENU_COMPANY_LINKS.map((item) => (
                        <button
                          key={item.href}
                          type="button"
                          className={mobileNavBtnClass}
                          onClick={() => goMenuHref(item.href)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </nav>
                    <div className="border-t border-gray-100 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-[#172338]">
                      <button
                        type="button"
                        className={`mb-3 w-full text-left font-haas text-sm underline underline-offset-4 ${isWeManagePropertyActive ? "font-medium" : "font-light"}`}
                        onClick={() => { closeMobileNav(); onWeManagePropertyClick(); }}
                      >
                        We Manage Your Property
                      </button>
                      <a className="mb-3 flex items-center gap-2 py-2 text-sm" href="https://wa.me/306946455757" target="_blank" rel="noreferrer">
                        <IconPhone iconPhone="/images/icon--phone.svg" className="brightness-0" />
                        +30 694 645 5757
                      </a>
                      <button type="button" className="mb-3 flex items-center gap-2 py-2 text-sm" onClick={() => { closeMobileNav(); openContactForm(); }}>
                        <Mail className="h-5 w-5 text-[#172338]" strokeWidth={1.5} />
                        Contact
                      </button>
                      <button type="button" className="flex items-center gap-2 py-2 text-sm" onClick={() => { closeMobileNav(); openNewsletter(); }}>
                        <Newspaper className="h-5 w-5 text-[#172338]" strokeWidth={1.5} />
                        Newsletter
                      </button>
                    </div>
                  </div>

                  {/* Desktop: menú ampliado desde la derecha */}
                  <div className="fixed right-0 top-0 z-[70] hidden h-[100dvh] w-[min(100%,22rem)] flex-col bg-white shadow-xl md:flex">
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
                      <span className="font-haas text-lg font-medium text-[#172338]">Menu</span>
                      <button type="button" className="touch-manipulation rounded-md p-2 text-[#172338]" aria-label="Close menu" onClick={closeMobileNav}>
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    <nav className="flex flex-1 flex-col overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]" aria-label="Site menu">
                      <p className={menuSectionLabelClass}>Explore</p>
                      {FOOTER_EXPLORE_LINKS.map((item) => (
                        <button key={item.href} type="button" className={desktopNavBtnClass} onClick={() => goMenuHref(item.href)}>
                          {item.label}
                        </button>
                      ))}

                      <p className={menuSectionLabelClass}>Services</p>
                      {FOOTER_SERVICE_LINKS.map((item) => (
                        <button key={item.href} type="button" className={desktopNavBtnClass} onClick={() => goMenuHref(item.href)}>
                          {item.label}
                        </button>
                      ))}

                      <p className={menuSectionLabelClass}>Company</p>
                      {MENU_COMPANY_LINKS.map((item) => (
                        <button key={item.href} type="button" className={desktopNavBtnClass} onClick={() => goMenuHref(item.href)}>
                          {item.label}
                        </button>
                      ))}
                      <button type="button" className={desktopNavBtnClass} onClick={() => { closeMobileNav(); openContactForm(); }}>
                        Contact
                      </button>
                      <button type="button" className={desktopNavBtnClass} onClick={() => { closeMobileNav(); openNewsletter(); }}>
                        Newsletter
                      </button>
                      <a className={desktopNavBtnClass} href="https://wa.me/306946455757" target="_blank" rel="noreferrer">
                        +30 694 645 5757
                      </a>
                    </nav>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </header>

      {searchOpen && <NavSearch onClose={() => setSearchOpen(false)} />}
    </section>
  );
};

export default Navbar;
