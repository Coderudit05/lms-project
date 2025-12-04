import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

function Login() {
  const navigate = useNavigate();

  // UI form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      toast.loading("Logging in...");

      // Step 1 → Login using Firebase Auth
      const result = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = result.user; // yaha par ham firebase ka user le rhe hai jo ke login krna chahte hai

      // Step 2 → Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, "users", fbUser.uid));

      if (!userDoc.exists()) {
        toast.error("User profile missing!");
        return;
      }

      const profile = userDoc.data();

      toast.dismiss();
      toast.success("Login successful!");

      // Step 3 → Redirect based on role
      if (profile.role === "student") navigate("/student/dashboard");
      if (profile.role === "instructor") navigate("/instructor/dashboard");
      if (profile.role === "admin") navigate("/admin/dashboard");

    } catch (err) {
      toast.dismiss();
      console.error(err);

      if (err.code === "auth/user-not-found") toast.error("Email does not exist.");
      else if (err.code === "auth/wrong-password") toast.error("Incorrect password.");
      else toast.error("Login failed. Try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />

          <Button className="w-full" variant="primary" type="submit">
            Login
          </Button>
        </form>

        <p className="text-center text-sm mt-5">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600 underline">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
