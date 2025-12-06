window.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("start-btn");
    button?.addEventListener("click", () => window.electronAPI?.startMigration?.());
});