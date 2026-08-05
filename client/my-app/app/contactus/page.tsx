import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock, Heart, Mail, MapPin, MessageSquare, Phone, Sparkles } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import ContactForm from "./ContactForm";

const FONT_HEADING = "'Quicksand', sans-serif";
const FONT_BODY = "'Quicksand', sans-serif";

const ADDRESS = "150 ft Road, A Block Commercial Market A81, G Magnolia, Gujranwala, Pakistan";
const PHONE = "+923222227004";
const EMAIL = "Justkidin5@gmail.com";
const GOOGLE_MAPS_LOCATION = "https://maps.app.goo.gl/gcwSCYaQ3Fg9Cz6T6?g_st=aw";
const EMAIL_COMPOSE_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(EMAIL)}`;

const mapsQuery = encodeURIComponent(ADDRESS);
const mapsEmbedSrc = `https://www.google.com/maps?q=${mapsQuery}&z=16&output=embed`;
const mapsHref = GOOGLE_MAPS_LOCATION;

const contactRows = [
  { icon: Phone, label: "Phone", value: "0322 2227004", href: `tel:${PHONE}` },
  { icon: Mail, label: "Email", value: EMAIL, href: EMAIL_COMPOSE_URL },
  { icon: MapPin, label: "Address", value: ADDRESS, href: mapsHref },
  { icon: Clock, label: "Hours", value: "Open Daily · 12PM – 12AM" },
];

const socials = [
  { label: "WhatsApp", href: "https://wa.me/923222227004", icon: FaWhatsapp },
  { label: "Instagram", href: "https://www.instagram.com/justkidin.store?igsh=MTNvY2pqbG43amVi", icon: FaInstagram },
  { label: "TikTok", href: "https://www.tiktok.com/@justkidin_?_r=1&_t=ZP-98HTCj6AQFa", icon: FaTiktok },
];

function ContactLink({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-3 rounded-2xl border border-transparent p-3 transition-colors hover:border-[#e8ddcc] hover:bg-white/70">
      <span className="mt-0.5 rounded-full bg-[#ff7d6b]/10 p-2 text-[#ff7d6b]">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[#8b7f6c]">{label}</p>
        <p className="mt-1 text-sm leading-relaxed text-[#2f2a22]">{value}</p>
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>
      {content}
    </Link>
  );
}

export default function ContactUsPage() {
  return (
    <main className="bg-[0000] text-[#0F2540]" style={{ fontFamily: FONT_BODY }}>
      <section className="mx-auto grid max-w-[90rem] items-center gap-16 px-10 py-16 sm:px-16 lg:px-24 md:grid-cols-2 md:py-24">
        <div>
          <h1 className="flex items-center gap-3 text-4xl font-extrabold sm:text-5xl" style={{ fontFamily: FONT_HEADING }}>
            <span>
              <span style={{ color: "#2F2A22" }}>Contact </span>
              <span style={{ color: "#3a988a" }}>J</span>
              <span style={{ color: "#FF7D6B" }}>U</span>
              <span style={{ color: "#dbc548" }}>S</span>
              <span style={{ color: "#b36dcf" }}>T</span>{" "}
              <span style={{ color: "#2F2A22" }}>KiDiN</span>
              <span style={{ color: "#FF7D6B" }}>'</span>
            </span>
          </h1>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#7A6F5D]" style={{ fontFamily: FONT_HEADING }}>
            Questions about sizing, an order, or a custom request? Send us a message and we’ll get back to you as soon as possible.
          </p>

          <div className="mt-10 grid max-w-lg grid-cols-4 gap-10">
            {contactRows.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#DCE6DE]">
                  <Icon className="h-10 w-10 text-[#2F2A22]" strokeWidth={1.75} />
                </div>
                <p className="mt-2 text-xs font-semibold leading-tight text-[#2F2A22]" style={{ fontFamily: FONT_HEADING }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center w-full aspect-[6/5] rounded-[4.5rem] bg-[#F5E6D3] overflow-hidden -mt-6">
          <Image
            src="/3.png"
            alt="Just KiDiN' contact collection"
            width={900}
            height={675}
            className="w-[155%] h-auto"
            priority
          />
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-10 pb-16 sm:px-16 lg:px-24 md:pb-24">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#ff7d6b]/10 p-3 text-[#ff7d6b]">
                <Heart className="h-6 w-6 fill-current" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#8b7f6c]">Contact Details</p>
                <h2 className="text-3xl font-bold" style={{ fontFamily: FONT_HEADING }}>
                  Reach out anytime
                </h2>
              </div>
            </div>

            <div className="mt-8 grid gap-3">
              {contactRows.map((row) => (
                <ContactLink key={row.label} {...row} />
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3">
              {socials.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e3dccb] bg-[#f8f5ef] text-[#0f2540] transition-transform hover:-translate-y-0.5"
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </Link>
                );
              })}
            </div>


          </div>

          <div className="w-full max-w-[34rem] rounded-[2rem] border border-[#e3dccb] bg-[#f8f5ef] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:p-7 lg:justify-self-start">
            <div className="mb-5 flex items-center gap-3">
              <span className="rounded-full bg-white p-3 text-[#ff7d6b] shadow-sm">
                <MessageSquare className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#8b7f6c]">Send a Message</p>
                <h2 className="text-3xl font-bold" style={{ fontFamily: FONT_HEADING }}>
                  We’ll respond soon
                </h2>
              </div>
            </div>

            <ContactForm apiBaseUrl={process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000"} />
          </div>
        </div>
      </section>
    </main>
  );
}