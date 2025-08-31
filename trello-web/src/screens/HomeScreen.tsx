import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Organization {
  id: string;
  name: string;
  displayName: string;
  desc?: string;
}

export default function HomeScreen() {
  const [workspaces, setWorkspaces] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [updateWorkspaceId, setUpdateWorkspaceId] = useState<string | null>(null);
  const [updateWorkspaceName, setUpdateWorkspaceName] = useState("");

  const navigate = useNavigate();

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/organizations");
      setWorkspaces(res.data);
    } catch (err) {
      console.error(err);
      setError("Impossible de récupérer les workspaces");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

const createWorkspace = async () => {
  if (!newWorkspaceName) return alert("Nom du workspace requis");
  try {
    await axios.post("http://localhost:3000/api/organizations", { 
      displayName: newWorkspaceName 
    });
    setNewWorkspaceName("");
    fetchWorkspaces();
  } catch (err) {
    console.error(err);
    alert("Erreur lors de la création du workspace");
  }
};

const updateWorkspace = async () => {
  if (!updateWorkspaceId || !updateWorkspaceName) return alert("Informations manquantes");
  try {
    await axios.put(`http://localhost:3000/api/organizations/${updateWorkspaceId}`, { 
      displayName: updateWorkspaceName 
    });
    setUpdateWorkspaceId(null);
    setUpdateWorkspaceName("");
    fetchWorkspaces();
  } catch (err) {
    console.error(err);
    alert("Erreur lors de la mise à jour du workspace");
  }
};

  const deleteWorkspace = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce workspace ?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/organizations/${id}`);
      fetchWorkspaces();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression du workspace");
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Mes Workspaces</h1>

      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Nouveau workspace"
          value={newWorkspaceName}
          onChange={(e) => setNewWorkspaceName(e.target.value)}
          className="p-2 border rounded"
        />
        <button onClick={createWorkspace} className="bg-blue-500 text-white px-4 rounded">
          Créer
        </button>
      </div>

      {updateWorkspaceId && (
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="Nouveau nom"
            value={updateWorkspaceName}
            onChange={(e) => setUpdateWorkspaceName(e.target.value)}
            className="p-2 border rounded"
          />
          <button onClick={updateWorkspace} className="bg-yellow-500 text-white px-4 rounded">
            Mettre à jour
          </button>
          <button onClick={() => setUpdateWorkspaceId(null)} className="bg-gray-300 px-4 rounded">
            Annuler
          </button>
        </div>
      )}

      {workspaces.length === 0 && <p>Aucun workspace trouvé</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {workspaces.map((ws) => (
          <div
            key={ws.id}
            className="p-4 bg-white rounded-2xl shadow hover:shadow-lg cursor-pointer transition flex flex-col justify-between"
          >
            <div onClick={() => navigate(`/workspaces/${ws.id}`)}>
              <h2 className="text-lg font-semibold">{ws.displayName}</h2>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => {
                  setUpdateWorkspaceId(ws.id);
                  setUpdateWorkspaceName(ws.displayName);
                }}
                className="bg-yellow-500 text-white px-2 rounded"
              >
                Modifier
              </button>
              <button
                onClick={() => deleteWorkspace(ws.id)}
                className="bg-red-500 text-white px-2 rounded"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
