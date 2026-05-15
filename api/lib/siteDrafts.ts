import { MarketplaceSiteDraft } from './types';

const STORAGE_KEY = 'edge-marketplace-site-drafts';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readDraftMap(): Record<string, MarketplaceSiteDraft> {
  if (!canUseStorage()) return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, MarketplaceSiteDraft>;
  } catch (error) {
    console.warn('Failed to read site drafts from localStorage', error);
    return {};
  }
}

function writeDraftMap(map: Record<string, MarketplaceSiteDraft>) {
  if (!canUseStorage()) return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function buildSiteHeaders(draftOrToken?: Pick<MarketplaceSiteDraft, 'siteToken'> | string | null) {
  const siteToken = typeof draftOrToken === 'string' ? draftOrToken : draftOrToken?.siteToken;
  return siteToken
    ? {
        'Content-Type': 'application/json',
        'x-site-token': siteToken,
      }
    : {
        'Content-Type': 'application/json',
      };
}

export function saveSiteDraft(draft: MarketplaceSiteDraft) {
  const map = readDraftMap();
  map[draft.siteId] = {
    ...draft,
    updatedAt: new Date().toISOString(),
  };
  writeDraftMap(map);
  return map[draft.siteId];
}

export function getSiteDraft(siteId: string) {
  return readDraftMap()[siteId] ?? null;
}

export function deleteSiteDraft(siteId: string) {
  const map = readDraftMap();
  delete map[siteId];
  writeDraftMap(map);
}

export function listSiteDrafts() {
  return Object.values(readDraftMap()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function syncSiteDraftToServer(draft: MarketplaceSiteDraft) {
  if (!draft.siteToken) return { persisted: false };

  try {
    const response = await fetch(`/api/sites/${draft.siteId}/draft`, {
      method: 'PUT',
      headers: buildSiteHeaders(draft),
      body: JSON.stringify(draft),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return await response.json();
  } catch (error) {
    console.warn('Failed to sync site draft to server', error);
    return { persisted: false, error };
  }
}

export async function fetchSiteDraftFromServer(siteId: string, siteToken: string): Promise<MarketplaceSiteDraft | null> {
  try {
    const response = await fetch(`/api/sites/${siteId}`, {
      method: 'GET',
      headers: buildSiteHeaders(siteToken),
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 403) return null;
      throw new Error(await response.text());
    }

    const data = await response.json();
    return data.draft || null;
  } catch (error) {
    console.warn('Failed to fetch site draft from server', error);
    return null;
  }
}

// Server-first draft hydration: try server first, fall back to localStorage
export async function rehydrateSiteDraft(siteId: string, siteToken: string): Promise<MarketplaceSiteDraft | null> {
  // Try server first
  const serverDraft = await fetchSiteDraftFromServer(siteId, siteToken);
  if (serverDraft) {
    // Update localStorage with server version
    saveSiteDraft(serverDraft);
    return serverDraft;
  }

  // Fall back to localStorage
  const localDraft = getSiteDraft(siteId);
  if (localDraft && localDraft.siteToken === siteToken) {
    return localDraft;
  }

  return null;
}
