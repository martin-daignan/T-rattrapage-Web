import express from "express";
import axios from "axios";
import TRELLO_CONFIG from "../config/trello.js";
import { secretsMap } from "./secret.js";

const router = express.Router();

router.use(express.json());

function getAuthHeaders() {
  const accessToken = secretsMap.get("access_token");
  if (!accessToken) throw new Error("No access token available");
  return {
    Authorization: `OAuth oauth_token="${accessToken}"`,
  };
}

// GET toutes les organisations
router.get("/", async (req, res) => {
  try {
    const headers = getAuthHeaders();

    const orgRes = await axios.get("https://api.trello.com/1/members/me/organizations", {
      headers,
      params: { 
        key: TRELLO_CONFIG.API_KEY,
        fields: "id,name,displayName,desc" 
      },
    });

    res.json(orgRes.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch organizations" });
  }
});

router.post("/", async (req, res) => {
  try {
    const headers = getAuthHeaders();
    const { displayName, name } = req.body;
    const organizationName = displayName || name;
    if (!organizationName) {
      return res.status(400).json({ error: "Organization name is required" });
    }

    const orgRes = await axios.post(
      "https://api.trello.com/1/organizations",
      { displayName: organizationName },
      {
        headers,
        params: { key: TRELLO_CONFIG.API_KEY },
      }
    );

    res.json(orgRes.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create organization" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const headers = getAuthHeaders();
    const { id } = req.params;
    const { displayName, name } = req.body;

    const organizationName = displayName || name;
    if (!organizationName) {
      return res.status(400).json({ error: "Organization name is required" });
    }

    const orgRes = await axios.put(
      `https://api.trello.com/1/organizations/${id}`,
      { displayName: organizationName },
      {
        headers,
        params: { key: TRELLO_CONFIG.API_KEY },
      }
    );

    res.json(orgRes.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to update organization" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const headers = getAuthHeaders();
    const { id } = req.params;

    await axios.delete(`https://api.trello.com/1/organizations/${id}`, {
      headers,
      params: { key: TRELLO_CONFIG.API_KEY },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to delete organization" });
  }
});

router.get("/:id/members", async (req, res) => {
  try {
    const headers = getAuthHeaders();
    const { id } = req.params;

    const membersRes = await axios.get(
      `https://api.trello.com/1/organizations/${id}/members`,
      {
        headers,
        params: { key: TRELLO_CONFIG.API_KEY },
      }
    );

    res.json(membersRes.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch organization members" });
  }
});

router.post("/:id/members", async (req, res) => {
  try {
    const headers = getAuthHeaders();
    const { id } = req.params;
    const { email } = req.body;

    const memberRes = await axios.put(
      `https://api.trello.com/1/organizations/${id}/members`,
      { email },
      {
        headers,
        params: { key: TRELLO_CONFIG.API_KEY },
      }
    );

    res.json(memberRes.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to add member" });
  }
});

router.delete("/:id/members/:memberId", async (req, res) => {
  try {
    const headers = getAuthHeaders();
    const { id, memberId } = req.params;

    await axios.delete(
      `https://api.trello.com/1/organizations/${id}/members/${memberId}`,
      {
        headers,
        params: { key: TRELLO_CONFIG.API_KEY },
      }
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to remove member" });
  }
});
router.post("/:id/boards", async (req, res) => {
  try {
    const accessToken = secretsMap.get("access_token");
    if (!accessToken) {
      return res.status(400).json({ error: "No access token available" });
    }

    const { id } = req.params;
    const { name } = req.body;

    console.log("Creating board in organization:", id);
    console.log("Board name:", name);
    console.log("Using access token:", accessToken);

    const createRes = await axios.post(
      "https://api.trello.com/1/boards/",
      null, 
      {
        params: { 
          key: TRELLO_CONFIG.API_KEY, 
          token: accessToken,
          name: name,
          idOrganization: id,
          defaultLists: false
        }
      }
    );

    console.log("Board created successfully:", createRes.data);
    res.json(createRes.data);
  } catch (err) {
    console.error("Error creating board:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create board" });
  }
});
export default router;
