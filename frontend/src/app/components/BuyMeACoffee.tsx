/**
 * A small coffee-cup icon tab pinned to the right edge of the viewport.
 * Slides out slightly on hover. Takes zero layout space (position: fixed).
 */
export function BuyMeACoffeeTab() {
  return (
    <a
      href="https://buymeacoffee.com/udbetalt"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 group"
      aria-label="Buy me a coffee"
    >
      <span
        className="flex items-center justify-center w-9 h-9 rounded-l-lg shadow-lg transition-all duration-200 group-hover:w-10"
        style={{ background: "#FFDD00", color: "#000" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
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
      </span>
    </a>
  );
}
