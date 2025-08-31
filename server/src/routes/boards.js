import express from "express";
import axios from "axios";
import TRELLO_CONFIG from "../config/trello.js";
import { secretsMap } from "./secret.js";

const router = express.Router();

router.get("/organization/:orgId", async (req, res) => {
  try {
    const accessToken = secretsMap.get("access_token");
    if (!accessToken) return res.status(400).json({ error: "No access token" });

    const { orgId } = req.params;

    const boardsRes = await axios.get(
      `https://api.trello.com/1/organizations/${orgId}/boards`,
      {
        params: { 
          key: TRELLO_CONFIG.API_KEY, 
          token: accessToken, 
          fields: "id,name,url", 
          filter: "open" 
        }
      }
    );

    res.json(boardsRes.data);
  } catch (err) {
    console.error("Error fetching boards:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch boards" });
  }
});

router.put("/:boardId", async (req, res) => {
  try {
    const accessToken = secretsMap.get("access_token");
    if (!accessToken) return res.status(400).json({ error: "No access token" });

    const { boardId } = req.params;
    const { name } = req.body;

    const response = await axios.put(
      `https://api.trello.com/1/boards/${boardId}`,
      null,
      {
        params: { 
          key: TRELLO_CONFIG.API_KEY, 
          token: accessToken,
          name 
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error updating board:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to update board" });
  }
});

router.delete("/:boardId", async (req, res) => {
  try {
    const accessToken = secretsMap.get("access_token");
    if (!accessToken) return res.status(400).json({ error: "No access token" });

    const { boardId } = req.params;

    await axios.delete(`https://api.trello.com/1/boards/${boardId}`, {
      params: { 
        key: TRELLO_CONFIG.API_KEY, 
        token: accessToken 
      }
    });

    res.json({ success: true, message: "Board deleted" });
  } catch (err) {
    console.error("Error deleting board:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to delete board" });
  }
});

// GET membres d'un board
router.get("/:boardId/members", async (req, res) => {
  try {
    const accessToken = secretsMap.get("access_token");
    if (!accessToken) return res.status(400).json({ error: "No access token" });

    const { boardId } = req.params;

    const membersRes = await axios.get(
      `https://api.trello.com/1/boards/${boardId}/members`,
      {
        params: { 
          key: TRELLO_CONFIG.API_KEY, 
          token: accessToken 
        }
      }
    );

    res.json(membersRes.data);
  } catch (err) {
    console.error("Error fetching board members:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch board members" });
  }
});

export default router;