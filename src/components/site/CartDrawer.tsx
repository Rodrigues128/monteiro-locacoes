import { Calendar, Clock3, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import WhatsAppIcon from "@/components/WhatsAppIcon";

function getTodayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatTimeInput(value) {
  const acceptedDigits = [];

  for (const digit of value.replace(/\D/g, "")) {
    if (acceptedDigits.length === 4) break;

    const position = acceptedDigits.length;
    const firstHourDigit = acceptedDigits[0];
    const isInvalidHourStart = position === 0 && digit > "2";
    const isInvalidHourEnd =
      position === 1 && firstHourDigit === "2" && digit > "3";
    const isInvalidMinuteStart = position === 2 && digit > "5";

    if (isInvalidHourStart || isInvalidHourEnd || isInvalidMinuteStart) {
      continue;
    }

    acceptedDigits.push(digit);
  }

  const digits = acceptedDigits.join("");
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function isValidTime(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return false;

  const [, hours, minutes] = match;
  return Number(hours) < 24 && Number(minutes) < 60;
}

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   price: number | null,
 *   quantity?: number
 * }} CartItem
 *
 * @typedef {{
 *   open: boolean,
 *   items: CartItem[],
 *   onClose: () => void,
 *   onRemove: (id: string) => void,
 *   onQuantityChange: (id: string, change: number) => void,
 *   date: string,
 *   time: string,
 *   onDateChange: (date: string) => void,
 *   onTimeChange: (time: string) => void
 * }} CartDrawerProps
 */

