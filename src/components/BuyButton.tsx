export function BuyButton({ small = false, href = "#modely" }: { small?: boolean; href?: string }) {
  return (
    <a
      href={href}
      data-magnetic
      data-tick
      className={`group inline-flex items-center rounded-full bg-white font-medium text-black transition-transform duration-500 ease-fluid active:scale-[0.97] ${
        small ? "gap-2 py-1 pl-4 pr-1 text-[13px]" : "gap-3 py-1.5 pl-6 pr-1.5 text-[15px]"
      }`}
    >
      Koupit
      <span
        className={`grid place-items-center rounded-full bg-accent text-white transition-transform duration-500 ease-fluid group-hover:translate-x-0.5 group-hover:scale-105 ${
          small ? "h-7 w-7" : "h-9 w-9"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M2.5 7h9M7.5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  );
}
