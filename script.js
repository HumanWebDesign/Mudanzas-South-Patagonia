(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll('.nav-link, a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || !targetId.startsWith("#") || targetId.length === 1) return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });

      const openMenu = document.querySelector(".navbar-collapse.show");
      if (openMenu && window.bootstrap) {
        window.bootstrap.Collapse.getOrCreateInstance(openMenu).hide();
      }
    });
  });

  const collapseEl = document.getElementById("mainNav");
  if (collapseEl) {
    collapseEl.addEventListener("show.bs.collapse", () => document.body.classList.add("nav-open"));
    collapseEl.addEventListener("hidden.bs.collapse", () => document.body.classList.remove("nav-open"));
  }

  const sections = [...document.querySelectorAll("main section[id]")];
  const primaryNavLinks = [...document.querySelectorAll(".navbar-nav .nav-link")];
  if ("IntersectionObserver" in window && sections.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          primaryNavLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        });
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
  }

  const refreshOpenFaqHeights = () => {
    document.querySelectorAll(".faq-item.is-open .faq-answer").forEach((answer) => {
      answer.style.maxHeight = `${answer.scrollHeight}px`;
    });
  };

  document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const currentItem = button.closest(".faq-item");
      const currentAnswer = currentItem?.querySelector(".faq-answer");
      const shouldOpen = !currentItem.classList.contains("is-open");

      document.querySelectorAll(".faq-item").forEach((item) => {
        item.classList.remove("is-open");
        item.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
        const answer = item.querySelector(".faq-answer");
        if (answer) answer.style.maxHeight = "0px";
      });

      if (shouldOpen) {
        currentItem.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
        if (currentAnswer) {
          currentAnswer.style.maxHeight = `${currentAnswer.scrollHeight}px`;
        }
      }
    });
  });

  window.addEventListener("resize", refreshOpenFaqHeights);

  const parallaxTargets = [...document.querySelectorAll("[data-parallax-bg]")];
  if (parallaxTargets.length > 0 && !prefersReducedMotion && "IntersectionObserver" in window) {
    const targetStates = new Map();

    const updateParallax = (target) => {
      const state = targetStates.get(target);
      const section = target.closest("section") || target.parentElement;
      if (!state || !section) return;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
      const progress = Math.min(1, Math.max(0, (viewportHeight - rect.top) / (viewportHeight + rect.height)));
      const range = Number.parseFloat(target.dataset.parallaxRange || "40");
      const shift = (progress - 0.5) * range;

      target.style.setProperty("--parallax-shift", `${shift.toFixed(2)}px`);

      if (state.visible) {
        state.frame = window.requestAnimationFrame(() => updateParallax(target));
      }
    };

    const parallaxObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target;
          const state = targetStates.get(target);
          if (!state) return;

          state.visible = entry.isIntersecting;

          if (state.visible && state.frame === 0) {
            state.frame = window.requestAnimationFrame(() => updateParallax(target));
          }

          if (!state.visible && state.frame !== 0) {
            window.cancelAnimationFrame(state.frame);
            state.frame = 0;
          }
        });
      },
      { threshold: 0 },
    );

    parallaxTargets.forEach((target) => {
      targetStates.set(target, { frame: 0, visible: false });
      parallaxObserver.observe(target);
    });
  }

})();
