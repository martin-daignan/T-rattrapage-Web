import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

export const getCard = async (listId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/lists/${listId}/cards`);
    return response.data;
  } catch (error) {
    console.error("Erreur récupération cartes:", error);
    throw new Error("Erreur de récupération des cartes");
  }
};

export const createCard = async (listId: string, cardName: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/cards`, {
      name: cardName,
      idList: listId
    });
    return response.data;
  } catch (error) {
    console.error("Erreur création carte:", error);
    throw new Error("Erreur de création de carte");
  }
};

export const getCardsInList = async (listId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/lists/${listId}/cards`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des cartes:", error);
    throw new Error("Erreur de récupération des cartes");
  }
};

export const updateCard = async (cardId: string, updateData: { name?: string; desc?: string; pos?: number }) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/cards/${cardId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la carte:", error);
    throw new Error("Erreur de mise à jour de la carte");
  }
};

export const deleteCard = async (cardId: string) => { 
  try {
    const response = await axios.delete(`${API_BASE_URL}/cards/${cardId}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression de la carte:", error);
    throw new Error("Erreur de suppression de la carte");
  }
};

export const moveCard = async (cardId: string, toListId: string) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/cards/${cardId}/move`, {
      idList: toListId
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors du déplacement de la carte:", error);
    throw new Error("Erreur de déplacement de la carte");
  }
};

export const updateCardDescription = async (cardId: string, description: string) => {
  if (!cardId) throw new Error("ID de la carte manquant");
  
  try {
    const response = await axios.put(`${API_BASE_URL}/cards/${cardId}`, {
      desc: description
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la description:", error);
    throw new Error("Erreur de mise à jour de la description");
  }
}

export const assignMembersToCard = async (cardId: string, memberIds: string[]) => {
  if (!cardId) {
    throw new Error("ID de la carte manquante");
  }
  try {
    const response = await axios.put(`${API_BASE_URL}/cards/${cardId}`, {
      idMembers: memberIds.join(',')
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'assignation des membres à la carte:", error);
    throw new Error("Erreur d'assignation des membres");
  }
};