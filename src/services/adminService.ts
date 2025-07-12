import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

/**
 * Client-side admin service for managing admin claims
 */
export class AdminService {
  /**
   * Call the Firebase Function to set admin claims for the current user
   */
  static async setAdminClaims(): Promise<{ success: boolean; message: string }> {
    try {
      const setAdminClaimsFunction = httpsCallable(functions, 'setAdminClaims');
      const result = await setAdminClaimsFunction();
      
      return result.data as { success: boolean; message: string };
    } catch (error) {
      console.error('Error calling setAdminClaims function:', error);
      throw new Error('Failed to set admin claims. Please try again.');
    }
  }

  /**
   * Check if the current user has admin privileges
   * This should be called after login to verify admin status
   */
  static async checkAdminStatus(): Promise<boolean> {
    try {
      // This would typically call a Firebase Function to check admin status
      // For now, we'll rely on the client-side token claims
      return false; // Placeholder
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
}