import express from "express";
import axios from "axios";
import crypto from "crypto";
import TRELLO_CONFIG from "../config/trello.js";
import { secretsMap } from "./secret.js";

const router = express.Router();

// générer signature OAuth 1.0
function createSignature(method, url, params, secret) {
  const paramString = Object.keys(params)
    .filter(k => params[k] !== undefined)
    .sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");

  const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
  return crypto.createHmac("sha1", secret).update(baseString).digest("base64");
}

// Request token
router.get("/request_token", async (req, res) => {
  const oauthParams = {
    oauth_callback: TRELLO_CONFIG.CALLBACK_URL,
    oauth_consumer_key: TRELLO_CONFIG.API_KEY,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: "1.0",
  };

  const signature = createSignature(
    "POST",
    TRELLO_CONFIG.REQUEST_TOKEN_URL,
    oauthParams,
    `${TRELLO_CONFIG.API_SECRET}&`
  );

  const authHeader =
    "OAuth " +
    Object.entries({ ...oauthParams, oauth_signature: signature })
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ");

  try {
    const { data } = await axios.post(TRELLO_CONFIG.REQUEST_TOKEN_URL, null, {
      headers: { Authorization: authHeader },
    });

    const params = new URLSearchParams(data);
    const oauth_token = params.get("oauth_token");
    const oauth_token_secret = params.get("oauth_token_secret");

    secretsMap.set(oauth_token, oauth_token_secret);

    res.json({ oauth_token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get request token" });
  }
});

// Callback
router.get("/callback", async (req, res) => {
  console.log("Callback params:", req.query);

  const { oauth_token, oauth_verifier } = req.query;

  if (!oauth_token || !oauth_verifier) {
    return res.status(400).send("Missing oauth_token or oauth_verifier");
  }

  const requestTokenSecret = secretsMap.get(oauth_token);
  if (!requestTokenSecret) return res.status(400).send("Request token secret not found");

  const oauthParams = {
    oauth_consumer_key: TRELLO_CONFIG.API_KEY,
    oauth_token,
    oauth_verifier,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: "1.0",
  };

  const signature = createSignature(
    "POST",
    TRELLO_CONFIG.ACCESS_TOKEN_URL,
    oauthParams,
    `${TRELLO_CONFIG.API_SECRET}&${requestTokenSecret}`
  );

  const authHeader =
    "OAuth " +
    Object.entries({ ...oauthParams, oauth_signature: signature })
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ");

  try {
    const { data } = await axios.post(TRELLO_CONFIG.ACCESS_TOKEN_URL, null, {
      headers: { Authorization: authHeader },
    });

    const params = new URLSearchParams(data);
    const access_token = params.get("oauth_token");
    const access_token_secret = params.get("oauth_token_secret");

    secretsMap.set("access_token", access_token);

    res.redirect(`http://localhost:5173/home?token=${access_token}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to get access token");
  }
});



export default router;
