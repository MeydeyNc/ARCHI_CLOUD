document.getElementById("callApiBtn").addEventListener("click", async () => {
  const responseDiv = document.getElementById("response");
  responseDiv.textContent = "Appel baguette...";

  try {
    // 🔧 Remplace l’URL ci-dessous par ton propre endpoint APIM :
    const apiUrl = "https://apim-student-demo.azure-api.net/echo/get";

    const res = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Ocp-Apim-Subscription-Key": "TA_CLE_API_ICI" // si ton APIM l’exige
      }
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
