document.getElementById("callApiBtn").addEventListener("click", async () => {
  const responseDiv = document.getElementById("response");
  responseDiv.textContent = "Appel baguette...";

  try {
    const apiUrl = "https://flask.bravemushroom-59142c25.francecentral.azurecontainerapps.io/kenobi";

    const res = await fetch(apiUrl, {
      method: "GET"
    });

    if (!res.ok) {
      throw new Error(`Erreur HTTP ${res.status}`);
    }

    const data = await res.json().catch(() => res.text());
    responseDiv.textContent = typeof data === "object"
      ? JSON.stringify(data, null, 2)
      : data;
  } catch (err) {
    responseDiv.textContent = "Putain pas de baguette : " + err.message;
  }
});
