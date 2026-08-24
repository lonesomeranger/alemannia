const healthButton = document.querySelector("#health-check");
const statusPanel = document.querySelector(".status-panel");
const statusMessage = document.querySelector("#status-message");
const buildTime = document.querySelector("#build-time");

buildTime.textContent = `Loaded ${new Date().toISOString()}`;

healthButton.addEventListener("click", async () => {
  healthButton.disabled = true;
  statusMessage.textContent = "Checking endpoint...";

  try {
    const response = await fetch(window.location.href, {
      method: "HEAD",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    statusPanel.classList.add("is-healthy");
    statusMessage.textContent = `Healthy - HTTP ${response.status}`;
    healthButton.textContent = "Check passed";
  } catch (error) {
    statusPanel.classList.remove("is-healthy");
    statusMessage.textContent = `Check failed - ${error.message}`;
    healthButton.textContent = "Try again";
  } finally {
    healthButton.disabled = false;
  }
});
