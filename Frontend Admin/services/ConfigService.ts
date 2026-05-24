
import { Permissions, ConfigResponse } from '../types';

/**
 * Service to handle configuration sync with the backend server.
 * Interacts with the Node.js API to read/write config.json.
 */
export class ConfigService {
  // Use localhost:8889 for local development. 
  // Change this to your production URL when deploying.
  private static API_BASE = 'http://localhost:8889/api';

  /**
   * Fetches the current configuration from the backend server.
   * Triggered on initial app load.
   */
  static async fetchConfig(): Promise<ConfigResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/config`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[ConfigService] Fetch Error:', error);
      throw new Error('Backend server is unreachable. Ensure it is running on port 8889.');
    }
  }

  /**
   * Updates the central configuration on the server.
   * Sends new permissions and version to be written to config.json.
   */
  static async updateConfig(permissions: Permissions, version: number): Promise<ConfigResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/update-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          permissions, 
          config_version: version 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to sync changes to server.');
      }

      return await response.json();
    } catch (error) {
      console.error('[ConfigService] Update Error:', error);
      throw error;
    }
  }
}
