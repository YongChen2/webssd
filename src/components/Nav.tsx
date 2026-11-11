import { site } from "@/config/site";
import { BuyButton } from "./BuyButton";

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 md:top-6">
      <nav
        aria-label="Hlavní navigace"
        className="flex items-center gap-6 rounded-full bg-white/[0.04] py-1.5 pl-5 pr-1.5 ring-1 ring-white/10 backdrop-blur-xl md:gap-9 md:pl-6"
      >
        <a href="#top" className="text-[13px] font-medium tracking-[0.32em] text-white">
          {site.brand}
        </a>
        <ul className="hidden items-center gap-7 md:flex">
          {site.nav.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-[13px] text-white/55 transition-colors duration-500 ease-fluid hover:text-white"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <BuyButton small />
      </nav>
    </header>
  );
}
