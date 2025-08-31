import useTrelloAuth from "../hooks/useTrelloAuth";

export default function LoginScreen() {
  const { startAuthFlow, error } = useTrelloAuth();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Connexion à Trello</h1>
      <button onClick={startAuthFlow}>Se connecter</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