export default function CartDrawer(
  /** @type {CartDrawerProps} */ {
    open,
    items,
    onClose,
    onRemove,
    onQuantityChange,
    date,
    time,
    onDateChange,
    onTimeChange,
  },
) {
  const closeButton = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const dateInput = useRef(/** @type {HTMLInputElement | null} */ (null));
  const [dateError, setDateError] = useState("");
  const [timeInput, setTimeInput] = useState(time);
  const [timeError, setTimeError] = useState("");
  const total = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0,
  );
  const today = getTodayIso();

  useEffect(() => {
    if (!open) return undefined;
    closeButton.current?.focus();
    document.body.style.overflow = "hidden";
    /** @param {KeyboardEvent} event */
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (dateInput.current && dateInput.current.value !== date) {
      dateInput.current.value = date;
    }
  }, [date]);

  useEffect(() => {
    if (time) setTimeInput(time);
  }, [time]);

  const handleDateChange = (value) => {
    if (value && value < today) {
      setDateError("Escolha uma data de hoje ou futura.");
      return;
    }

    setDateError("");
  };

  const handleDateBlur = (value) => {
    if (value && value < today) {
      setDateError("Escolha uma data de hoje ou futura.");
      onDateChange("");
      return;
    }

    setDateError("");
    onDateChange(value);
  };

  const handleTimeChange = (value) => {
    const formattedTime = formatTimeInput(value);
    setTimeInput(formattedTime);

    if (!formattedTime) {
      setTimeError("");
      return;
    }

    if (formattedTime.length === 5 && !isValidTime(formattedTime)) {
      setTimeError("Informe um horário entre 00:00 e 23:59.");
      return;
    }

    setTimeError("");
  };

  const handleTimeBlur = () => {
    if (!timeInput) {
      setTimeError("");
      onTimeChange("");
      return;
    }

    if (!isValidTime(timeInput)) {
      setTimeError("Informe um horário entre 00:00 e 23:59.");
      onTimeChange("");
      return;
    }

    setTimeError("");
    onTimeChange(timeInput);
  };

  const send = () => {
    const selectedDate = dateInput.current?.value || "";
    if (selectedDate && selectedDate < today) {
      setDateError("Escolha uma data de hoje ou futura.");
      dateInput.current?.focus();
      return;
    }

    if (timeInput && !isValidTime(timeInput)) {
      setTimeError("Informe um horário entre 00:00 e 23:59.");
      return;
    }

    setDateError("");
    setTimeError("");
    onDateChange(selectedDate);
    onTimeChange(timeInput);

    const list = items
      .map((item) => `• ${item.quantity || 1}x ${item.name}`)
      .join("\n");
    const hasCustomPrice = items.some((item) => item.price === null);
    const estimate = hasCustomPrice
      ? `Valor parcial dos itens com preço: R$ ${total},00. Os demais valores serão confirmados no atendimento.`
      : `Valor estimado: R$ ${total},00`;
    const schedule = selectedDate
      ? `${selectedDate}${timeInput ? ` às ${timeInput}` : ""}`
      : "uma data e horário a combinar";
    const text = `Olá! Gostaria de consultar disponibilidade para ${schedule}:\n${list}\n${estimate}`;
    window.open(
      `https://wa.me/5567981396452?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white p-6 shadow-2xl transition duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#00BFFF]">
              Seu evento
            </p>
            <h2 id="cart-title" className="text-2xl font-black text-gray-900">
              Sua sacola
            </h2>
          </div>
          <button
            ref={closeButton}
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-gray-500 focus-visible:outline-[#00BFFF]"
            aria-label="Fechar sacola"
          >
            <X size={18} />
          </button>
        </div>

        <div className="my-6 rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4">
          <p className="text-xs font-black uppercase tracking-wider text-[#008fc0]">
            Após confirmar o agendamento
          </p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            Este é o fluxo de etapas que a Monteiro Locações organiza para o seu evento.
          </p>
          <div className="mt-4 grid grid-cols-4 gap-1 text-center text-[9px] font-black text-gray-500">
            {["Entrega", "Montagem", "Festa", "Retirada"].map((label, index) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#00BFFF] text-[10px] text-white shadow-sm">
                  {index + 1}
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-auto">
          {!items.length && (
            <div className="grid h-48 place-items-center text-center text-gray-400">
              <div>
                <ShoppingBag className="mx-auto mb-3" />
                <p>
                  Seu pedido está vazio.
                  <br />
                  Adicione atrações do catálogo.
                </p>
              </div>
            </div>
          )}
          {items.map((item) => (
            <div key={item.id} className="rounded-xl bg-gray-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-400">
                    {item.price === null
                      ? "Valor sob consulta"
                      : `R$ ${item.price * (item.quantity || 1)},00`}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-gray-300 hover:text-red-500 focus-visible:outline-red-500"
                  aria-label={`Remover ${item.name}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="mt-3 inline-flex items-center rounded-full border border-gray-200 bg-white p-1">
                <button
                  onClick={() => onQuantityChange(item.id, -1)}
                  disabled={(item.quantity || 1) === 1}
                  className="grid h-7 w-7 place-items-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                  aria-label={`Diminuir quantidade de ${item.name}`}
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-black">
                  {item.quantity || 1}
                </span>
                <button
                  onClick={() => onQuantityChange(item.id, 1)}
                  className="grid h-7 w-7 place-items-center rounded-full text-gray-500 hover:bg-gray-100"
                  aria-label={`Aumentar quantidade de ${item.name}`}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-sm font-bold text-gray-700">
            <span className="mb-2 flex items-center gap-2"><Calendar size={16} className="text-[#00BFFF]" /> Data do evento</span>
            <input
              ref={dateInput}
              type="date"
              min={today}
              defaultValue={date}
              onChange={(
                /** @type {import("react").ChangeEvent<HTMLInputElement>} */ event,
              ) => handleDateChange(event.target.value)}
              onBlur={(
                /** @type {import("react").FocusEvent<HTMLInputElement>} */ event,
              ) => handleDateBlur(event.target.value)}
              aria-invalid={Boolean(dateError)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm outline-none focus:border-[#00BFFF] aria-[invalid=true]:border-red-400"
            />
            {dateError && <span className="mt-1 block text-xs font-medium text-red-500">{dateError}</span>}
          </label>
          <label className="text-sm font-bold text-gray-700">
            <span className="mb-2 flex items-center gap-2"><Clock3 size={16} className="text-[#00BFFF]" /> Horário</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="HH:mm"
              maxLength={5}
              value={timeInput}
              onChange={(
                /** @type {import("react").ChangeEvent<HTMLInputElement>} */ event,
              ) => handleTimeChange(event.target.value)}
              onBlur={handleTimeBlur}
              aria-invalid={Boolean(timeError)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm outline-none focus:border-[#00BFFF] aria-[invalid=true]:border-red-400"
            />
            {timeError && <span className="mt-1 block text-xs font-medium text-red-500">{timeError}</span>}
          </label>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-gray-400">
          Sua sacola, data e horário ficam salvos neste navegador por até 30 dias. Isso não reserva a data.
        </p>
        <div className="mt-4 flex justify-between text-lg font-black text-gray-900">
          <span>Valor estimado</span>
          <span>
            {items.some((item) => item.price === null)
              ? `A partir de R$ ${total},00`
              : `R$ ${total},00`}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Frete e disponibilidade serão confirmados pelo WhatsApp.
        </p>
        <button
          disabled={!items.length}
          onClick={send}
          className="mt-4 flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-4 font-bold text-white focus-visible:outline-slate-900 disabled:opacity-30"
        >
          <WhatsAppIcon size={19} white />
          Consultar no WhatsApp
        </button>
      </aside>
    </>
  );
}
