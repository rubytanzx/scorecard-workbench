
import { useState, useRef, useEffect } from "react";
import { IconChevronDown, IconLogout, IconSettings, IconLogin, IconPencil } from "@tabler/icons-react";
import { useViewMode } from "@/contexts/ViewModeContext";

const SCORECARD_DATA_ITEMS = [
  { id: "outcomes",  label: "Outcomes" },
  { id: "data",      label: "Data"     },
  { id: "targets",   label: "Targets"  },
];

const NAV_TABS = [
  { id: "for-you",       label: "For You"       },
  { id: "scorecard-data",label: "Scorecard Data", hasDropdown: true },
  { id: "about",         label: "About"         },
  { id: "api",           label: "API"           },
] as const;

interface Props {
  workspaceCount?: number;
  onOpenWorkspace?: () => void;
  /** True once the page has scrolled — transitions nav from transparent to frosted solid. */
  scrolled?: boolean;
  /** When set, replaces "Scorecard Workbench" with an editable narrative title. */
  narrativeTitle?: string;
  onNarrativeTitleChange?: (title: string) => void;
  onLogoClick?: () => void;
}

function WBGLogo() {
  // Same paths as before; both fills swapped to white so the logo reads
  // on the dark nav surface.
  return (
    <svg width="159" height="32" viewBox="0 0 159 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="The World Bank Group">
      <path d="M35.3625 11.119H43.2914V12.7444H40.381V20.9019H38.2781V12.7444H35.3625V11.119ZM46.5067 20.9019V16.6047H50.2298V20.9019H52.3327V11.119H50.2045V14.9793H46.5067V11.119H44.4038V20.9019H46.5067ZM54.0394 20.9019H60.7492V19.2765H56.1422V16.6606H60.3175V15.0352H56.1422V12.7444H60.6019V11.119H54.0394V20.9019ZM69.1403 18.479H69.1149L67.6114 11.119H65.4425L67.8298 20.9019H70.2121L72.1118 13.4504H72.1372L73.8997 20.9019H76.226L78.72 11.119H76.7137L75.1391 18.479H75.1137L73.407 11.119H71.04L69.1403 18.479ZM79.4311 16.0155C79.4311 18.9006 80.894 21.1101 84.1346 21.1101C87.3702 21.1101 88.8381 18.9057 88.8381 16.0155C88.8381 13.1304 87.3752 10.9209 84.1346 10.9209C80.894 10.9158 79.4311 13.1254 79.4311 16.0155ZM81.666 16.0155C81.666 14.3342 82.0622 12.4346 84.1346 12.4346C86.207 12.4346 86.6032 14.3342 86.6032 16.0155C86.6032 17.6917 86.207 19.5914 84.1346 19.5914C82.0622 19.5914 81.666 17.6917 81.666 16.0155ZM92.3225 16.9603H94.5473C95.2381 16.9857 95.3702 17.7323 95.426 18.2758C95.5175 19.1596 95.614 20.0384 95.7918 20.9019H98.1079C97.7168 20.3584 97.6356 19.2104 97.5391 18.5857C97.3613 17.2295 97.3613 16.239 95.7511 16.0663V16.0409C96.96 15.7869 97.7829 14.9438 97.7829 13.6688C97.7829 11.6777 96.061 11.1342 94.3797 11.119H90.2197V20.9019H92.3225V16.9603ZM92.3225 12.7444H94.08C95.0045 12.7596 95.5429 13.1254 95.5429 13.9888C95.5429 14.8574 94.9994 15.3146 94.08 15.3298H92.3225V12.7444ZM105.727 20.9019V19.2765H101.486V11.119H99.3879V20.9019H105.727ZM106.865 20.9019H110.197C113.244 20.9273 115.144 19.4136 115.144 16.0104C115.144 12.6073 113.244 11.0885 110.197 11.119H106.865V20.9019ZM108.968 12.7444H110.055C112.549 12.719 112.914 14.4511 112.914 16.0104C112.914 17.5647 112.549 19.3019 110.055 19.2765H108.968V12.7444ZM124.165 20.9019C125.669 21.0085 128.107 20.3076 128.107 18.3673C128.107 16.9349 127.187 16.0815 125.953 15.8225V15.7971C126.928 15.472 127.675 14.7254 127.675 13.6587C127.675 11.7488 125.887 11.0174 124.14 11.1241H120.467V20.9069H124.165V20.9019ZM122.56 19.2765V16.6758H124.201C125.191 16.6758 125.867 16.8536 125.867 17.9761C125.867 19.1038 125.191 19.2765 124.201 19.2765H122.56ZM122.56 15.0504V12.7444H124.201C125.079 12.7444 125.567 13.1101 125.567 13.8974C125.567 14.6847 125.079 15.0504 124.201 15.0504H122.56ZM130.763 20.9019L131.495 18.8295H135.37L136.076 20.9019H138.189L134.791 11.119H132.297L128.757 20.9019H130.763ZM132.038 17.2041L133.47 13.0288H133.501L134.842 17.2041H132.038ZM148.099 20.9019V11.119H146.133V18.7888L146.108 18.8193L142.38 11.1241H139.266V20.9069H141.232V12.8003L141.257 12.7698L145.117 20.9019H148.099ZM151.924 11.119H149.826V20.9019H151.924V15.9139H151.949L155.352 20.9019H157.968L154.067 15.4974L157.658 11.119H155.205L151.954 15.3501H151.929V11.119H151.924Z" fill="#FFFFFF"/>
      <path d="M29.7142 9.50361C29.3434 9.66107 29.1707 10.0877 29.3282 10.4585C30.0698 12.2109 30.4456 14.0801 30.4456 16.0001C30.4456 17.1785 30.2983 18.3214 30.0241 19.4185C29.8107 20.1093 29.4298 20.7493 28.9066 21.3284C28.9168 21.0795 28.9269 20.8306 28.9269 20.5766C28.932 17.7728 28.1599 14.8166 26.7225 12.0331C27.7739 11.129 28.4444 10.0116 28.678 8.76203C28.7491 8.36584 28.4901 7.98488 28.0939 7.90869C27.6977 7.8325 27.3168 8.09663 27.2456 8.49282C27.0933 9.32076 26.6615 10.0776 25.991 10.7227C25.7828 10.3773 25.5644 10.0369 25.3358 9.69663C24.0558 7.81726 22.532 6.19187 20.866 4.89663C23.0653 5.03885 25.0971 5.57726 26.7377 6.49155C26.9968 6.63885 27.3371 6.63377 27.5758 6.4306C27.8857 6.17155 27.9263 5.70933 27.6672 5.39949C25.3155 2.11314 21.2469 0.299805 16.2082 0.299805C7.55295 0.299805 0.507874 7.34488 0.507874 16.0001C0.507874 17.4935 0.721207 18.936 1.11232 20.3023C1.13771 20.3938 1.15803 20.4852 1.18343 20.5766C1.18851 20.5969 1.19867 20.6122 1.20375 20.6274C3.1847 27.0274 9.15803 31.6954 16.2031 31.6954C19.4641 31.6954 22.4914 30.6947 25.0056 28.9881C25.031 28.9728 25.0564 28.9627 25.0768 28.9474C25.2291 28.8458 25.3714 28.7392 25.5136 28.6274C28.3987 26.4941 30.5371 23.3957 31.431 19.8096C31.4818 19.6471 31.5276 19.4744 31.5631 19.3068C31.5733 19.2662 31.5733 19.2255 31.5783 19.1849C31.7917 18.1538 31.9034 17.0871 31.9034 15.995C31.9034 13.8769 31.4869 11.8198 30.6691 9.88457C30.5168 9.51885 30.085 9.34615 29.7142 9.50361ZM24.132 10.5246C24.3707 10.8801 24.5993 11.2357 24.8177 11.6014C23.6495 12.2769 22.1764 12.6782 20.5815 12.795C20.4444 10.2757 20.1498 7.84774 19.6723 5.83123C21.3333 7.06552 22.8571 8.66044 24.132 10.5246ZM21.9631 2.79377C22.6945 3.08838 23.4209 3.46425 24.1117 3.93663C23.0095 3.66234 21.8361 3.49473 20.6171 3.43377C21.1149 3.10869 21.5771 2.8852 21.9631 2.79377ZM20.033 2.18933C19.6266 2.40774 19.205 2.68203 18.7783 3.00711C18.5853 2.57536 18.3822 2.19441 18.1637 1.86933C18.7479 1.93536 19.3777 2.03695 20.033 2.18933ZM13.0895 12.8509C14.1358 13.3233 15.2787 13.6941 16.4774 13.9531C17.3866 14.1462 18.2907 14.2528 19.1847 14.2833C19.1999 14.8319 19.2101 15.3957 19.2101 15.9747C19.2101 19.4135 18.9358 22.2681 18.5396 24.4979C17.2342 24.442 15.8882 24.2693 14.5371 23.9849C12.7288 23.5938 11.0222 23.0249 9.47295 22.2935C9.98089 20.0077 10.9257 17.2344 12.4291 14.1614C12.6374 13.7144 12.8609 13.2776 13.0895 12.8509ZM10.5396 9.47822C9.93517 8.90933 9.47803 8.3252 9.16819 7.73092C10.5345 6.90806 12.0482 6.23758 13.6634 5.74996C14.6234 5.46044 15.5936 5.24711 16.5637 5.0998C15.1618 6.66425 13.7701 8.65536 12.4901 10.9055C11.7587 10.4839 11.1034 10.0065 10.5396 9.47822ZM19.1237 12.8154C18.3517 12.7849 17.5593 12.6884 16.7822 12.5208C15.7257 12.2973 14.7199 11.9722 13.7955 11.5658C15.1568 9.18361 16.6501 7.11123 18.118 5.56711C18.5752 7.37536 18.9612 9.8033 19.1237 12.8154ZM16.1879 1.76266C16.4368 1.76774 16.7415 2.06234 17.0615 2.64139C16.899 2.57028 16.7364 2.50425 16.5739 2.4433C15.9136 2.18933 15.2583 1.99631 14.6133 1.85409C15.1314 1.79314 15.6545 1.76266 16.1879 1.76266ZM8.76692 5.35377C8.92946 4.59695 9.3866 3.92139 10.0876 3.35758C11.7891 2.84965 13.7752 2.97155 15.8577 3.73346C14.9841 3.88584 14.1053 4.08901 13.2368 4.34806C11.6266 4.8306 10.1079 5.49092 8.71613 6.29853C8.69073 5.97853 8.70597 5.66361 8.76692 5.35377ZM7.40057 4.82552C7.38025 4.90171 7.35994 4.97282 7.3447 5.05409C7.1974 5.74488 7.21264 6.44584 7.38533 7.14679C5.81581 8.22869 4.44946 9.51377 3.3574 10.9512C3.02724 11.3881 2.73264 11.835 2.46343 12.2871C3.27105 9.29536 5.03359 6.69472 7.40057 4.82552ZM7.63422 27.3576C5.19613 25.5138 3.37771 22.9081 2.51422 19.896C2.39232 19.4185 2.31105 18.936 2.28057 18.4484C2.76819 19.1392 3.36248 19.8198 4.06851 20.475C5.13517 21.4604 6.40502 22.3442 7.81708 23.1011C7.53264 24.7163 7.45137 26.1792 7.63422 27.3576ZM5.06406 19.3982C3.8247 18.2503 2.97137 17.0414 2.53454 15.8325C2.87994 14.4814 3.54533 13.1252 4.52565 11.83C5.45517 10.5957 6.61327 9.48838 7.94406 8.53345C8.32502 9.22425 8.86343 9.8998 9.54406 10.5398C10.1942 11.1493 10.946 11.6979 11.7891 12.1804C11.5555 12.6173 11.332 13.0642 11.1136 13.5163C9.81835 16.1728 8.76184 19.0173 8.13708 21.6027C6.98406 20.9576 5.94279 20.216 5.06406 19.3982ZM16.2183 30.2274C16.1828 30.2274 16.1472 30.2325 16.1168 30.2376C13.9428 30.2223 11.8857 29.7246 10.0418 28.8357C10.0012 28.8001 9.95041 28.7696 9.89962 28.7442C9.08692 28.3481 8.76184 26.5398 9.18343 23.7766C10.7428 24.4776 12.4393 25.0312 14.2222 25.4122C15.5733 25.7017 16.9193 25.8795 18.2399 25.9455C17.5949 28.7544 16.7669 30.2274 16.2183 30.2274ZM24.6298 27.4693C22.8114 28.8103 20.6628 29.7296 18.3314 30.0801C18.9155 29.0693 19.3879 27.6471 19.7434 25.976C21.8056 25.9506 23.7612 25.6509 25.4933 25.0668C25.9301 24.9195 26.3415 24.7569 26.7377 24.5792C26.2603 25.7576 25.5542 26.7379 24.6298 27.4693ZM27.2914 22.6439C26.6361 23.0452 25.8844 23.3957 25.031 23.6801C23.5225 24.1881 21.826 24.4623 20.0228 24.5081C20.4545 21.9125 20.6628 18.9004 20.6628 15.9696C20.6628 15.4008 20.6577 14.8268 20.6374 14.2579C22.4558 14.136 24.1371 13.6636 25.5136 12.8712C26.7885 15.3957 27.4742 18.0573 27.4691 20.5665C27.4691 21.2979 27.4082 21.9938 27.2914 22.6439Z" fill="#FFFFFF"/>
    </svg>
  );
}

