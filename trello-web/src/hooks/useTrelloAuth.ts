import { useState } from "react";

export default function useTrelloAuth() {
  const [error, setError] = useState<string | null>(null);

  const startAuthFlow = async () => {
    try {
      const resp = await fetch("http://localhost:3000/api/request_token", {
        credentials: "include",
      });
      const json = await resp.json();
      if (!json.oauth_token) throw new Error("No token received");

      // Redirection vers Trello
      window.location.href = `https://trello.com/1/OAuthAuthorizeToken?oauth_token=${json.oauth_token}&scope=read,write&expiration=never`;
    } catch (err) {
      console.error(err);
      setError("Erreur d’authentification");
    }
  };

  return { startAuthFlow, error };
}
