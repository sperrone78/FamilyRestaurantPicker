import {onCall} from "firebase-functions/v2/https";
import {getAuth} from "firebase-admin/auth";
import {logger} from "firebase-functions";

/**
 * Callable function to set admin claims for the designated admin user
 */
export const setAdminClaims = onCall(async (request) => {
  const {auth} = request;

  // Only allow the specific admin email to call this function
  if (!auth || auth.token.email !== "sperrone78@gmail.com") {
    throw new Error("Access denied. Only admin can set admin claims.");
  }

  try {
    // Set admin claims for the calling user
    await getAuth().setCustomUserClaims(auth.uid, {
      admin: true,
      role: "admin",
    });

    const email = auth.token.email;
    const uid = auth.uid;
    logger.info(`Admin claims set for user: ${email} (${uid})`);

    return {
      success: true,
      message: "Admin claims set successfully",
    };
  } catch (error) {
    logger.error("Error setting admin claims:", error);
    throw new Error("Failed to set admin claims");
  }
});

