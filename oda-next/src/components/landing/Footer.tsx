import Link from "next/link";

const productLinks = [
  { label: "AI Designer", href: "/designer" },
  { label: "Furniture Catalog", href: "/furniture" },
  { label: "Nearby Stores", href: "/stores" },
  { label: "Budget Planner", href: "/budget" },
  { label: "Projects Dashboard", href: "/dashboard" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Press Kit", href: "/press" },
  { label: "Contact", href: "/contact" },
];

const supportLinks = [
  { label: "Help Center", href: "/help" },
  { label: "Documentation", href: "/docs" },
  { label: "Community", href: "/community" },
  { label: "Status", href: "/status" },
  { label: "Feedback", href: "/feedback" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "GDPR", href: "/gdpr" },
  { label: "Licenses", href: "/licenses" },
];

export default function Footer() {
  return (
    <footer id="footer" className="bg-[#1C120C] border-t border-[#D8C3A5]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xl font-bold tracking-tight mb-4">
              <span className="text-[#F5EFE7]">Insight</span>
              <span className="text-[#C9A66B]">Nexsus</span>
            </Link>
            <p className="text-[#CDBFB2] text-sm leading-relaxed max-w-xs font-normal">
              AI-powered interior design. Upload your room, get a redesign, and
              shop real furniture — all in one place.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-[#F5EFE7] text-sm font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[#CDBFB2] hover:text-[#C9A66B] text-sm transition-colors duration-200 font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[#F5EFE7] text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[#CDBFB2] hover:text-[#C9A66B] text-sm transition-colors duration-200 font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[#F5EFE7] text-sm font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[#CDBFB2] hover:text-[#C9A66B] text-sm transition-colors duration-200 font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[#F5EFE7] text-sm font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[#CDBFB2] hover:text-[#C9A66B] text-sm transition-colors duration-200 font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#D8C3A5]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#CDBFB2]/80 text-xs">
            &copy; {new Date().getFullYear()} Insight Nexsus. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-[#CDBFB2]/80 hover:text-[#C9A66B] text-xs transition-colors duration-200">
              Privacy
            </Link>
            <Link href="/terms" className="text-[#CDBFB2]/80 hover:text-[#C9A66B] text-xs transition-colors duration-200">
              Terms
            </Link>
            <Link href="/cookies" className="text-[#CDBFB2]/80 hover:text-[#C9A66B] text-xs transition-colors duration-200">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
