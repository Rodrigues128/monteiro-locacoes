import { ArrowUpRight, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Image } from "@/components/ui/image";
import WhatsAppIcon from "@/components/WhatsAppIcon";

const WHATSAPP = "https://wa.me/5567981396452";

const quickLinks = [
  ["Atrações", "#atracoes"],
  ["Como funciona", "#como-funciona"],
  ["Galeria", "#galeria"],
  ["Depoimentos", "#depoimentos"],
];

export default function Footer() {
  return (
    <footer id="contato" className="scroll-mt-20 bg-white">
      <div className="border-t border-gray-100 bg-[#F9FAFB] px-5 py-16 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-16">
            <p className="mb-3 text-sm font-black uppercase tracking-[.2em] text-[#00BFFF]">
              Contato
            </p>
            <h2 className="text-4xl font-black tracking-[-.03em] text-gray-900 sm:text-5xl">
              Entre em <span className="text-[#00BFFF]">contato</span>
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Estamos prontos para tornar sua festa inesquecível.
            </p>
          </div>

          <div className="mx-auto mb-10 grid max-w-3xl gap-3 sm:grid-cols-3 sm:gap-6">
            <a
              href="tel:+5567981396452"
              className="flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm transition hover:shadow-md sm:flex-col sm:p-6 sm:text-center"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#00BFFF]/10 text-[#00BFFF]">
                <Phone size={19} />
              </span>
              <span>
                <strong className="block text-gray-900">Telefone</strong>
                <span className="text-sm text-gray-500">67 98139-6452</span>
              </span>
            </a>
            <a
              href="mailto:contato@monteirolocacoes.com.br"
              className="flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm transition hover:shadow-md sm:flex-col sm:p-6 sm:text-center"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#00BFFF] text-white shadow-[0_6px_16px_rgba(0,191,255,0.25)]">
                <Mail size={22} strokeWidth={2.5} />
              </span>
              <span className="min-w-0">
                <strong className="block text-gray-900">E-mail</strong>
                <span className="block truncate text-sm text-gray-500">
                  monteirolocacoes.contato@gmail.com
                </span>
              </span>
            </a>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm transition hover:shadow-md sm:flex-col sm:p-6 sm:text-center"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#25D366]/10 text-[#25D366]">
                <WhatsAppIcon size={27} />
              </span>
              <span>
                <strong className="block text-gray-900">WhatsApp</strong>
                <span className="text-sm text-gray-500">67 98139-6452</span>
              </span>
            </a>
          </div>

          <div className="text-center">
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-8 py-4 font-bold text-white shadow-lg transition hover:brightness-110"
            >
              <WhatsAppIcon size={22} white />
              Falar no WhatsApp <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="px-5 py-10 sm:py-14 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.jpg"
                alt="Monteiro Locações"
                className="h-12 w-12 shrink-0 rounded-full"
              />
              <p className="font-black leading-tight text-gray-900">
                MONTEIRO
                <span className="block text-gray-400">LOCAÇÕES</span>
              </p>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
              Brinquedos e estrutura para festas, com entrega e montagem em
              Campo Grande.
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-black text-[#00BFFF]">Links rápidos</h3>
            <nav className="grid grid-cols-2 gap-x-5 gap-y-2.5 text-sm text-gray-500 sm:grid-cols-1">
              {quickLinks.map(([label, href]) => (
                <a key={href} href={href} className="hover:text-gray-900">
                  {label}
                </a>
              ))}
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noreferrer"
                className="hover:text-gray-900"
              >
                WhatsApp
              </a>
            </nav>
          </div>

          <div>
            <h3 className="mb-3 font-black text-[#00BFFF]">Contato</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <a
                  href="tel:+5567981396452"
                  className="flex items-center gap-2 hover:text-gray-900"
                >
                  <Phone size={15} /> 67 98139-6452
                </a>
              </li>
              <li>
                <a
                  href="mailto:contato@monteirolocacoes.com.br"
                  className="flex items-start gap-2 break-all hover:text-gray-900"
                >
                  <Mail className="mt-0.5 shrink-0" size={15} />
                  contato@monteirolocacoes.com.br
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={15} /> Campo Grande, MS
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-black text-[#00BFFF]">Redes sociais</h3>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/monteirolocacoes"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram da Monteiro Locações"
                className="grid h-11 w-11 place-items-center rounded-full bg-[#00BFFF] text-white transition hover:brightness-110"
              >
                <Instagram size={20} />
              </a>
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp da Monteiro Locações"
                className="grid h-11 w-11 place-items-center rounded-full bg-[#25D366] text-white transition hover:brightness-110"
              >
                <WhatsAppIcon size={24} white />
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-1 border-t border-gray-100 pt-6 text-center text-xs leading-relaxed text-gray-400 sm:text-sm">
          © 2026 Monteiro Locações · Todos os direitos reservados.
          <a
            href="/admin"
            className="font-semibold text-gray-500 transition hover:text-[#00BFFF]"
          >
            Área administrativa
          </a>
        </div>
      </div>
    </footer>
  );
}
