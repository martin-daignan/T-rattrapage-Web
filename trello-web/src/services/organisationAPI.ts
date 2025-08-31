import axios from "axios";

// 🔹 Récupérer toutes les organisations
export const getOrganisations = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/organizations");
    return response.data;
  } catch (error) {
    console.error("Échec de la récupération des organisations:", error);
    throw error;
  }
};

// 🔹 Récupérer les détails d’une organisation
export const getOrganisationDetails = async (organisationId: string) => {
  try {
    const response = await axios.get(
      `http://localhost:3000/api/organizations/${organisationId}`
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de l'organisation:", error);
    throw error;
  }
};

// 🔹 Créer une organisation
export const createWorkspace = async (organisationName: string) => {
  if (!organisationName) throw new Error("Nom du workspace manquant");
  try {
    const response = await axios.post("http://localhost:3000/api/organizations", {
      displayName: organisationName,
    });
    return response.data;
  } catch (error) {
    console.error("Échec de la création du workspace:", error);
    throw error;
  }
};

// 🔹 Mettre à jour une organisation
export const updateWorkspace = async (workspaceId: string, newName: string) => {
  if (!newName) throw new Error("Le nouveau nom du workspace est requis.");
  try {
    const response = await axios.put(
      `http://localhost:3000/api/organizations/${workspaceId}`,
      { displayName: newName }
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du workspace:", error);
    throw error;
  }
};

// 🔹 Supprimer une organisation
export const deleteWorkspace = async (workspaceId: string) => {
  try {
    const response = await axios.delete(
      `http://localhost:3000/api/organizations/${workspaceId}`
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression du workspace:", error);
    throw error;
  }
};

// 🔹 Récupérer les membres d’une organisation
export const getOrganisationMembers = async (organisationId: string) => {
  if (!organisationId) throw new Error("ID de l'organisation manquant");
  try {
    const response = await axios.get(
      `http://localhost:3000/api/organizations/${organisationId}/members`
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des membres de l'organisation:", error);
    throw error;
  }
};

// 🔹 Ajouter un membre
export const addMemberToOrganisation = async (organisationId: string, email: string) => {
  try {
    const response = await axios.post(
      `http://localhost:3000/api/organizations/${organisationId}/members`,
      { email }
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ajout du membre:", error);
    throw error;
  }
};

// 🔹 Supprimer un membre
export const removeMemberFromOrganisation = async (organisationId: string, memberId: string) => {
  try {
    const response = await axios.delete(
      `http://localhost:3000/api/organizations/${organisationId}/members/${memberId}`
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression du membre:", error);
    throw error;
  }
};
