import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

import { auth, db } from "../../firebase/firebase"; // firebase import

function Signup() {
  const navigate = useNavigate();

  // ---------- FORM STATES ----------
  const [name, setName] = useState(""); // store name input
  const [email, setEmail] = useState(""); // store email input
  const [password, setPassword] = useState(""); // store password input
  const [role, setRole] = useState("student"); // default role
  const [loading, setLoading] = useState(false); // button loader

  // ---------- SIGNUP FUNCTION ----------

  async function handleSignup(e) {
    e.preventDefault();

    // Basic validation to ensure all fields are filled
    if (!name.trim() || !email.trim() || password.length < 6) {
      toast.error("Please fill all fields correctly.");
      return;
    }

    setLoading(true);

    const toastId = toast.loading("Creating account...");

    try {
      // 1) Create Firebase Auth user
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCred.user;

      // 2) Set display name in Firebase Auth
      await updateProfile(user, { displayName: name });

      // 3) Save user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: role,
        createdAt: serverTimestamp(),
      });
      toast.dismiss(toastId); // yaha par toast ko dismiss karna hai toast matlab ke loading wala jo create ho rha hai wo dismiss ho jaye
      toast.success("Signup successful!");

      // 4) Redirect user based on role
      if (role === "instructor") navigate("/instructor/dashboard");
      else navigate("/student/dashboard");
    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);

      if (error.code === "auth/email-already-in-use")
        toast.error("Email already in use!");
      else if (error.code === "auth/invalid-email")
        toast.error("Invalid email address!");
      else if (error.code === "auth/weak-password")
        toast.error("Password must be 6+ characters!");
      else toast.error("Signup failed!");
    }

    // Finally, stop loading
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">
          Create Account
        </h2>

        <form className="space-y-5" onSubmit={handleSignup}>
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Select
            label="Select Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: "student", label: "Student" },
              { value: "instructor", label: "Instructor" },
            ]}
          />

          <Button className="w-full" variant="success" type="submit">
            {loading ? "Loading..." : "Signup"}
          </Button>
        </form>

        <p className="text-center text-sm mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
