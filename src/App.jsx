import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

import StudentDashboard from "./pages/student/StudentDashboard";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

import Courses from "./pages/student/Courses";
import CourseDetails from "./pages/student/CourseDetails";
import WatchLecture from "./pages/student/WatchLecture";
import Quiz from "./pages/student/Quiz";
import Assignment from "./pages/student/Assignment";
import Progress from "./pages/student/Progress";
import Profile from "./pages/student/Profile";

import CreateCourse from "./pages/instructor/CreateCourse";
import InstructorCourses from "./pages/instructor/InstructorCourses";
import UploadContent from "./pages/instructor/UploadContent";
import ViewSubmissions from "./pages/instructor/ViewSubmissions";
import AddQuiz from "./pages/instructor/AddQuiz";

import ManageUsers from "./pages/admin/ManageUsers";
import ManageCourses from "./pages/admin/ManageCourses";

import NotFound from "./pages/NotFound";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

import InstructorCourseDetails from "./pages/instructor/InstructorCourseDetails";
import DashboardLayout from "./components/layout/DashboardLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />

      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ---------------- STUDENT ROUTES ---------------- */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute role="student">
                <StudentDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/courses"
          element={
            <ProtectedRoute>
              <RoleRoute role="student">
                <DashboardLayout>
                  <Courses />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/course/:courseId"
          element={
            <ProtectedRoute>
              <RoleRoute role="student">
                <CourseDetails />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/watch/:courseId"
          element={
            <ProtectedRoute>
              <RoleRoute role="student">
                <WatchLecture />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/quiz"
          element={
            <ProtectedRoute>
              <RoleRoute role="student">
                <Quiz />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/assignment"
          element={
            <ProtectedRoute>
              <RoleRoute role="student">
                <Assignment />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/progress"
          element={
            <ProtectedRoute>
              <RoleRoute role="student">
                <Progress />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/profile"
          element={
            <ProtectedRoute>
              <RoleRoute role="student">
                <Profile />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ---------------- INSTRUCTOR ROUTES ---------------- */}
        <Route
          path="/instructor/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute role="instructor">
                <InstructorDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/create-course"
          element={
            <ProtectedRoute>
              <RoleRoute role="instructor">
                <CreateCourse />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/courses"
          element={
            <ProtectedRoute>
              <RoleRoute role="instructor">
                <InstructorCourses />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/courses/:courseId"
          element={
            <ProtectedRoute>
              <RoleRoute role="instructor">
                <InstructorCourseDetails />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/upload-content"
          element={
            <ProtectedRoute>
              <RoleRoute role="instructor">
                <UploadContent />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/submissions"
          element={
            <ProtectedRoute>
              <RoleRoute role="instructor">
                <ViewSubmissions />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/add-quiz"
          element={
            <ProtectedRoute>
              <RoleRoute role="instructor">
                <AddQuiz />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ---------------- ADMIN ROUTES ---------------- */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute role="admin">
                <AdminDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/manage-users"
          element={
            <ProtectedRoute>
              <RoleRoute role="admin">
                <ManageUsers />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/manage-courses"
          element={
            <ProtectedRoute>
              <RoleRoute role="admin">
                <ManageCourses />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
