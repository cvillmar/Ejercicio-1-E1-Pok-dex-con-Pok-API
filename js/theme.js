const themeToggle = document.getElementById("themeToggleCheckbox");

const setTheme = (isDark) => {
  document.body.classList.toggle("dark-theme", isDark);
  document.body.classList.toggle("light-theme", !isDark);

  if (themeToggle) {
    themeToggle.checked = isDark;
  }

  localStorage.setItem("theme", isDark ? "dark" : "light");
};

const savedTheme = localStorage.getItem("theme");

const isDarkInit = savedTheme === "dark";
setTheme(isDarkInit);

if (themeToggle) {
  themeToggle.addEventListener("change", () => {
    setTheme(themeToggle.checked);
  });
}