export default function AppHeader({ workspaceCount = 0, onOpenWorkspace, scrolled = false, narrativeTitle, onNarrativeTitleChange, onLogoClick }: Props) {
  const { isInternal, signOut, signIn } = useViewMode();
  const [activeTab, setActiveTab] = useState("for-you");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [titleEditing, setTitleEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close nav dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [dropdownOpen]);

  // Close profile menu on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handle = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [profileOpen]);

  const startTitleEdit = () => {
    setTitleDraft(narrativeTitle ?? "");
    setTitleEditing(true);
    setTimeout(() => titleInputRef.current?.select(), 0);
  };

  const commitTitleEdit = () => {
    const trimmed = titleDraft.trim();
    if (trimmed) onNarrativeTitleChange?.(trimmed);
    setTitleEditing(false);
  };

  return (
    <header
      className="sticky top-0 z-50 w-full h-[72px] relative"
      style={{
        background: scrolled ? "rgba(17,37,49,0.90)" : "transparent",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(18px)" : "none",
        transition: "background 420ms ease, backdrop-filter 420ms ease",
      }}
    >
      {/* Gradient divider — horizontal glow, sharpens when scrolled */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "1px",
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 20%, rgba(100,210,235,0.22) 50%, rgba(255,255,255,0.08) 80%, transparent 100%)",
          opacity: scrolled ? 1 : 0.35,
          transition: "opacity 420ms ease",
          pointerEvents: "none",
        }}
      />
      <div className="max-w-[1440px] mx-auto px-[24px] h-[72px] grid grid-cols-[1fr_auto_1fr] items-end gap-4">
        {/* Brand */}
        <div className="justify-self-start self-center flex items-center gap-3 shrink-0">
          <button
            onClick={onLogoClick}
            className="flex items-center shrink-0 bg-transparent border-none cursor-pointer p-0"
            aria-label="Go to home"
          >
            <WBGLogo />
          </button>
          {!narrativeTitle && (
            <>
              <div className="w-px h-4 bg-white/30" />
              <span className="text-[13px] font-semibold text-white tracking-tight">Scorecard Workbench</span>
            </>
          )}
        </div>

        {/* Center: editable narrative title OR nav tabs */}
        {narrativeTitle ? (
          <div className="justify-self-center self-center">
            {titleEditing ? (
              <input
                ref={titleInputRef}
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={commitTitleEdit}
                onKeyDown={(e) => { if (e.key === "Enter") commitTitleEdit(); if (e.key === "Escape") setTitleEditing(false); }}
                autoFocus
                className="bg-transparent text-[15px] font-semibold text-white tracking-tight outline-none border-b border-white/40 focus:border-white/70 text-center"
                style={{ minWidth: 120, maxWidth: 480 }}
              />
            ) : (
              <button
                onClick={startTitleEdit}
                title="Click to rename"
                className="group flex items-center gap-2 text-[15px] font-semibold text-white tracking-tight hover:text-white/90 transition-colors"
              >
                <span className="border-b border-transparent group-hover:border-white/30 transition-colors">{narrativeTitle}</span>
                <IconPencil size={12} className="opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
              </button>
            )}
          </div>
        ) : (
        <nav className="justify-self-center flex items-end gap-1" aria-label="Main navigation">
          {NAV_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const isDropdown = "hasDropdown" in tab;

            if (isDropdown) {
              return (
                <div key={tab.id} ref={dropdownRef} className="relative">
                  <button
                    onClick={() => { setActiveTab(tab.id); setDropdownOpen((v) => !v); }}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="menu"
                    className={`
                      relative flex items-center gap-1 px-4 h-[72px] text-[16px] font-semibold leading-[140%] whitespace-nowrap transition-colors
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60
                      ${isActive ? "text-white" : "text-white/70 hover:text-white"}
                    `}
                  >
                    {tab.label}
                    <IconChevronDown
                      size={12}
                      className={`opacity-70 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                    />
                    <span className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-all duration-300 ${isActive ? "bg-white opacity-100" : "opacity-0"}`} />
                  </button>

                  {dropdownOpen && (
                    <div
                      role="menu"
                      className="absolute top-[calc(100%+4px)] left-0 min-w-[160px] py-1.5 rounded-xl overflow-hidden"
                      style={{
                        background: "rgba(14,28,42,0.96)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
                      }}
                    >
                      {SCORECARD_DATA_ITEMS.map((item) => (
                        <button
                          key={item.id}
                          role="menuitem"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full flex items-center px-4 py-2.5 text-[14px] text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setDropdownOpen(false); }}
                className={`
                  relative flex items-center gap-1 px-4 h-[72px] text-[16px] font-semibold leading-[140%] whitespace-nowrap transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60
                  ${isActive ? "text-white" : "text-white/70 hover:text-white"}
                `}
              >
                {tab.label}
                <span className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-all duration-300 ${isActive ? "bg-white opacity-100" : "opacity-0"}`} />
              </button>
            );
          })}
        </nav>
        )}

        {/* User profile / Sign In */}
        {isInternal ? (
          <div ref={profileRef} className="justify-self-end self-center relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              aria-label="User menu"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              className="w-9 h-9 rounded-full bg-[#0288D1] flex items-center justify-center text-white text-[13px] font-bold tracking-wide hover:ring-2 hover:ring-white/30 transition-all"
            >
              JD
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="absolute top-[calc(100%+8px)] right-0 w-[220px] rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(14,28,42,0.97)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)",
                }}
              >
                {/* User info */}
                <div className="px-4 pt-4 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#0288D1] flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                      JD
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-semibold text-white truncate">Jane Doe</p>
                      <p className="text-[11.5px] text-white/50 truncate">ITSEF</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                  <button
                    role="menuitem"
                    onClick={() => { setProfileOpen(false); onOpenWorkspace?.(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13.5px] text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
                  >
                    My Workspace
                    {workspaceCount > 0 && (
                      <span className="ml-auto text-[11px] font-medium text-white/40">{workspaceCount}</span>
                    )}
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13.5px] text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
                  >
                    <IconSettings size={15} className="text-white/40 shrink-0" aria-hidden="true" />
                    Settings
                  </button>
                </div>

                {/* Divider + Sign out */}
                <div className="border-t border-white/10 py-1.5">
                  <button
                    role="menuitem"
                    onClick={() => { setProfileOpen(false); signOut(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13.5px] text-white/60 hover:text-white hover:bg-white/10 transition-colors text-left"
                  >
                    <IconLogout size={15} className="text-white/40 shrink-0" aria-hidden="true" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={signIn}
            aria-label="Sign in"
            className="justify-self-end self-center flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13px] font-semibold text-white/80 hover:text-white border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all"
          >
            <IconLogin size={14} className="text-white/50 shrink-0" aria-hidden="true" />
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
