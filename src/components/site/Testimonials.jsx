import { ExternalLink, Quote, Star } from "lucide-react"

const GOOGLE_PROFILE =
  "https://www.google.com/maps/place/MONTEIRO+LOCA%C3%87%C3%95ES/@-20.4694625,-54.543652,17z/data=!4m8!3m7!1s0x9486efa50dda302f:0x64508179bf0c4e41!8m2!3d-20.4694625!4d-54.543652!9m1!1b1!16s%2Fg%2F11wvfp94ch"

const reviews = [
  {
    name: "Delícias da Irene",
    time: "2 dias atrás",
    text: "Excelente atendimento, mesas e cadeiras super conservadas!",
  },
  {
    name: "Ketlyn Dayane",
    time: "6 dias atrás",
    text: "Precisei alugar um pula-pula e uma piscina de bolinhas de última hora, e fui muito bem atendida. O atendimento foi rápido, atencioso e conseguiram fazer a entrega no mesmo dia. Deu tudo certo e fiquei muito satisfeita. Recomendo!",
  },
  {
    name: "Samira Caminha",
    time: "Avaliação recente",
    text: "Cordialidade no atendimento e pontualidade na entrega. Utilizei o serviço de locação de brinquedos, são produtos em bom estado de apresentação. Recomendo a empresa.",
  },
  {
    name: "Telma Candida",
    time: "2 semanas atrás",
    text: "Super pontuais, já indiquei para a família e respeita o cliente.",
  },
  {
    name: "Valéria Nascimento",
    time: "3 semanas atrás",
    text: "Muito organizados e prestativos, pontuais e atenciosos. Muito obrigada pelo trabalho.",
  },
  {
    name: "Silvio José De Campos Filho",
    time: "Editado há um mês",
    text: "Gostei da atenção, agilidade, produto e do cuidado com o nosso piso. Com certeza alugarei de novo.",
  },
]

export default function Testimonials() {
  return (
    <section id="depoimentos" className="bg-[#F9FAFB] px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-sm font-black uppercase tracking-[.2em] text-[#00BFFF]">
            Avaliações no Google
          </p>
          <h2 className="text-4xl font-black tracking-[-.03em] text-gray-900 sm:text-5xl">
            A confiança de quem já{" "}
            <span className="text-[#00BFFF]">escolheu a gente</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Comentários reais e públicos de clientes da Monteiro Locações.
          </p>
        </div>

        <a
          href={GOOGLE_PROFILE}
          target="_blank"
          rel="noreferrer"
          className="group mx-auto mb-10 flex max-w-2xl flex-col items-center justify-between gap-5 rounded-2xl border border-gray-100 bg-white px-6 py-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:text-left"
          aria-label="Ver as 196 avaliações da Monteiro Locações no Google"
        >
          <div className="flex items-center gap-4">
            <img
              src="/images/google-logo.webp"
              alt=""
              aria-hidden="true"
              width="36"
              height="36"
              style={{ width: 36, height: 36, objectFit: "contain", display: "block" }}
            />
            <strong className="text-4xl font-black leading-none text-slate-950">
              5,0
            </strong>
            <div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={18}
                    style={{ fill: "#FEC400", color: "#FEC400" }}
                  />
                ))}
              </div>
              <p className="mt-1 text-sm font-bold text-gray-500">
                196 avaliações no Google
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 font-bold text-[#0099CC]">
            Ver todas as avaliações
            <ExternalLink
              size={18}
              className="transition group-hover:translate-x-1"
            />
          </span>
        </a>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.name}
              className="flex min-h-[390px] flex-col rounded-[22px] border border-gray-100 bg-white px-8 py-9 shadow-[0_2px_8px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(15,23,42,0.10)] sm:px-10 sm:py-10"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/images/google-logo.webp"
                    alt=""
                    aria-hidden="true"
                    width="22"
                    height="22"
                    style={{ width: 22, height: 22, objectFit: "contain", display: "block" }}
                  />
                  <span className="text-base font-bold text-gray-400">
                    Google
                  </span>
                </div>
                <div
                  className="flex gap-1"
                  aria-label="Avaliação positiva publicada no Google"
                >
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={18}
                      style={{ fill: "#FEC400", color: "#FEC400" }}
                    />
                  ))}
                </div>
              </div>

              <Quote
                className="mt-6 rotate-180 text-[#00BFFF]"
                size={34}
                strokeWidth={2.5}
              />

              <blockquote className="mt-4 flex-1 text-[17px] leading-[1.75] text-slate-700">
                {review.text}
              </blockquote>

              <div className="mt-8 border-t border-gray-100 pt-6">
                <p className="text-lg font-black text-slate-950">
                  {review.name}
                </p>
                <p className="mt-1 text-base text-gray-400">{review.time}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
