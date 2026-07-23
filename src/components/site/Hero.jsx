import { ArrowDownRight, CalendarCheck, ShieldCheck } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function Hero() {
  return <section id="inicio" className="relative overflow-hidden bg-white pt-28">
    <div className="absolute right-[-10%] top-20 h-[400px] w-[400px] rounded-full bg-[#00BFFF]/10 blur-3xl"/>
    <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-20 lg:grid-cols-2 lg:px-8">
      <div><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00BFFF]/20 bg-[#00BFFF]/5 px-4 py-2 text-sm font-bold text-[#0099CC]"><ShieldCheck size={16}/> Diversão com segurança</div>
        <h1 className="text-5xl font-black leading-[.95] tracking-[-.04em] text-gray-900 sm:text-6xl lg:text-7xl">Sua festa em<br/><span className="text-[#00BFFF]">outra dimensão.</span></h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-500">Brinquedos, doces, decoração e estrutura com entrega, montagem e cuidado do início ao fim.</p>
        <div className="mt-8 flex flex-wrap gap-3"><a href="#atracoes" className="inline-flex items-center gap-2 rounded-full bg-[#00BFFF] px-7 py-4 font-bold text-white transition hover:brightness-110">Ver atrações <ArrowDownRight size={18}/></a><a href="https://wa.me/5567981396452" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-4 font-bold text-white transition hover:brightness-110"><CalendarCheck size={18}/> Consultar data</a></div>
      </div>
      <div className="relative"><div className="absolute inset-10 rounded-full bg-[#00BFFF]/10 blur-2xl"/><Image src="/images/hero-toboga.png" alt="Tobogã inflável colorido da Monteiro Locações" className="relative h-[380px] w-full drop-shadow-xl sm:h-[480px]" fittingType="fit"/></div>
    </div>
  </section>;
}
