import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";


export const createList = async (boardId: string, listName: string) => {
  if (!listName) throw new Error("Nom de la liste manquant");
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/lists/boards/${boardId}/lists`, 
      { name: listName }
    );
    return response.data;
  } catch (error) {
    console.error("Échec de la création de la liste:", error);
    throw new Error("Échec de la création de la liste");
  }
};

export const getLists = async (boardId: string) => {
  if (!boardId) throw new Error("ID du board manquant");
  
  try {
    const response = await axios.get(
      `${API_BASE_URL}/lists/boards/${boardId}/lists` 
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des listes:", error);
    throw new Error("Erreur de récupération des listes");
  }
};

export const updateList = async (listId: string, newName: string) => {
  if (!newName) throw new Error("Nouveau nom de liste requis");
  
  try {
    const response = await axios.put(
      `${API_BASE_URL}/lists/lists/${listId}`, 
      { name: newName }
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la liste:", error);
    throw new Error("Échec de la mise à jour de la liste");
  }
};

export const archiveList = async (listId: string) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/lists/lists/${listId}/archive` 
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'archivage de la liste:", error);
    throw new Error("Échec de l'archivage de la liste");
  }
};

export const moveList = async (listId: string, position: number) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/lists/${listId}/pos`,
      { value: position } 
    );
    return response.data;
  } catch (error) {
    console.error("Erreur déplacement liste:", error);
    throw new Error("Erreur de déplacement de liste");
  }
};