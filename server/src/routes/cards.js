import express from "express";
import axios from "axios";
import TRELLO_CONFIG from "../config/trello.js";
import { secretsMap } from "./secret.js";

const router = express.Router();

// Middleware pour obtenir les headers d'authentification
const getAuthParams = () => {
  const accessToken = secretsMap.get("access_token");
  console.log("Current access token:", accessToken);
  console.log("API Key:", TRELLO_CONFIG.API_KEY);
  
  if (!accessToken) {
    throw new Error("No access token available");
  }
  
  return {
    key: TRELLO_CONFIG.API_KEY,
    token: accessToken
  };
};

// POST créer une carte
router.post("/cards", async (req, res) => {
  try {
    console.log("Creating card with data:", req.body);
    
    const { name, idList, desc } = req.body;
    
    if (!name || !idList) {
      return res.status(400).json({ error: "Name and idList are required" });
    }

    const authParams = getAuthParams();

    console.log("Calling Trello API with params:", { ...authParams, name, idList, desc });
    
    const response = await axios.post(
      "https://api.trello.com/1/cards",
      null,
      {
        params: {
          ...authParams,
          name: name,
          idList: idList,
          desc: desc || ""
        }
      }
    );

    console.log("Card created successfully:", response.data);
    res.json(response.data);
    
  } catch (err) {
    console.error("Error creating card:", err.response?.data || err.message);
    console.error("Full error:", err);
    
    if (err.response?.status === 401) {
      return res.status(401).json({ error: "Authentication failed" });
    }
    
    res.status(500).json({ 
      error: "Failed to create card",
      details: err.response?.data || err.message 
    });
  }
});

// GET cartes d'une liste
router.get("/lists/:listId/cards", async (req, res) => {
  try {
    const { listId } = req.params;
    const authParams = getAuthParams();

    console.log("Fetching cards for list:", listId);
    
    const response = await axios.get(
      `https://api.trello.com/1/lists/${listId}/cards`,
      { 
        params: { 
          ...authParams, 
          fields: "id,name,desc,pos,idList" 
        } 
      }
    );

    console.log("Found", response.data.length, "cards");
    res.json(response.data);
  } catch (err) {
    console.error("Error fetching cards:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch cards" });
  }
});

// GET une carte spécifique
router.get("/cards/:cardId", async (req, res) => {
  try {
    const { cardId } = req.params;
    const authParams = getAuthParams();

    const response = await axios.get(
      `https://api.trello.com/1/cards/${cardId}`,
      { 
        params: { 
          ...authParams,
          fields: "id,name,desc,pos,idList,idBoard"
        } 
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error fetching card:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch card" });
  }
});

// PUT mettre à jour une carte
router.put("/cards/:cardId", async (req, res) => {
  try {
    const { cardId } = req.params;
    const { name, desc, pos } = req.body;
    const authParams = getAuthParams();

    const response = await axios.put(
      `https://api.trello.com/1/cards/${cardId}`,
      null,
      {
        params: {
          ...authParams,
          name: name,
          desc: desc,
          pos: pos
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error updating card:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to update card" });
  }
});

// DELETE supprimer une carte
router.delete("/cards/:cardId", async (req, res) => {
  try {
    const { cardId } = req.params;
    const authParams = getAuthParams();

    await axios.delete(
      `https://api.trello.com/1/cards/${cardId}`,
      { params: { ...authParams } }
    );

    res.json({ success: true, message: "Card deleted successfully" });
  } catch (err) {
    console.error("Error deleting card:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to delete card" });
  }
});

// PUT déplacer une carte vers une autre liste
router.put("/cards/:cardId/move", async (req, res) => {
  try {
    const { cardId } = req.params;
    const { idList } = req.body;
    const authParams = getAuthParams();

    const response = await axios.put(
      `https://api.trello.com/1/cards/${cardId}`,
      null,
      {
        params: {
          ...authParams,
          idList: idList
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error moving card:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to move card" });
  }
});

// GET les commentaires d'une carte
router.get("/cards/:cardId/actions", async (req, res) => {
  try {
    const { cardId } = req.params;
    const authParams = getAuthParams();

    const response = await axios.get(
      `https://api.trello.com/1/cards/${cardId}/actions`,
      { 
        params: { 
          ...authParams,
          filter: "commentCard"
        } 
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error fetching card actions:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch card actions" });
  }
});

// POST ajouter un commentaire à une carte
router.post("/cards/:cardId/actions/comments", async (req, res) => {
  try {
    const { cardId } = req.params;
    const { text } = req.body;
    const authParams = getAuthParams();

    const response = await axios.post(
      `https://api.trello.com/1/cards/${cardId}/actions/comments`,
      null,
      {
        params: {
          ...authParams,
          text: text
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error adding comment:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

export default router;