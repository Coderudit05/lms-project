import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageWrapper from "../../components/ui/PageWrapper";

/**
 * ============================================
 * WHY THIS COMPONENT EXISTS
 * ============================================
 * 
 * PURPOSE:
 * - Show all enrolled courses with progress
 * - Visual progress bars for each course
 * - Quick navigation to continue learning
 * 
 * FIRESTORE COLLECTIONS USED:
 * 1. enrollments (READ) - Get student's enrollments
 * 2. courses (READ) - Get course details
 * 
 * DATA FLOW:
 * Load enrollments → Fetch course details → Display with progress
 */

function Progress() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================
  // FETCH ENROLLED COURSES WITH PROGRESS
  // ============================================

  useEffect(() => {
    if (!profile?.uid) {
      setLoading(false);
      return;
    }

    /**
     * REAL-TIME LISTENER FOR ENROLLMENTS
     * 
     * WHY REAL-TIME?
     * - If student completes module in another tab → auto updates here
     * - Progress changes reflect immediately
     * - Better UX than manual refresh
     */
    const enrollmentsRef = collection(db, "enrollments");
    const q = query(enrollmentsRef, where("userId", "==", profile.uid));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        if (snapshot.empty) {
          setEnrolledCourses([]);
          setLoading(false);
          return;
        }

        /**
         * FETCH COURSE DETAILS FOR EACH ENROLLMENT
         * 
         * WHY Promise.all?
         * - Fetch all courses in parallel (faster)
         * - Wait for all to complete before updating state
         */
        const coursesData = await Promise.all(
          snapshot.docs.map(async (enrollmentDoc) => {
            const enrollmentData = enrollmentDoc.data();

            // Fetch course details
            const courseRef = doc(db, "courses", enrollmentData.courseId);
            const courseSnap = await getDoc(courseRef);

            if (!courseSnap.exists()) {
              return null; // Course might be deleted
            }

            const courseData = courseSnap.data();

            /**
             * CALCULATE PROGRESS
             * 
             * FORMULA: (completed modules / total modules) * 100
             */
            const totalModules = courseData.modules?.length || 0;
            const completedCount = enrollmentData.completedModules?.length || 0;
            const progressPercentage =
              totalModules > 0
                ? Math.round((completedCount / totalModules) * 100)
                : 0;

            return {
              enrollmentId: enrollmentDoc.id,
              courseId: enrollmentData.courseId,
              courseTitle: courseData.title,
              courseCategory: courseData.category,
              courseThumbnail: courseData.thumbnail,
              instructorName: courseData.createdByName,
              progress: progressPercentage,
              enrolledAt: enrollmentData.enrolledAt,
              totalModules: totalModules,
              completedModules: completedCount,
            };
          })
        );

        // Filter out null values (deleted courses)
        const validCourses = coursesData.filter((course) => course !== null);

        /**
         * SORT BY PROGRESS (LOWEST FIRST)
         * 
         * WHY?
         * - Show courses that need attention first
         * - Incomplete courses at top
         * - Completed courses at bottom
         */
        validCourses.sort((a, b) => a.progress - b.progress);

        setEnrolledCourses(validCourses);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching progress:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [profile?.uid]);

  // ============================================
  // NAVIGATION HANDLER
  // ============================================

  const handleContinueLearning = (courseId) => {
    navigate(`/student/watch/${courseId}`);
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <DashboardLayout>
        <PageWrapper title="Your Progress">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading your progress...</p>
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
      <PageWrapper title="Your Progress">
        <div className="max-w-6xl mx-auto">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {/* Total Courses */}
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h3 className="text-2xl font-bold text-blue-600">
                {enrolledCourses.length}
              </h3>
              <p className="text-gray-600">Enrolled Courses</p>
            </div>

            {/* Completed Courses */}
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h3 className="text-2xl font-bold text-green-600">
                {enrolledCourses.filter((c) => c.progress === 100).length}
              </h3>
              <p className="text-gray-600">Completed</p>
            </div>

            {/* In Progress */}
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h3 className="text-2xl font-bold text-orange-600">
                {
                  enrolledCourses.filter(
                    (c) => c.progress > 0 && c.progress < 100
                  ).length
                }
              </h3>
              <p className="text-gray-600">In Progress</p>
            </div>
          </div>

          {/* Empty State */}
          {enrolledCourses.length === 0 ? (
            <div className="bg-white shadow-md rounded-lg p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">
                You haven't enrolled in any courses yet.
              </p>
              <button
                onClick={() => navigate("/student/courses")}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Browse Courses
              </button>
            </div>
          ) : (
            /* Progress Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledCourses.map((course) => (
                <div
                  key={course.enrollmentId}
                  className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
                >
                  {/* Course Thumbnail */}
                  {course.courseThumbnail && (
                    <div className="mb-4">
                      <img
                        src={course.courseThumbnail}
                        alt={course.courseTitle}
                        className="w-full h-40 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Course Title */}
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">
                    {course.courseTitle}
                  </h2>

                  {/* Instructor */}
                  <p className="text-sm text-gray-600 mb-2">
                    By {course.instructorName || "Instructor"}
                  </p>

                  {/* Category Badge */}
                  {course.courseCategory && (
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded mb-3">
                      {course.courseCategory}
                    </span>
                  )}

                  {/* Modules Info */}
                  <p className="text-sm text-gray-600 mb-3">
                    {course.completedModules} / {course.totalModules} modules
                    completed
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-gray-800">
                        {course.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          course.progress === 100
                            ? "bg-green-600"
                            : course.progress >= 50
                            ? "bg-blue-600"
                            : "bg-orange-500"
                        }`}
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleContinueLearning(course.courseId)}
                    className={`mt-4 w-full py-2 text-white rounded-lg transition ${
                      course.progress === 100
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {course.progress === 100
                      ? "Review Course"
                      : course.progress === 0
                      ? "Start Learning"
                      : "Continue Learning"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageWrapper>
    </DashboardLayout>
  );
}

export default Progress;
