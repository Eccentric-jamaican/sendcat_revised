import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-black pt-24 pb-12 px-4 md:px-8 border-t border-white/10">
      <div className="mx-auto max-w-7xl">
        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-16 gap-x-8 mb-32">
          {/* Column 1 */}
          <div className="space-y-16">
            <div className="space-y-6">
              <h3 className="text-zinc-500 font-medium">Shop</h3>
              <ul className="space-y-4">
                <li><Link href="#" className="text-white hover:text-zinc-300 transition-colors">eBay Search</Link></li>
                <li><Link href="#" className="text-white hover:text-zinc-300 transition-colors">Amazon (Coming Soon)</Link></li>
                <li><Link href="#" className="text-white hover:text-zinc-300 transition-colors">Walmart (Coming Soon)</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="text-zinc-500 font-medium">Account</h3>
              <ul className="space-y-4">
                <li><Link href="/sign-in" className="text-white hover:text-zinc-300 transition-colors">Sign In</Link></li>
                <li><Link href="/sign-up" className="text-white hover:text-zinc-300 transition-colors">Create Account</Link></li>
                <li><Link href="#" className="text-white hover:text-zinc-300 transition-colors">Track Order</Link></li>
              </ul>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-16">
            <div className="space-y-6">
              <h3 className="text-zinc-500 font-medium">Services</h3>
              <ul className="space-y-4">
                <li><Link href="#" className="text-white hover:text-zinc-300 transition-colors">Freight Forwarding</Link></li>
                <li><Link href="#" className="text-white hover:text-zinc-300 transition-colors">Assisted Purchase</Link></li>
                <li><Link href="#" className="text-white hover:text-zinc-300 transition-colors">Business Solutions</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="text-zinc-500 font-medium">Company</h3>
              <ul className="space-y-4">
                <li><Link href="#" className="text-white hover:text-zinc-300 transition-colors">About Us</Link></li>
                <li><Link href="#" className="text-white hover:text-zinc-300 transition-colors">Careers</Link></li>
                <li><Link href="#" className="text-white hover:text-zinc-300 transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          {/* Column 3 */}
          <div className="space-y-16">
            <div className="space-y-6">
              <h3 className="text-zinc-500 font-medium">Resources</h3>
              <ul className="space-y-4">
                <li><Link href="#" className="text-white hover:text-zinc-300 transition-colors">Help Center</Link></li>
                <li><Link href="#" className="text-white hover:text-zinc-300 transition-colors">Shipping Calculator</Link></li>
                <li><Link href="#" className="text-white hover:text-zinc-300 transition-colors">Customs Guide</Link></li>
                <li><Link href="#" className="text-white hover:text-zinc-300 transition-colors">Restricted Items</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="text-zinc-500 font-medium">Legal</h3>
              <ul className="space-y-4">
                <li><Link href="#" className="text-white hover:text-zinc-300 transition-colors">Terms & Conditions</Link></li>
                <li><Link href="#" className="text-white hover:text-zinc-300 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-white hover:text-zinc-300 transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Big Brand Text */}
        <div className="mb-12 overflow-hidden">
          <h1 className="text-[12vw] leading-none font-bold text-white select-none flex w-full justify-between">
            {"sendcat".split("").map((letter, i) => (
              <span 
                key={i} 
                className="inline-block animate-reveal" 
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {letter}
              </span>
            ))}
          </h1>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-sm text-zinc-500">
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">X (fka Twitter)</Link>
            <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
            <Link href="#" className="hover:text-white transition-colors">Instagram</Link>
          </div>
          <div>
            &copy; 2024 - 2025 SendCat Logistics Ltd.
          </div>
        </div>
      </div>
    </footer>
  );
}

