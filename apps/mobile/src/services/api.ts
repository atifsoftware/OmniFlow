/**
 * OmniFlow Mobile API Service
 * Connects React Native (Expo) to NestJS Backend
 */

const API_BASE_URL = 'http://10.0.2.2:4000/api/v1'; // 10.0.2.2 for Android Emulator, localhost for iOS

export const MobileApi = {
  async getProducts() {
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      return await res.json();
    } catch (e: any) {
      return { success: false, data: [] };
    }
  },

  async getHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch (e: any) {
      return { success: false, data: { status: 'offline' } };
    }
  },
};
