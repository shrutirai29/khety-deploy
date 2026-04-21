const isLocalHost = (hostname = "") =>
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "::1";

const isPrivateNetworkHost = (hostname = "") =>
  /^10\./.test(hostname) ||
  /^192\.168\./.test(hostname) ||
  /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);

const buildPortUrl = (port) => {
  if (typeof window === "undefined") {
    return null;
  }

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:${port}`;
};

const unique = (values) => [...new Set(values.filter(Boolean))];

const getApiBaseCandidates = () => {
  if (process.env.REACT_APP_API_URL) {
    return [process.env.REACT_APP_API_URL];
  }

  if (typeof window === "undefined") {
    return ["http://localhost:5000"];
  }

  const { origin, hostname, port } = window.location;
  const candidates = [];

  if (port === "3000" && isLocalHost(hostname)) {
    candidates.push("");
    candidates.push("http://localhost:5000");
  } else if (!port || port === "5000") {
    candidates.push(origin);
  } else {
    candidates.push(buildPortUrl("5000"));
    candidates.push(origin);
  }

  if (isLocalHost(hostname) && hostname !== "localhost") {
    candidates.push("http://localhost:5000");
  }

  if (isPrivateNetworkHost(hostname)) {
    candidates.push(`http://${hostname}:5000`);
  }

  return unique(candidates);
};

const getMlBaseCandidates = () => {
  if (process.env.REACT_APP_ML_API_URL) {
    return [process.env.REACT_APP_ML_API_URL];
  }

  if (typeof window === "undefined") {
    return ["http://localhost:5001"];
  }

  const { origin, hostname, port } = window.location;
  const candidates = [];

  if (!port || port === "5001") {
    candidates.push(origin);
  } else {
    candidates.push(buildPortUrl("5001"));
    candidates.push(origin);
  }

  if (isLocalHost(hostname) && hostname !== "localhost") {
    candidates.push("http://localhost:5001");
  }

  if (isPrivateNetworkHost(hostname)) {
    candidates.push(`http://${hostname}:5001`);
  }

  return unique(candidates);
};

export const API_BASE_URL = getApiBaseCandidates()[0];
export const ML_API_BASE_URL = getMlBaseCandidates()[0];

async function readApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await response.json();
    return {
      ok: response.ok,
      response,
      data,
      isHtml: false
    };
  }

  const text = await response.text();
  return {
    ok: response.ok,
    response,
    data: text,
    isHtml: text.includes("<!DOCTYPE") || text.includes("<html"),
    text
  };
}

export async function parseApiResponse(response) {
  const parsed = await readApiResponse(response);

  if (!parsed.isHtml && typeof parsed.data === "object") {
    return parsed.data;
  }

  throw new Error(
    parsed.isHtml
      ? "Unexpected server response. Please check that the backend is running."
      : parsed.text || "Unexpected server response"
  );
}

export async function apiFetch(path, options = {}) {
  const authToken = sessionStorage.getItem("authToken");
  const headers = new Headers(options.headers || {});

  if (authToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const apiBases = getApiBaseCandidates();
  let lastError = null;

  for (const baseUrl of apiBases) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers
      });

      const parsed = await readApiResponse(response);

      if (parsed.isHtml) {
        lastError = new Error("Unexpected server response. Please check that the backend is running.");
        continue;
      }

      if (!parsed.ok) {
        throw new Error(parsed.data?.error || parsed.data?.message || "Request failed");
      }

      return parsed.data;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    lastError?.message || "Unable to reach the backend. Please check that the server is running."
  );
}
