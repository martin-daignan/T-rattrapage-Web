import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; 
import { getBoards, createBoardInWorkspace, updateBoard, deleteBoard } from "../services/boardsAPI";

interface Board {
  id: string;
  name: string;
  url?: string;
}

export default function BoardsScreen() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate(); 
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [updateWorkspaceId, setUpdateWorkspaceId] = useState<string | null>(null);
  const [updateWorkspaceName, setUpdateWorkspaceName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBoards();
  }, [workspaceId]);

  const fetchBoards = async () => {
    if (!workspaceId) return setError("Workspace ID manquant");

    try {
      setLoading(true);
      const data = await getBoards(workspaceId);
      setBoards(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Erreur de récupération des boards");
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async () => {
    if (!newWorkspaceName) return alert("Nom du board requis");
    try {
      setActionLoading(true);
      await createBoardInWorkspace(workspaceId!, newWorkspaceName);
      setNewWorkspaceName("");
      fetchBoards();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création du board");
    } finally {
      setActionLoading(false);
    }
  };

  const updateWorkspace = async () => {
    if (!updateWorkspaceId || !updateWorkspaceName) return alert("Informations manquantes");
    try {
      setActionLoading(true);
      await updateBoard(updateWorkspaceId, updateWorkspaceName);
      setUpdateWorkspaceId(null);
      setUpdateWorkspaceName("");
      fetchBoards();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour du board");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteWorkspace = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce board ?")) return;
    try {
      setActionLoading(true);
      await deleteBoard(id);
      fetchBoards();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression du board");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Mes Boards</h1>

      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Nouveau board"
          value={newWorkspaceName}
          onChange={(e) => setNewWorkspaceName(e.target.value)}
          className="p-2 border rounded"
        />
        <button 
          onClick={createWorkspace} 
          className="bg-blue-500 text-white px-4 rounded"
          disabled={actionLoading}
        >
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
          <button 
            onClick={updateWorkspace} 
            className="bg-yellow-500 text-white px-4 rounded"
            disabled={actionLoading}
          >
            Mettre à jour
          </button>
          <button 
            onClick={() => setUpdateWorkspaceId(null)} 
            className="bg-gray-300 px-4 rounded"
          >
            Annuler
          </button>
        </div>
      )}

      {boards.length === 0 && <p>Aucun board trouvé dans ce workspace.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {boards.map((board) => (
          <div
            key={board.id}
            className="p-4 bg-white rounded-2xl shadow hover:shadow-lg cursor-pointer transition flex flex-col justify-between"
          >
            <div onClick={() => navigate(`/boards/${board.id}/lists`)}>
              <h2 className="text-lg font-semibold">{board.name}</h2>
            </div>
            
            <div className="mt-2 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUpdateWorkspaceId(board.id);
                  setUpdateWorkspaceName(board.name);
                }}
                className="bg-yellow-500 text-white px-2 rounded"
                disabled={actionLoading}
              >
                Modifier
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteWorkspace(board.id);
                }}
                className="bg-red-500 text-white px-2 rounded"
                disabled={actionLoading}
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