(() => {
  // =========================
  // API base (prod + local)
  // =========================
  const API_BASE =
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? "http://localhost:8080"
      : "https://api.turist-rf.ru";

  async function postJSON(path, data) {
    const r = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data || {}),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) {
      const msg = j && j.error ? j.error : `HTTP ${r.status}`;
      throw new Error(msg);
    }
    return j;
  }

  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => Array.from(root.querySelectorAll(s));

  // =========================
  // STICKY HEADER OFFSET FOR ANCHORS
  // =========================
  const headerEl = qs("header.header");

  function setHeaderOffsetVar() {
    const h = headerEl ? headerEl.offsetHeight : 0;
    document.documentElement.style.setProperty("--header-offset", `${h}px`);
  }

  // сразу + при ресайзе
  setHeaderOffsetVar();
  window.addEventListener("resize", setHeaderOffsetVar);

  // иногда высота хедера меняется после загрузки шрифтов/картинок
  window.addEventListener("load", setHeaderOffsetVar);

  function lockScroll(lock) {
    document.documentElement.style.overflow = lock ? "hidden" : "";
  }

  // =========================
  // BURGER MENU
  // =========================
  const burger = qs(".burger");
  const mobileMenu = qs(".mobile-menu");

  function openMenu() {
    document.body.classList.add("menu-open");
    if (burger) burger.setAttribute("aria-expanded", "true");
    if (mobileMenu) mobileMenu.setAttribute("aria-hidden", "false");
    lockScroll(true);
  }

  function closeMenu() {
    document.body.classList.remove("menu-open");
    if (burger) burger.setAttribute("aria-expanded", "false");
    if (mobileMenu) mobileMenu.setAttribute("aria-hidden", "true");
    lockScroll(false);
  }

  if (burger && mobileMenu) {
    burger.addEventListener("click", () => {
      const isOpen = document.body.classList.contains("menu-open");
      isOpen ? closeMenu() : openMenu();
    });

    qsa("[data-menu-close]", mobileMenu).forEach((el) => {
      el.addEventListener("click", closeMenu);
    });

    // закрывать по ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("menu-open"))
        closeMenu();
    });

    // закрывать при клике на ссылку
    qsa(".mobile-menu__link", mobileMenu).forEach((a) => {
      a.addEventListener("click", closeMenu);
    });
  }

  // =========================
  // FAQ ACCORDION
  // =========================
  function initFaq() {
    const items = qsa(".faq .item");
    if (!items.length) return;

    items.forEach((item) => {
      const q = qs(".question", item);
      const a = qs(".answer", item);
      if (!q || !a) return;

      item.classList.remove("is-open");
      a.style.maxHeight = "0px";

      q.style.cursor = "pointer";
      q.setAttribute("role", "button");
      q.setAttribute("tabindex", "0");
      q.setAttribute("aria-expanded", "false");

      const toggle = () => {
        const isOpen = item.classList.contains("is-open");

        // один открыт — остальные закрываем
        items.forEach((it) => {
          if (it === item) return;
          it.classList.remove("is-open");
          const ans = qs(".answer", it);
          const que = qs(".question", it);
          if (ans) ans.style.maxHeight = "0px";
          if (que) que.setAttribute("aria-expanded", "false");
        });

        if (isOpen) {
          item.classList.remove("is-open");
          a.style.maxHeight = "0px";
          q.setAttribute("aria-expanded", "false");
        } else {
          item.classList.add("is-open");
          a.style.maxHeight = a.scrollHeight + "px";
          q.setAttribute("aria-expanded", "true");
        }
      };

      q.addEventListener("click", (e) => {
        e.preventDefault();
        toggle();
      });
      q.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });

      window.addEventListener("resize", () => {
        if (item.classList.contains("is-open")) {
          a.style.maxHeight = a.scrollHeight + "px";
        }
      });
    });
  }

  initFaq();

  // =========================
  // COOKIE CONSENT (localStorage)
  // =========================
  const CONSENT_KEY = "vasilevo_cookie_consent"; // "accepted" | "rejected"

  function initCookieBanner() {
    const banner = qs(".cookie");
    if (!banner) return;

    const saved = localStorage.getItem(CONSENT_KEY);
    if (saved === "accepted" || saved === "rejected") {
      banner.remove();
      return;
    }

    banner.classList.add("is-visible");

    const accept = qs("[data-cookie-accept]", banner);
    const reject = qs("[data-cookie-reject]", banner);

    function setConsent(value) {
      localStorage.setItem(CONSENT_KEY, value);
      banner.classList.remove("is-visible");
      banner.remove();
    }

    if (accept) accept.addEventListener("click", () => setConsent("accepted"));
    if (reject) reject.addEventListener("click", () => setConsent("rejected"));
  }

  initCookieBanner();

  // =========================
  // CUSTOM SELECTS
  // =========================
  function closeAllSelects(except) {
    qsa(".select.is-open").forEach((s) => {
      if (s === except) return;
      s.classList.remove("is-open");
      const btn = qs(".select__trigger", s);
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  function initSelects() {
    const selects = qsa(".select.js-select");
    if (!selects.length) return;

    selects.forEach((root) => {
      const trigger = qs(".select__trigger", root);
      const list = qs(".select__list", root);
      const hidden = qs('input[type="hidden"]', root);
      const valueEl = qs(".select__value", root);

      if (!trigger || !list || !hidden || !valueEl) return;

      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = root.classList.contains("is-open");
        closeAllSelects(root);
        root.classList.toggle("is-open", !isOpen);
        trigger.setAttribute("aria-expanded", String(!isOpen));
      });

      qsa(".select__option", root).forEach((opt) => {
        opt.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          const v = opt.getAttribute("data-value") ?? opt.textContent.trim();
          hidden.value = v;
          valueEl.textContent = opt.textContent.trim();

          qsa(".select__option", root).forEach((o) =>
            o.classList.remove("is-selected"),
          );
          opt.classList.add("is-selected");

          root.classList.remove("is-open");
          trigger.setAttribute("aria-expanded", "false");
        });
      });
    });

    document.addEventListener("click", () => closeAllSelects(null));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAllSelects(null);
    });
  }

  function initGuests() {
    const roots = qsa(".guests.js-guests");
    if (!roots.length) return;

    const formatGuests = (adults, children) => {
      return String(adults + children); // просто число
    };

    const closeAll = (except) => {
      roots.forEach((r) => {
        if (r === except) return;
        r.classList.remove("is-open");
        const t = qs(".guests__trigger", r);
        if (t) t.setAttribute("aria-expanded", "false");
      });
    };

    roots.forEach((root) => {
      const trigger = qs(".guests__trigger", root);
      const valEl = qs(".guests__value", root);
      const inAdults = qs('input[name="adults"]', root);
      const inChildren = qs('input[name="children"]', root);

      const countAdults = qs('[data-guest-count="adults"]', root);
      const countChildren = qs('[data-guest-count="children"]', root);

      const done = qs("[data-guests-done]", root);

      let adults = Number(inAdults?.value ?? 2);
      let children = Number(inChildren?.value ?? 0);

      const sync = () => {
        if (inAdults) inAdults.value = String(adults);
        if (inChildren) inChildren.value = String(children);
        if (countAdults) countAdults.textContent = String(adults);
        if (countChildren) countChildren.textContent = String(children);
        if (valEl) valEl.textContent = formatGuests(adults, children);
      };

      sync();

      trigger?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = root.classList.contains("is-open");
        closeAll(root);
        root.classList.toggle("is-open", !isOpen);
        trigger.setAttribute("aria-expanded", String(!isOpen));
      });

      qsa("[data-guest-plus], [data-guest-minus]", root).forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          const plus = btn.hasAttribute("data-guest-plus");
          const type = btn.getAttribute(
            plus ? "data-guest-plus" : "data-guest-minus",
          );

          if (type === "adults") {
            if (plus) adults = Math.min(adults + 1, 8);
            else adults = Math.max(adults - 1, 1); // минимум 1 взрослый
          }
          if (type === "children") {
            if (plus) children = Math.min(children + 1, 8);
            else children = Math.max(children - 1, 0);
          }

          sync();
        });
      });

      done?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        root.classList.remove("is-open");
        trigger?.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", () => closeAll(null));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAll(null);
    });
  }
  initGuests();

  initSelects();

  // =========================
  // FORMS + CALC MODAL
  // =========================
  const PRICING = {
    // "за человека в сутки", ориентировочно — поменяй под реальную математику санатория
    roomPerPersonPerNight: {
      standard: 4200,
      comfort: 5600,
      lux: 7900,
    },

    // скидка из бейджа на лендинге
    discount: {
      percent: 10, // -10%
      until: "2026-05-31", // включительно
    },

    prepayPercent: 30,

    // куда шлём (можешь поменять)
    leadEmail: "mail@turist-rf.ru",
    waPhoneE164: "78432532030", // +7 843 253-20-30 -> для wa.me без "+"
  };

  const fmtMoney = (n) =>
    new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(n);

  const fmtDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso + "T00:00:00");
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d);
  };

  const roomLabel = (key) => {
    if (key === "standard") return "Стандарт";
    if (key === "comfort") return "Комфорт";
    if (key === "lux") return "Люкс";
    return "—";
  };

  function isDiscountActive(checkinISO) {
    if (!checkinISO) return false;
    const checkin = new Date(checkinISO + "T00:00:00").getTime();
    const until = new Date(PRICING.discount.until + "T23:59:59").getTime();
    return checkin <= until;
  }

  function calcTotal({ roomType, days, adults, children, checkinISO }) {
    const nights = Math.max(1, Number(days || 1));
    const a = Math.max(1, Number(adults || 1));
    const c = Math.max(0, Number(children || 0));
    const guests = a + c;

    const perNight =
      PRICING.roomPerPersonPerNight[roomType] ??
      PRICING.roomPerPersonPerNight.standard;
    const base = perNight * nights * guests;

    const discountOn = isDiscountActive(checkinISO);
    const discountValue = discountOn
      ? Math.round((base * PRICING.discount.percent) / 100)
      : 0;

    const total = Math.max(0, base - discountValue);
    const prepay = Math.round((total * PRICING.prepayPercent) / 100);
    const rest = Math.max(0, total - prepay);

    return {
      guests,
      nights,
      perNight,
      base,
      discountOn,
      discountValue,
      total,
      prepay,
      rest,
    };
  }

  function setFormError(form, text) {
    const box = qs(".form-error", form);
    if (!box) return;
    if (!text) {
      box.hidden = true;
      box.textContent = "";
      return;
    }
    box.hidden = false;
    box.textContent = text;
  }

  function setConsentError(form, text) {
    const wrap = qs(".form-consent", form);
    const box = qs(".form-consent__error", form);

    if (wrap) wrap.classList.toggle("is-error", Boolean(text));

    if (!box) return;
    if (!text) {
      box.hidden = true;
      box.textContent = "";
      return;
    }

    box.hidden = false;
    box.textContent = text;
  }

  // =========================
  // BOOKING MODAL (from "Забронировать" buttons)
  // =========================
  const bookingModal = qs("#bookingModal");
  const bookingForm = qs("#formBooking");

  function openBookingModal(contextText) {
    if (!bookingModal) return;

    // проставляем контекст (какая кнопка/какой номер)
    if (bookingForm) {
      const offerInput = qs('input[name="offer"]', bookingForm);
      if (offerInput) offerInput.value = contextText || "";

      // по желанию: автоподстановка в комментарий
      const commentInput = qs('input[name="comment"]', bookingForm);
      if (commentInput && contextText) {
        // не затираем, если пользователь уже что-то вводил
        if (!commentInput.value.trim()) commentInput.value = contextText;
      }
    }

    bookingModal.setAttribute("aria-hidden", "false");
    bookingModal.classList.add("is-open");
    lockScroll(true);

    // фокус на первое поле
    const first = bookingForm ? qs('input[name="name"]', bookingForm) : null;
    if (first) first.focus();
  }

  function closeBookingModal() {
    if (!bookingModal) return;
    bookingModal.classList.remove("is-open");
    bookingModal.setAttribute("aria-hidden", "true");
    lockScroll(false);
  }

  if (bookingModal) {
    qsa("[data-modal-close]", bookingModal).forEach((el) =>
      el.addEventListener("click", closeBookingModal),
    );

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && bookingModal.classList.contains("is-open")) {
        closeBookingModal();
      }
    });
  }

  // Триггеры: conditions + prices
  qsa(".conditions__tab .btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      openBookingModal("Бронирование: условия");
    });
  });

  qsa(".prices__grid .item .btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".item");
      const title = item ? (qs("h3", item)?.textContent || "").trim() : "";
      openBookingModal(
        title ? `Бронирование: ${title}` : "Бронирование: номер",
      );
    });
  });

  // чистим ошибку при клике на чекбокс
  function initConsentLiveClear() {
    qsa("form").forEach((form) => {
      const cb = qs('input[name="consent"]', form);
      if (!cb) return;

      cb.addEventListener("change", () => {
        if (cb.checked) setConsentError(form, "");
      });
    });
  }
  initConsentLiveClear();

  function getFormHomeData() {
    const form = qs("#formHome");
    if (!form) return null;

    const fd = new FormData(form);
    const name = (fd.get("name") || "").toString().trim();
    const phone = (fd.get("phone") || "").toString().trim();
    const checkin = (fd.get("checkin") || "").toString();
    const days = Number(fd.get("days") || 0);
    const adults = Number(fd.get("adults") || 1);
    const children = Number(fd.get("children") || 0);
    const roomType =
      (fd.get("roomType") || "standard").toString() || "standard";
    const consent = fd.get("consent") === "on";

    return {
      form,
      name,
      phone,
      checkin,
      days,
      adults,
      children,
      roomType,
      consent,
    };
  }

  // ---- Modal helpers
  const modal = qs("#calcModal");
  const modalSuccess = modal ? qs(".modal__success", modal) : null;

  let currentLead = null;

  const sendManagerBtn = modal ? qs("[data-send-manager]", modal) : null;
  if (sendManagerBtn) {
    sendManagerBtn.addEventListener("click", () => {
      if (!currentLead) return;

      // сюда потом подключим реальную отправку в бота
      window.__vasilevoLead = {
        ...currentLead,
        createdAt: new Date().toISOString(),
      };

      if (modalSuccess) {
        modalSuccess.hidden = false;
        modalSuccess.textContent =
          "Готово. Данные заявки подготовлены — дальше подключим отправку менеджеру.";
      }
    });
  }

  function openModal() {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "false");
    modal.classList.add("is-open");
    lockScroll(true);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    lockScroll(false);
  }

  if (modal) {
    qsa("[data-modal-close]", modal).forEach((el) =>
      el.addEventListener("click", closeModal),
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open"))
        closeModal();
    });
  }

  function buildLeadText(data, calc) {
    const lines = [
      "Заявка с лендинга «Санаторий Васильевский»",
      "",
      `Имя: ${data.name || "—"}`,
      `Телефон: ${data.phone || "—"}`,
      `Дата заезда: ${fmtDate(data.checkin)}`,
      `Ночей: ${calc.nights}`,
      `Гостей: ${calc.guests} (взр: ${data.adults}, дети: ${data.children})`,
      `Номер: ${roomLabel(data.roomType)}`,
      "",
      `База: ${fmtMoney(calc.base)}`,
      calc.discountOn
        ? `Скидка: -${fmtMoney(calc.discountValue)} (${PRICING.discount.percent}%)`
        : "Скидка: —",
      `Итого: ${fmtMoney(calc.total)}`,
      `Аванс 30%: ${fmtMoney(calc.prepay)}`,
      `Остаток: ${fmtMoney(calc.rest)}`,
    ];
    return lines.join("\n");
  }

  function fillModal(data, calc) {
    if (!modal) return;

    const set = (sel, val) => {
      const el = qs(sel, modal);
      if (el) el.textContent = val;
    };

    set("[data-calc-room]", roomLabel(data.roomType));
    set("[data-calc-checkin]", fmtDate(data.checkin));
    set("[data-calc-days]", String(calc.nights));
    set("[data-calc-guests]", String(calc.guests));

    set("[data-calc-base]", fmtMoney(calc.base));

    const discountRow = qs("[data-calc-discount-row]", modal);
    if (discountRow) discountRow.hidden = !calc.discountOn;

    set("[data-calc-discount]", `-${fmtMoney(calc.discountValue)}`);
    set("[data-calc-total]", fmtMoney(calc.total));
    set("[data-calc-prepay]", fmtMoney(calc.prepay));
    set("[data-calc-rest]", fmtMoney(calc.rest));

    if (modalSuccess) {
      modalSuccess.hidden = true;
      modalSuccess.textContent = "";
    }

    const leadText = buildLeadText(data, calc);

    // сохраняем текущую заявку (для будущей отправки в бота)
    currentLead = { data, calc, leadText };

    // сбрасываем сообщение успеха при каждом открытии
    if (modalSuccess) {
      modalSuccess.hidden = true;
      modalSuccess.textContent = "";
    }
  }

  // ---- HERO form submit -> modal
  const formHome = qs("#formHome");
  if (formHome) {
    formHome.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = getFormHomeData();
      if (!data) return;

      setFormError(data.form, "");
      setConsentError(data.form, "");

      // базовая валидация
      if (!data.name) return setFormError(data.form, "Укажите имя.");
      if (!data.phone) return setFormError(data.form, "Укажите телефон.");
      if (!data.checkin)
        return setFormError(data.form, "Выберите дату заезда.");
      if (!data.days || data.days < 1)
        return setFormError(data.form, "Укажите количество дней (минимум 1).");
      if (!data.consent) {
        setConsentError(
          data.form,
          "Поставьте галочку согласия на обработку персональных данных.",
        );
        return;
      }

      const calc = calcTotal({
        roomType: data.roomType,
        days: data.days,
        adults: data.adults,
        children: data.children,
        checkinISO: data.checkin,
      });

      fillModal(data, calc);
      openModal();
    });
  }

  // ---- Booking form submit -> MAX via backend
  if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fd = new FormData(bookingForm);
      const offer = (fd.get("offer") || "").toString().trim();
      const name = (fd.get("name") || "").toString().trim();
      const phone = (fd.get("phone") || "").toString().trim();
      const comment = (fd.get("comment") || "").toString().trim();
      const consent = fd.get("consent") === "on";

      setFormError(bookingForm, "");
      setConsentError(bookingForm, "");

      if (!name) return setFormError(bookingForm, "Укажите имя.");
      if (!phone) return setFormError(bookingForm, "Укажите телефон.");
      if (!consent) {
        setConsentError(
          bookingForm,
          "Поставьте галочку согласия на обработку персональных данных.",
        );
        return;
      }

      try {
        await postJSON("/api/lead", {
          source: "booking_modal",
          formId: "formBooking",
          pageUrl: location.href,
          name,
          phone,
          comment,
          offer,
        });

        closeBookingModal();
        alert("Заявка отправлена! Мы свяжемся с вами.");
      } catch (err) {
        setFormError(
          bookingForm,
          "Не удалось отправить. Попробуйте ещё раз или чуть позже.",
        );
      }
    });
  }

  // ---- Contacts form submit -> MAX via backend
  const formContacts = qs("#formContacts");
  if (formContacts) {
    formContacts.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fd = new FormData(formContacts);
      const name = (fd.get("name") || "").toString().trim();
      const phone = (fd.get("phone") || "").toString().trim();
      const comment = (fd.get("comment") || "").toString().trim();
      const consent = fd.get("consent") === "on";

      setFormError(formContacts, "");
      setConsentError(formContacts, "");

      if (!name) return setFormError(formContacts, "Укажите имя.");
      if (!phone) return setFormError(formContacts, "Укажите телефон.");
      if (!consent) {
        setConsentError(
          formContacts,
          "Поставьте галочку согласия на обработку персональных данных.",
        );
        return;
      }

      try {
        await postJSON("/api/lead", {
          source: "contacts_form",
          formId: "formContacts",
          pageUrl: location.href,
          name,
          phone,
          comment,
        });

        formContacts.reset();
        alert("Заявка отправлена! Мы свяжемся с вами.");
      } catch (err) {
        setFormError(
          formContacts,
          "Не удалось отправить. Попробуйте ещё раз или чуть позже.",
        );
      }
    });
  }

  // =========================
  // AI CHAT WIDGET
  // =========================
  const aiFab = qs("#aiChatFab");
  const aiPanel = qs("#aiChatPanel");
  const aiClose = qs("#aiChatClose");
  const aiMsgs = qs("#aiChatMsgs");
  const aiForm = qs("#aiChatForm");
  const aiInput = qs("#aiChatInput");

  const aiLeadBox = qs("#aiChatLead");
  const aiLeadName = qs("#aiLeadName");
  const aiLeadPhone = qs("#aiLeadPhone");
  const aiLeadConsent = qs("#aiLeadConsent");
  const aiLeadSend = qs("#aiLeadSend");
  const aiLeadCancel = qs("#aiLeadCancel");
  const aiLeadErr = qs("#aiLeadErr");

  const chatState = {
    sessionId: (() => {
      const k = "ai_chat_session";
      let v = localStorage.getItem(k);
      if (!v) {
        v = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        localStorage.setItem(k, v);
      }
      return v;
    })(),
    history: [],
  };

  function chatAdd(role, text) {
    if (!aiMsgs) return;
    const div = document.createElement("div");
    div.className = `ai-msg ${role === "user" ? "ai-msg--me" : "ai-msg--bot"}`;
    div.textContent = text;
    aiMsgs.appendChild(div);
    aiMsgs.scrollTop = aiMsgs.scrollHeight;
  }

  function chatOpen() {
    if (!aiPanel) return;
    aiPanel.classList.add("is-open");
    aiPanel.setAttribute("aria-hidden", "false");
    if (aiInput) aiInput.focus();
    if (!chatState.history.length) {
      chatAdd(
        "assistant",
        "Привет! Я ИИ-консультант. Подскажу по номерам, датам заезда и помогу забронировать. Что интересует?",
      );
    }
  }

  function chatClose() {
    if (!aiPanel) return;
    aiPanel.classList.remove("is-open");
    aiPanel.setAttribute("aria-hidden", "true");
    if (aiLeadBox) aiLeadBox.hidden = true;
  }

  function leadShow() {
    if (aiLeadBox) aiLeadBox.hidden = false;
    if (aiLeadErr) aiLeadErr.hidden = true;
  }

  function leadHide() {
    if (aiLeadBox) aiLeadBox.hidden = true;
    if (aiLeadErr) aiLeadErr.hidden = true;
  }

  async function leadSendFromChat() {
    const name = (aiLeadName?.value || "").trim();
    const phone = (aiLeadPhone?.value || "").trim();
    const consent = Boolean(aiLeadConsent?.checked);

    if (aiLeadErr) {
      aiLeadErr.hidden = true;
      aiLeadErr.textContent = "";
    }

    if (!name || !phone) {
      if (aiLeadErr) {
        aiLeadErr.hidden = false;
        aiLeadErr.textContent = "Укажите имя и телефон.";
      }
      return;
    }
    if (!consent) {
      if (aiLeadErr) {
        aiLeadErr.hidden = false;
        aiLeadErr.textContent =
          "Нужно согласие на обработку персональных данных.";
      }
      return;
    }

    try {
      await postJSON("/api/lead", {
        source: "chat_lead",
        formId: "aiChatLead",
        pageUrl: location.href,
        name,
        phone,
        comment: "Лид из чата",
        offer: "",
      });

      leadHide();
      chatAdd(
        "assistant",
        "Спасибо! Контакты отправлены. Менеджер свяжется с вами.",
      );
    } catch (e) {
      if (aiLeadErr) {
        aiLeadErr.hidden = false;
        aiLeadErr.textContent =
          "Не удалось отправить. Попробуйте ещё раз чуть позже.";
      }
    }
  }

  if (aiFab)
    aiFab.addEventListener("click", () => {
      if (aiPanel && aiPanel.classList.contains("is-open")) chatClose();
      else chatOpen();
    });
  if (aiClose) aiClose.addEventListener("click", chatClose);

  if (aiLeadSend) aiLeadSend.addEventListener("click", leadSendFromChat);
  if (aiLeadCancel) aiLeadCancel.addEventListener("click", leadHide);

  // shortcut: если ИИ просит телефон — покажем форму
  function maybeOfferLead(text) {
    const t = String(text || "").toLowerCase();
    if (
      t.includes("телефон") ||
      t.includes("контакт") ||
      t.includes("перезвон")
    ) {
      leadShow();
    }
  }

  if (aiForm) {
    aiForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = (aiInput?.value || "").trim();
      if (!msg) return;

      chatAdd("user", msg);
      if (aiInput) aiInput.value = "";

      // отправляем на бэк
      try {
        const resp = await postJSON("/api/chat", {
          sessionId: chatState.sessionId,
          userMessage: msg,
          pageUrl: location.href,
          meta: { history: chatState.history },
        });

        const answer = resp.answer || "…";
        chatAdd("assistant", answer);

        // копим историю (последние 12 пар, чтобы не раздувать)
        chatState.history.push({ role: "user", content: msg });
        chatState.history.push({ role: "assistant", content: answer });
        if (chatState.history.length > 24)
          chatState.history.splice(0, chatState.history.length - 24);

        maybeOfferLeadLead(answer);
      } catch (err) {
        chatAdd(
          "assistant",
          "Сейчас не получается ответить. Попробуйте ещё раз через минуту.",
        );
      }
    });
  }

  // fix typo call
  function maybeOfferLeadLead(answer) {
    maybeOfferLead(answer);
  }
})();
