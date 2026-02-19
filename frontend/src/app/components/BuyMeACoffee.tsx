/**
 * A small coffee-cup tab pinned to the right edge of the viewport.
 * Expands on hover to show a message. Takes zero layout space (position: fixed).
 */
export function BuyMeACoffeeTab() {
  return (
    <>
    <a
      href="https://buy.stripe.com/cNibJ0dF51Isbbn4Yu6c000"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 group hidden sm:flex"
      aria-label="Support lønklar.dk"
    >
      <span
        className="flex items-center gap-0 group-hover:gap-2 h-10 pl-2.5 pr-2.5 group-hover:pr-4 rounded-l-xl shadow-lg transition-all duration-300 ease-out overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FFDD00 0%, #FFB800 100%)",
          color: "#000",
        }}
      >
        {/* Steam lines animate on hover */}
        <span className="relative w-5 h-5 shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-300 group-hover:scale-110"
            aria-hidden="true"
          >
            <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
            <line x1="6" y1="2" x2="6" y2="4" className="origin-bottom group-hover:animate-[steam_0.8s_ease-in-out_infinite]" />
            <line x1="10" y1="2" x2="10" y2="4" className="origin-bottom group-hover:animate-[steam_0.8s_ease-in-out_infinite_0.15s]" />
            <line x1="14" y1="2" x2="14" y2="4" className="origin-bottom group-hover:animate-[steam_0.8s_ease-in-out_infinite_0.3s]" />
          </svg>
        </span>
        {/* Text slides in on hover */}
        <span className="whitespace-nowrap text-xs font-bold max-w-0 group-hover:max-w-[140px] overflow-hidden transition-all duration-300 ease-out opacity-0 group-hover:opacity-100">
          Support the project
        </span>
      </span>
    </a>

    {/* Mobile: small floating button bottom-right */}
    <a
      href="https://buy.stripe.com/cNibJ0dF51Isbbn4Yu6c000"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-4 bottom-4 z-40 flex sm:hidden items-center justify-center w-11 h-11 rounded-full shadow-lg active:scale-95 transition-transform"
      style={{
        background: "linear-gradient(135deg, #FFDD00 0%, #FFB800 100%)",
        color: "#000",
      }}
      aria-label="Support lønklar.dk"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
        <line x1="6" y1="2" x2="6" y2="4" />
        <line x1="10" y1="2" x2="10" y2="4" />
        <line x1="14" y1="2" x2="14" y2="4" />
      </svg>
    </a>
    </>
  );
}
