import express from "express";
import axios from "axios";
import TRELLO_CONFIG from "../config/trello.js";
import { secretsMap } from "./secret.js";

const router = express.Router();

const getAuthParams = () => {
  const accessToken = secretsMap.get("access_token");
  if (!accessToken) throw new Error("No access token available");
  
  return {
    key: TRELLO_CONFIG.API_KEY,
    token: accessToken
  };
};

router.get("/boards/:boardId/lists", async (req, res) => {
  try {
    const { boardId } = req.params;
    const authParams = getAuthParams();

    const response = await axios.get(
      `https://api.trello.com/1/boards/${boardId}/lists`,
      { params: { ...authParams, fields: "id,name,pos,closed" } }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error fetching lists:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch lists" });
  }
});

router.post("/boards/:boardId/lists", async (req, res) => {
  try {
    const { boardId } = req.params;
    const { name } = req.body;
    const authParams = getAuthParams();

    const response = await axios.post(
      `https://api.trello.com/1/boards/${boardId}/lists`,
      null,
      { params: { ...authParams, name } }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error creating list:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create list" });
  }
});

router.put("/lists/:listId", async (req, res) => {
  try {
    const { listId } = req.params;
    const { name } = req.body;
    const authParams = getAuthParams();

    const response = await axios.put(
      `https://api.trello.com/1/lists/${listId}`,
      null,
      { params: { ...authParams, name } }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error updating list:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to update list" });
  }
});

router.put("/lists/:listId/archive", async (req, res) => {
  try {
    const { listId } = req.params;
    const authParams = getAuthParams();

    const response = await axios.put(
      `https://api.trello.com/1/lists/${listId}/closed`,
      null,
      { params: { ...authParams, value: true } }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error archiving list:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to archive list" });
  }
});

router.put("/lists/:listId/position", async (req, res) => {
  try {
    const { listId } = req.params;
    const { position } = req.body;
    const authParams = getAuthParams();

    console.log(`Moving list ${listId} to position ${position}`); 

    const response = await axios.put(
      `https://api.trello.com/1/lists/${listId}/pos`,
      null,
      { params: { ...authParams, value: position } }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error moving list:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to move list" });
  }
});

export default router;