import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import StudentDashboard from "./pages/student/StudentDashboard";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Courses from "./pages/student/Courses";
import CourseDetails from "./pages/student/CourseDetails";
import CreateCourse from "./pages/instructor/CreateCourse";
import UploadContent from "./pages/instructor/UploadContent";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageCourses from "./pages/admin/ManageCourses";
import WatchLecture from "./pages/student/WatchLecture";
import Quiz from "./pages/student/Quiz";
import Assignment from "./pages/student/Assignment";
import Progress from "./pages/student/Progress";
import Profile from "./pages/student/Profile";
import ViewSubmissions from "./pages/instructor/ViewSubmissions";
import AddQuiz from "./pages/instructor/AddQuiz";
import NotFound from "./pages/NotFound";


export default function App() {
  return (
    <BrowserRouter>

      {/* Toast Notification System */}
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route path="/student/courses" element={<Courses />} />
        <Route path="/student/course-details" element={<CourseDetails />} />

        <Route path="/instructor/create-course" element={<CreateCourse />} />
        <Route path="/instructor/upload-content" element={<UploadContent />} />

        <Route path="/admin/manage-users" element={<ManageUsers />} />
        <Route path="/admin/manage-courses" element={<ManageCourses />} />

        <Route path="/student/watch" element={<WatchLecture />} />
        <Route path="/student/quiz" element={<Quiz />} />
        <Route path="/student/assignment" element={<Assignment />} />
        <Route path="/student/progress" element={<Progress />} />
        <Route path="/student/profile" element={<Profile />} />

        <Route path="/instructor/submissions" element={<ViewSubmissions />} />
        <Route path="/instructor/add-quiz" element={<AddQuiz />} />
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}
