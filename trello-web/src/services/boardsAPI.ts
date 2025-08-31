import axios from "axios";

const API_URL = "http://localhost:3000/api";

export const createBoardInWorkspace = async (workspaceId: string, boardName: string) => {
  if (!boardName) throw new Error("Nom du board manquant");

  try {
    const response = await axios.post(`${API_URL}/organizations/${workspaceId}/boards`, {
      name: boardName, 
    });
    return response.data;
  } catch (error) {
    console.error("Échec de la création du board:", error);
    throw new Error("Échec de la création du board");
  }
};

export const getBoards = async (organizationId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/boards/organization/${organizationId}`
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des boards:", error);
    throw new Error("Erreur de récupération des boards");
  }
};

export const getBoard = async (boardId: string) => {
  try {
    const response = await axios.get(`${API_URL}/api/boards/${boardId}`);
    return response.data;
  } catch (error) {
    console.error('Détails de l\'erreur:', error);
      throw new Error('Erreur serveur lors de la récupération du board.');
   } 
  }

export const updateBoard = async (boardId: string, newName: string) => {
  if (!newName) throw new Error("Le nouveau nom du board est requis");

  try {
    const response = await axios.put(`${API_URL}/boards/${boardId}`, {
      name: newName,
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du board:", error);
    throw new Error("Échec de la mise à jour du board");
  }
};

export const deleteBoard = async (boardId: string) => {
  try {
    const response = await axios.delete(`${API_URL}/boards/${boardId}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression du board:", error);
    throw new Error("Échec de la suppression du board");
  }
};

export const getBoardMembers = async (boardId: string) => {
  if (!boardId) throw new Error("ID du board manquant");

  try {
    const response = await axios.get(`${API_URL}/boards/${boardId}/members`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des membres:", error);
    throw new Error("Échec de récupération des membres");
  }
};


export const createBoardWithList = async (workspaceId: string, boardName: string) => {
  if (!boardName) throw new Error("Nom du board manquant");

  try {
    const response = await axios.post(`${API_URL}/organizations/${workspaceId}/boards-with-lists`, {
      name: boardName,
    });
    return response.data;
  } catch (error) {
    console.error("Échec de la création du template:", error);
    throw new Error("Échec de la création du template");
  }
};

