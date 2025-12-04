import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageWrapper from "../../components/ui/PageWrapper";

/**
 * ============================================
 * WHY THIS COMPONENT EXISTS
 * ============================================
 * 
 * PURPOSE:
 * - Allow students to view and edit their profile
 * - Update display name
 * - Show account information (email, role)
 * 
 * FIRESTORE COLLECTIONS USED:
 * 1. users (READ/WRITE) - User profile data
 */

function Profile() {
  const { profile } = useAuth();

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  /**
   * WHY LOCAL STATE FOR NAME?
   * - User types in input field
   * - Don't update Firestore on every keystroke
   * - Only save when they click "Save Changes"
   */
  const [name, setName] = useState(profile?.name || "");

  /**
   * WHY LOADING STATE?
   * - Disable button during save operation
   * - Show user that something is happening
   * - Prevent double submissions
   */
  const [savingProfile, setSavingProfile] = useState(false);

  // ============================================
  // SYNC PROFILE DATA WHEN IT CHANGES
  // ============================================

  /**
   * WHY USE useEffect WITH PROFILE AS DEPENDENCY?
   * - AuthContext provides profile via real-time listener
   * - When profile updates, sync with local state
   * - Keeps form fields in sync with database
   */
  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile]);

  // ============================================
  // SAVE PROFILE CHANGES (NAME)
  // ============================================

  async function handleSaveProfile(e) {
    e.preventDefault();

    if (!profile?.uid) {
      toast.error("User not authenticated");
      return;
    }

    /**
     * VALIDATE NAME
     * 
     * WHY CHECK?
     * - Empty names look bad in UI
     * - Other users see this name
     * - Prevent accidental deletion
     */
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setSavingProfile(true);

    try {
      /**
       * UPDATE NAME IN FIRESTORE
       * 
       * WHAT HAPPENS NEXT:
       * 1. Firestore document updates
       * 2. AuthContext real-time listener fires
       * 3. profile.name auto-updates throughout app
       * 4. Navbar, dashboard, etc. show new name
       */
      const userRef = doc(db, "users", profile.uid);
      await updateDoc(userRef, {
        name: name.trim(),
      });

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  // ============================================
  // LOADING STATE
  // ============================================

  if (!profile) {
    return (
      <DashboardLayout>
        <PageWrapper title="Profile">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </PageWrapper>
      </DashboardLayout>
    );
  }

  // ============================================
  // RENDER UI
  // ============================================

  return (
    <DashboardLayout>
      <PageWrapper title="Your Profile">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-md rounded-lg p-6">
            {/* ========================================
                PROFILE AVATAR SECTION
                ======================================== */}
            <div className="flex flex-col items-center mb-6">
              {/* Avatar with Initial */}
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-3 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {profile.name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <p className="text-sm text-gray-500">Profile Avatar</p>
            </div>

            {/* ========================================
                PROFILE FORM
                ======================================== */}
            <form onSubmit={handleSaveProfile}>
              {/* Name Field */}
              <div className="mb-4">
                <label className="font-medium mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                  disabled={savingProfile}
                />
              </div>

              {/* Email Field (Read-only) */}
              <div className="mb-4">
                <label className="font-medium mb-1 block">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border rounded-lg bg-gray-200 cursor-not-allowed"
                  disabled
                  value={profile.email || ""}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Role Field (Read-only) */}
              <div className="mb-4">
                <label className="font-medium mb-1 block">Role</label>
                <input
                  className="w-full px-4 py-2 border rounded-lg bg-gray-200 cursor-not-allowed capitalize"
                  disabled
                  value={profile.role || "student"}
                />
              </div>

              {/* User ID (for reference) */}
              <div className="mb-4">
                <label className="font-medium mb-1 block">User ID</label>
                <input
                  className="w-full px-4 py-2 border rounded-lg bg-gray-200 cursor-not-allowed text-sm font-mono"
                  disabled
                  value={profile.uid || ""}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your unique identifier
                </p>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={savingProfile}
                className="mt-4 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      </PageWrapper>
    </DashboardLayout>
  );
}

export default Profile;
