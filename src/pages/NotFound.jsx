import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">

      <h1 className="text-9xl font-bold text-blue-600">404</h1>

      <h2 className="text-3xl font-semibold mt-4">Page Not Found</h2>

      <p className="text-gray-600 mt-2 text-center max-w-md">
        The page you are looking for doesn’t exist or has been moved.
      </p>

      <Link to="/" className="mt-6">
        <Button>Go Home</Button>
      </Link>

    </div>
  );
}

export default NotFound;
