/* =========================================================
   Strategic Technology — клиентский JS
   Без зависимостей, без сборки. Только нативный браузерный API.
   ========================================================= */

(() => {
  "use strict";

  /* ---------------------------------------------------------
     1. Тень / граница шапки при скролле
     --------------------------------------------------------- */
  const header = document.getElementById("site-header");
  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------------------------------------------------
     2. Мобильное меню (бургер)
     --------------------------------------------------------- */
  const toggle = document.getElementById("mobile-toggle");
  const nav = document.querySelector(".main-nav");

  if (toggle && nav) {
    const closeMenu = () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Открыть меню");
      document.body.style.overflow = "";
    };

    const openMenu = () => {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Закрыть меню");
      document.body.style.overflow = "hidden";
    };

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.contains("is-open");
      isOpen ? closeMenu() : openMenu();
    });

    // Закрываем меню при клике по ссылке
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // Закрываем меню при resize в десктоп
    window.addEventListener("resize", () => {
      if (window.innerWidth > 720) closeMenu();
    });

    // Esc закрывает меню
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) closeMenu();
    });
  }

  /* ---------------------------------------------------------
     3. Скролл-появления секций
     --------------------------------------------------------- */
  const revealTargets = document.querySelectorAll(
    ".section-head, .service-card, .features-list li, .portfolio-item, .contact-card, .lead-form, .hero-stats"
  );

  if ("IntersectionObserver" in window && revealTargets.length) {
    revealTargets.forEach((el) => el.classList.add("reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // Лёгкая задержка для соседних карточек
            setTimeout(
              () => entry.target.classList.add("is-visible"),
              (i % 4) * 60
            );
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealTargets.forEach((el) => observer.observe(el));
  }

  /* ---------------------------------------------------------
     4. Маска для телефона: +7 ___ ___ __ __
     --------------------------------------------------------- */
  const phoneInputs = document.querySelectorAll('input[type="tel"]');

  const formatKzPhone = (raw) => {
    // Оставляем только цифры
    let digits = raw.replace(/\D/g, "");

    // Если начинается с 8 — заменяем на 7
    if (digits.startsWith("8")) digits = "7" + digits.slice(1);
    // Если не начинается с 7 и есть цифры — префиксуем 7
    if (digits.length && !digits.startsWith("7")) digits = "7" + digits;

    // Обрезаем до 11 цифр (7 + 10)
    digits = digits.slice(0, 11);

    if (digits.length === 0) return "";

    let result = "+7";
    if (digits.length > 1) result += " " + digits.slice(1, 4);
    if (digits.length >= 5) result += " " + digits.slice(4, 7);
    if (digits.length >= 8) result += " " + digits.slice(7, 9);
    if (digits.length >= 10) result += " " + digits.slice(9, 11);

    return result;
  };

  phoneInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      const cursor = e.target.selectionEnd;
      const before = e.target.value.length;
      e.target.value = formatKzPhone(e.target.value);
      const after = e.target.value.length;
      // Грубая поправка курсора
      e.target.setSelectionRange(cursor + (after - before), cursor + (after - before));
    });

    input.addEventListener("focus", (e) => {
      if (!e.target.value) e.target.value = "+7 ";
    });

    input.addEventListener("blur", (e) => {
      if (e.target.value.trim() === "+7") e.target.value = "";
    });
  });

  /* ---------------------------------------------------------
     5. Обработка отправки формы (без перезагрузки)
     Если Formspree не подключён (YOUR_FORM_ID), просто
     показываем спасибо-сообщение в консоль.
     --------------------------------------------------------- */
  const leadForm = document.querySelector(".lead-form");

  if (leadForm) {
    leadForm.addEventListener("submit", async (e) => {
      const action = leadForm.getAttribute("action") || "";

      // Если форма ещё не подключена — не отправляем, показываем подсказку
      if (action.includes("YOUR_FORM_ID")) {
        e.preventDefault();
        alert(
          "Форма пока не подключена.\n\nЗамени YOUR_FORM_ID в index.html на свой ID с formspree.io"
        );
        return;
      }

      // Иначе отправляем через fetch и показываем благодарность
      e.preventDefault();
      const data = new FormData(leadForm);
      const button = leadForm.querySelector('button[type="submit"]');
      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = "Отправляем...";

      try {
        const response = await fetch(action, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          leadForm.innerHTML =
            '<div style="text-align:center; padding:48px 16px;">' +
            '<h3 style="color:#fff; margin-bottom:12px;">Спасибо! Заявка отправлена.</h3>' +
            '<p style="color:rgba(255,255,255,0.7); margin:0;">Мы свяжемся с вами в ближайшее время.</p>' +
            "</div>";
        } else {
          throw new Error("Ошибка отправки");
        }
      } catch (err) {
        alert(
          "Не удалось отправить заявку. Позвоните нам напрямую: +7 701 715 42 86"
        );
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  }

  /* ---------------------------------------------------------
     6. Год в футере (на случай, если когда-нибудь забудешь)
     --------------------------------------------------------- */
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     7. Дропдаун «Услуги» в шапке (для мобильных — по тапу)
     --------------------------------------------------------- */
  document.querySelectorAll(".nav-item").forEach((item) => {
    const btn = item.querySelector(".nav-drop-btn");
    if (!btn) return;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      item.classList.toggle("is-open");
    });

    document.addEventListener("click", (e) => {
      if (!item.contains(e.target)) item.classList.remove("is-open");
    });
  });

  /* ---------------------------------------------------------
     8. Табы «Решения»: Для бизнеса / Для дома
     --------------------------------------------------------- */
  const tabButtons = document.querySelectorAll(".solutions-tab");
  const tabPanels = document.querySelectorAll(".solutions-panel");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("is-active"));
      tabPanels.forEach((p) => p.classList.remove("is-active"));
      btn.classList.add("is-active");
      const panel = document.getElementById(btn.dataset.target);
      if (panel) panel.classList.add("is-active");
    });
  });

  /* ---------------------------------------------------------
     9. Квиз: 6 шагов → расчёт в WhatsApp
     --------------------------------------------------------- */
  const quiz = document.getElementById("quiz");

  if (quiz) {
    const steps = Array.from(quiz.querySelectorAll(".quiz-step"));
    const backBtn = quiz.querySelector(".quiz-back");
    const nextBtn = quiz.querySelector(".quiz-next");
    const fill = quiz.querySelector(".quiz-progress-fill");
    const label = quiz.querySelector(".quiz-progress-label");
    const WA_NUMBER = "77017154286"; // номер WhatsApp компании

    let current = 0;

    const render = () => {
      steps.forEach((s, i) => s.classList.toggle("is-active", i === current));
      backBtn.hidden = current === 0;
      const isLast = current === steps.length - 1;
      nextBtn.textContent = isLast ? "Получить расчёт в WhatsApp" : "Далее →";
      nextBtn.classList.toggle("btn-wa", isLast);
      fill.style.width = ((current + 1) / steps.length) * 100 + "%";
      label.textContent = (current + 1) + " / " + steps.length;
    };

    const stepValid = () => {
      const step = steps[current];
      const radios = step.querySelectorAll('input[type="radio"]');
      if (radios.length) {
        return Array.from(radios).some((r) => r.checked);
      }
      // Финальный шаг: имя + телефон
      const name = step.querySelector('input[name="quiz-name"]');
      const phone = step.querySelector('input[name="quiz-phone"]');
      if (name && phone) {
        const digits = phone.value.replace(/\D/g, "");
        return name.value.trim().length >= 2 && digits.length === 11;
      }
      return true;
    };

    const collectAnswers = () => {
      const lines = [];
      steps.forEach((step) => {
        const q = step.dataset.question;
        const checked = step.querySelector('input[type="radio"]:checked');
        if (q && checked) lines.push(q + ": " + checked.value);
      });
      const name = quiz.querySelector('input[name="quiz-name"]');
      const phone = quiz.querySelector('input[name="quiz-phone"]');
      return (
        "Здравствуйте! Хочу получить расчёт стоимости.\n\n" +
        lines.join("\n") +
        "\n\nИмя: " + name.value.trim() +
        "\nТелефон: " + phone.value.trim()
      );
    };

    nextBtn.addEventListener("click", () => {
      if (!stepValid()) {
        const step = steps[current];
        step.style.animation = "none";
        // Лёгкая встряска как подсказка
        requestAnimationFrame(() => {
          step.style.animation = "";
        });
        const hint = step.querySelector(".quiz-hint");
        if (hint) hint.style.display = "block";
        return;
      }

      if (current < steps.length - 1) {
        current += 1;
        render();
      } else {
        // Финал: открываем WhatsApp с заполненной анкетой
        const text = encodeURIComponent(collectAnswers());
        window.open(
          "https://wa.me/" + WA_NUMBER + "?text=" + text,
          "_blank",
          "noopener"
        );
      }
    });

    backBtn.addEventListener("click", () => {
      if (current > 0) {
        current -= 1;
        render();
      }
    });

    // Авто-переход по клику на вариант (как в квизах на Tilda)
    steps.forEach((step, i) => {
      step.querySelectorAll('input[type="radio"]').forEach((radio) => {
        radio.addEventListener("change", () => {
          if (i === current && current < steps.length - 1) {
            setTimeout(() => {
              current += 1;
              render();
            }, 250);
          }
        });
      });
    });

    render();
  }

})();