// In production (Vercel), API is on same origin, so use empty string or relative paths
// In development, use explicit URL
import { API_URL } from './api-config';

export interface ApiError {
  error: string;
  details?: any;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw error;
    }

    return response.json();
  }

  // Proofs
  async getProof(multihash: string) {
    return this.request(`/p/${multihash}`);
  }

  async registerProof(proof: any, multihash: string) {
    return this.request('/api/proofs', {
      method: 'POST',
      body: JSON.stringify({ proof, multihash }),
    });
  }

  async getProofFromWellKnown(hash: string) {
    return this.request(`/.well-known/cardproofs/${hash}.json`);
  }

  // Keys
  async getKeys(handle: string) {
    return this.request(`/me/${handle}/keys.json`);
  }

  async rotateKey(publicKeyBase64: string) {
    return this.request('/api/me/keys/rotate', {
      method: 'POST',
      body: JSON.stringify({ publicKeyBase64 }),
    });
  }

  // Proposals
  async createProposal(data: {
    title: string;
    url?: string;
    section: string;
    authorship: string;
    metadata?: any;
  }) {
    return this.request('/api/me/proposals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProposals() {
    return this.request('/api/me/proposals');
  }

  async approveProposal(id: string) {
    return this.request(`/api/me/proposals/${id}/approve`, {
      method: 'POST',
    });
  }

  async rejectProposal(id: string) {
    return this.request(`/api/me/proposals/${id}/reject`, {
      method: 'POST',
    });
  }

  // Items
  async getItems() {
    return this.request('/api/me/items');
  }

  async createItem(section: string, data: any) {
    return this.request(`/api/me/items/sections/${section}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateItem(id: string, data: any) {
    return this.request(`/api/me/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteItem(id: string) {
    return this.request(`/api/me/items/${id}`, {
      method: 'DELETE',
    });
  }

  // Card
  async getCard(handle: string) {
    return this.request(`/me/${handle}/card.json`);
  }
}

export const apiClient = new ApiClient();

