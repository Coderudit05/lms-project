import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import toast from "react-hot-toast";

/**
 * AuthContext provides:
 *  - user
 *  - profile
 *  - authLoading
 *  - logout()
 */

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // ✅ Use useRef to store the unsubscribe function for onSnapshot
  const unsubProfileRef = useRef(null); // ye line hamne esliye add ki hai taake hum firestore ka listener ko manage kar sakein

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => { // here we are using firebase authentication to check whether the user is logged in or not 
      setAuthLoading(true);

      // ✅ Stop old Firestore listener if exists
      if (unsubProfileRef.current) {
        unsubProfileRef.current();
        unsubProfileRef.current = null;
      }

      if (fbUser) {
        setUser(fbUser);

        try {
          const userRef = doc(db, "users", fbUser.uid); // ye line hamne esliye add ki hai taake hum firestore se user ka document le sakein with the help of uid means unique id which is provided by firebase authentication

          // ✅ Setup real-time listener for profile document
          unsubProfileRef.current = onSnapshot(
            userRef,
            (snap) => {
              if (snap.exists()) {
                setProfile(snap.data());
              } else {
                // If profile doesn't exist, set defaults
                setProfile({
                  uid: fbUser.uid,
                  email: fbUser.email,
                  role: "student",
                  name: fbUser.displayName || fbUser.email,
                });
              }
              setAuthLoading(false);
            },
            (error) => {
              console.error("Realtime profile error:", error);
              toast.error("Failed to sync profile");
              setAuthLoading(false);
            }
          );
        } catch (error) {
          console.error("Failed to setup realtime listener:", error);
          toast.error("Could not load profile");
          setProfile(null);
          setAuthLoading(false);
        }
      } else {
        // ✅ If logged out → clear profile
        setUser(null);
        setProfile(null);

        // Stop listener if any
        if (unsubProfileRef.current) {
          unsubProfileRef.current();
          unsubProfileRef.current = null;
        }
        setAuthLoading(false);
      }
    });
    return () => {
      unsubscribe();
      // ✅ Clean profile listener on unmount
      if (unsubProfileRef.current) {
        unsubProfileRef.current();
      }
    };
  }, []);

  async function logout() {
    setAuthLoading(true); // ← prevent UI flashes while logging out
    try {
      await signOut(auth);
      toast.success("Logged out");
      // onAuthStateChanged listener will clear user/profile and set authLoading=false
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Logout failed");
      setAuthLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, authLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
