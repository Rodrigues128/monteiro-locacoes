import { Armchair, Candy, ShieldCheck, Sparkles } from "lucide-react";
const services = [
  {
    icon: Candy,
    title: "Doces",
    text: "Algodão doce, pipoca e monitores treinados.",
  },
  {
    icon: Sparkles,
    title: "Decoração",
    text: "Balões personalizados e arcos sob medida.",
  },
  {
    icon: Armchair,
    title: "Estrutura",
    text: "Mesas, cadeiras e toalhas para seus convidados.",
  },
  {
    icon: ShieldCheck,
    title: "Cuidado total",
    text: "Equipamentos higienizados e montagem profissional.",
  },
];
export default function Services() {
  return (
    <section className="bg-[#F9FAFB] px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-black uppercase tracking-[.2em] text-[#00BFFF]">
              Muito além dos brinquedos
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.03em] text-gray-900 sm:text-5xl">
              Uma festa inteira.
              <br />
              Um único parceiro.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-500">
              Da decoração à estrutura completa, cuidamos de cada detalhe para
              que você só precise se preocupar em comemorar.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map(({ icon: Icon, ...s }) => (
              <div
                key={s.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#00BFFF]/10">
                  <Icon className="text-[#00BFFF]" size={24} />
                </div>
                <h3 className="mt-5 text-lg font-black text-gray-900">
                  {s.title}
                </h3>
                <p className="mt-2 leading-relaxed text-gray-500">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
