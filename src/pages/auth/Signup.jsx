import { Link } from "react-router-dom";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">
          Create Account
        </h2>

        <form className="space-y-5">
          <Input label="Full Name" placeholder="Enter your name" />

          <Input label="Email" type="email" placeholder="Enter your email" />

          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
          />

          <Select
            label="Select Role"
            options={[
              { value: "student", label: "Student" },
              { value: "instructor", label: "Instructor" },
            ]}
          />

          <Button className="w-full" variant="success">
            Signup
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
