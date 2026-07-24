document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector(".lang-wrapper");
  const btn = document.querySelector(".lang-toggle");

  if (!wrapper || !btn) return;

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isOpen = wrapper.classList.toggle("open");
    btn.setAttribute("aria-expanded", isOpen);
  });

  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) {
      wrapper.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      wrapper.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });
});