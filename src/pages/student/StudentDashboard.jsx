import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/firebase";
import {
  collection, // Ye collection function Firestore se collection reference lene ke liye use hota hai
  query, // Ye query function Firestore me queries banane ke liye use hota hai like filtering, sorting etc.
  where, // Ye where function queries me conditions lagane ke liye use hota hai
  onSnapshot, // Ye onSnapshot function real-time listeners set karne ke liye use hota hai
  doc, // Ye doc function Firestore se specific document reference lene ke liye use hota hai matlab kisi specific document ko point karne ke liye
  getDoc, // Ye getDoc function Firestore se specific document ka data ek baar lene ke liye use hota hai
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageWrapper from "../../components/ui/PageWrapper";

/**
 * ============================================
 * WHY THIS COMPONENT EXISTS
 * ============================================
 * 
 * PURPOSE:
 * - Show student's enrolled courses at a glance
 * - Display key statistics (enrolled count, progress, certificates)
 * - Provide quick access to continue learning
 * 
 * FIRESTORE COLLECTIONS USED:
 * 1. enrollments (READ) - Get all courses student enrolled in
 * 2. courses (READ) - Get course details for each enrollment
 * 
 * DATA FLOW:
 * Student logs in → Fetch enrollments → Join with courses → Display stats
 */

function StudentDashboard() {
  const { profile } = useAuth(); // Get logged-in student info
  const navigate = useNavigate(); // For navigation to course watch page 

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  /**
   * WHY: Store enrolled courses with full details
   * 
   * STRUCTURE: Each item will be:
   * {
   *   enrollmentId: "abc123",
   *   courseId: "course-xyz",
   *   courseTitle: "React Fundamentals",
   *   courseCategory: "Development",
   *   courseThumbnail: "https://...",
   *   instructorName: "John Doe",
   *   progress: 45, (percentage)
   *   enrolledAt: timestamp,
   *   totalModules: 10,
   *   completedModules: ["mod1", "mod2"]
   * }
   * 
   * WHY NOT SEPARATE ARRAYS?
   * - Joining data here simplifies rendering
   * - Single source of truth
   * - Easier to sort and filter
   */
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  /**
   * WHY: Show loading state while fetching data
   * 
   * PREVENTS:
   * - Flash of "0 courses" before data loads
   * - User thinking they have no enrollments
   * - Poor UX during initial load
   */
  const [loading, setLoading] = useState(true);

  /**
   * WHY: Store calculated statistics
   * 
   * ALTERNATIVE: Calculate in render (works but less efficient)
   * BENEFIT: Calculate once when data changes, not on every render
   */
  const [stats, setStats] = useState({
    enrolledCount: 0,
    overallProgress: 0,
    certificatesEarned: 0,
  });

  // ============================================
  // FETCH ENROLLMENTS + COURSES
  // ============================================

  useEffect(() => {
    /**
     * WHY THIS EFFECT RUNS:
     * - On component mount
     * - When profile.uid changes (login/logout)
     * 
     * WHY NOT RUN ON EVERY RENDER?
     * - Would cause infinite loops
     * - Unnecessary Firestore reads (costs money)
     * - Poor performance
     */

    if (!profile?.uid) {
      setLoading(false);
      return; // Don't fetch if user not logged in
    }

    /**
     * STEP 1: Query enrollments collection
     * 
     * WHY USE onSnapshot (REAL-TIME)?
     * - If student enrolls in new course in another tab → auto updates here
     * - If instructor deletes a course → enrollment updates automatically
     * - If progress updates → dashboard reflects immediately
     * 
     * ALTERNATIVE: getDocs() (one-time fetch)
     * - Would require manual refresh
     * - No automatic updates
     * - Stale data problem
     */

    const enrollmentsRef = collection(db, "enrollments"); // Yaha par hamne enrollments collection ka reference liya hai iska matlab hai ke hum firestore ke us collection se data fetch karenge jismein student ke enrollments store hote hain
    const q = query(enrollmentsRef, where("userId", "==", profile.uid));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        /**
         * SNAPSHOT CONTAINS:
         * - All enrollment documents for this student
         * - Each doc has: userId, courseId, enrolledAt, progress, completedModules
         * 
         * PROBLEM: We don't have course details (title, instructor, thumbnail)
         * SOLUTION: Fetch each course document separately
         */

        if (snapshot.empty) {
          /**
           * WHY CHECK EMPTY?
           * - New students have no enrollments
           * - Show appropriate empty state
           * - Prevent errors trying to map over nothing
           */
          setEnrolledCourses([]);
          setStats({
            enrolledCount: 0,
            overallProgress: 0,
            certificatesEarned: 0,
          });
          setLoading(false);
          return;
        }

        /**
         * STEP 2: For each enrollment, fetch the course details
         * 
         * WHY USE Promise.all()?
         * - Fetches all courses in parallel (faster)
         * - Waits for all to complete before proceeding
         * 
         * ALTERNATIVE: Loop with await (slower, sequential)
         * 
         * EXAMPLE:
         * If student enrolled in 5 courses:
         * - Promise.all: ~1 second (parallel)
         * - Sequential loop: ~5 seconds (one by one)
         */

        const coursesData = await Promise.all(
          snapshot.docs.map(async (enrollmentDoc) => {
            const enrollmentData = enrollmentDoc.data(); // yaha par ye code ka matlab hai ke hum har enrollment document ka data le rahe hain jismein userId, courseId, enrolledAt, progress, completedModules etc. hote hain

            /**
             * FETCH COURSE DOCUMENT
             * 
             * WHY getDoc() NOT onSnapshot()?
             * - We're already inside a real-time listener
             * - Course details rarely change during session
             * - Reduces number of active listeners (better performance)
             * - Firestore has listener limits (~100 per client)
             */

            // Syntax : doc(db, "collectionName", "documentId")
            const courseRef = doc(db, "courses", enrollmentData.courseId); // yaha par humne course collection se specific course document ka reference liya hai jiska id enrollmentData.courseId ke barabar hai
            const courseSnap = await getDoc(courseRef); // ye line ka matlab hai ke humne firestore se us specific course document ka data ek baar ke liye fetch kiya hai

            if (!courseSnap.exists()) {
              /**
               * WHY CHECK EXISTS?
               * - Instructor might have deleted the course
               * - CourseId might be invalid
               * - Prevents errors trying to access null data
               * 
               * WHAT TO DO?
               * - Return null and filter out later
               * - OR show "Course no longer available"
               */
              return null; // Course deleted
            }

            const courseData = courseSnap.data();

            /**
             * CALCULATE PROGRESS PERCENTAGE
             * 
             * FORMULA: (completed modules / total modules) * 100
             * 
             * WHY THIS CALCULATION?
             * - Simple, accurate measure of completion
             * - Visual (progress bar)
             * - Easy for students to understand
             * 
             * EDGE CASES:
             * - No modules: 0% (prevent division by zero)
             * - No completed modules: 0%
             * - All completed: 100%
             */

            const totalModules = courseData.modules?.length || 0;
            const completedCount = enrollmentData.completedModules?.length || 0;
            const progressPercentage =
              totalModules > 0
                ? Math.round((completedCount / totalModules) * 100)
                : 0;

            /**
             * RETURN COMBINED DATA
             * 
             * WHY COMBINE?
             * - Easier to render in UI
             * - Single object has all needed info
             * - No need to lookup course details when rendering
             */

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
              completedModules: enrollmentData.completedModules || [],
            };
          })
        );

        /**
         * FILTER OUT NULL VALUES
         * 
         * WHY?
         * - Some courses might have been deleted (returned null above)
         * - Don't show "undefined course" in UI
         * - Keep data clean
         */
        const validCourses = coursesData.filter((course) => course !== null);

        /**
         * SORT BY ENROLLMENT DATE (NEWEST FIRST)
         * 
         * WHY SORT?
         * - Show most recently enrolled courses at top
         * - Better UX (see what you just enrolled in)
         * - "Recent Courses" section makes sense
         * 
         * WHY USE toMillis()?
         * - Firestore timestamps need conversion for sorting
         * - Returns number (milliseconds since epoch)
         * - Easy to compare with standard operators
         */
        validCourses.sort((a, b) => {
          const aTime = a.enrolledAt?.toMillis?.() || 0;
          const bTime = b.enrolledAt?.toMillis?.() || 0;
          return bTime - aTime; // Descending (newest first)
        });

        setEnrolledCourses(validCourses);

        /**
         * CALCULATE STATISTICS
         * 
         * WHY CALCULATE HERE?
         * - Data just loaded, perfect time to compute
         * - Avoid recalculating on every render
         * - Store in state for easy access
         */

        // 1. ENROLLED COUNT (Easy: just length of array)
        const enrolledCount = validCourses.length;

        // 2. OVERALL PROGRESS (Average of all course progress)
        /**
         * WHY AVERAGE?
         * - If 3 courses: 50%, 60%, 80% → Average = 63.3%
         * - Represents overall learning progress
         * - Single number easy to display
         * 
         * ALTERNATIVE: Total modules completed / total modules across all courses
         * - More accurate but harder to understand
         * - Our way is simpler for students
         */
        const overallProgress =
          enrolledCount > 0
            ? Math.round(
                validCourses.reduce((sum, course) => sum + course.progress, 0) /
                  enrolledCount
              )
            : 0;

        // 3. CERTIFICATES (Students who completed 100% should get certificate)
        /**
         * WHY COUNT 100% COURSES?
         * - Certificate = course completion
         * - Simple rule: 100% progress = 1 certificate
         * 
         * FUTURE ENHANCEMENT:
         * - Create actual "certificates" collection
         * - Issue certificate document when course completed
         * - This is just counting for now
         */
        const certificatesEarned = validCourses.filter(
          (course) => course.progress === 100
        ).length;

        setStats({
          enrolledCount,
          overallProgress,
          certificatesEarned,
        });

        setLoading(false);
      },
      (error) => {
        /**
         * ERROR HANDLING
         * 
         * COMMON ERRORS:
         * - Permission denied (Firestore rules)
         * - Network offline
         * - Invalid query
         * 
         * WHAT TO DO:
         * - Log for debugging
         * - Show user-friendly message
         * - Set loading false (don't freeze UI)
         */
        console.error("Error fetching enrollments:", error);
        setLoading(false);
      }
    );

    /**
     * CLEANUP FUNCTION
     * 
     * WHY RETURN unsubscribe?
     * - Component might unmount (user navigates away)
     * - Must stop listening to prevent memory leaks
     * - React automatically calls this on unmount
     * 
     * WHAT HAPPENS IF WE DON'T?
     * - Listener keeps running even after component gone
     * - Memory leak
     * - Unnecessary Firestore reads
     * - App gets slower over time
     */
    return () => unsubscribe();
  }, [profile?.uid]);

  // ============================================
  // NAVIGATION HANDLER
  // ============================================

  const handleContinueLearning = (courseId) => {
    /**
     * WHY SEPARATE FUNCTION?
     * - Could do inline, but this is cleaner
     * - Easy to add analytics tracking here
     * - Can add checks before navigating
     * 
     * WHERE IT GOES:
     * /student/watch/:courseId
     * - WatchLecture component
     * - Student continues from last module
     */
    navigate(`/student/watch/${courseId}`);
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    /**
     * WHY SHOW LOADING?
     * - Prevents flash of "0 courses"
     * - Better UX during data fetch
     * - User knows something is happening
     * 
     * ALTERNATIVE: Skeleton screens (even better UX)
     * - Shows placeholder cards while loading
     * - Makes app feel faster
     */
    return (
      <DashboardLayout>
        <PageWrapper title="Student Dashboard">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading your dashboard...</p>
          </div>
        </PageWrapper>
      </DashboardLayout>
    );
  }

  // ============================================
  // RENDER UI (YOUR EXACT STRUCTURE)
  // ============================================

  return (
    <DashboardLayout>
      <PageWrapper title="Student Dashboard">
        {/* Stats Section - UPDATED WITH REAL DATA */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {/* Stat Card 1: Enrolled Courses */}
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold">{stats.enrolledCount}</h2>
            <p className="text-gray-600">Enrolled Courses</p>
          </div>

          {/* Stat Card 2: Overall Progress */}
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold">{stats.overallProgress}%</h2>
            <p className="text-gray-600">Overall Progress</p>
          </div>

          {/* Stat Card 3: Certificates */}
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold">{stats.certificatesEarned}</h2>
            <p className="text-gray-600">Certificates Earned</p>
          </div>
        </div>

        {/* Recent Courses Section - UPDATED WITH REAL DATA */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Courses</h2>

          {enrolledCourses.length === 0 ? (
            /**
             * EMPTY STATE
             * 
             * WHY SHOW THIS?
             * - New students have no enrollments
             * - Clear message about what to do next
             * - Encourages action
             */
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No enrolled courses yet.</p>
              <button
                onClick={() => navigate("/student/courses")}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Browse Courses
              </button>
            </div>
          ) : (
            /**
             * COURSES GRID
             * 
             * WHY SLICE(0, 3)?
             * - Show only last 3 recent courses
             * - Keeps dashboard clean
             * - User can see more in "My Courses" page
             * 
             * ALREADY SORTED:
             * - validCourses sorted by enrolledAt (newest first)
             * - So slice(0,3) gives 3 most recent
             */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.slice(0, 3).map((course) => (
                <div
                  key={course.enrollmentId}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
                >
                  {/* Course Thumbnail */}
                  {course.courseThumbnail && (
                    <div className="mb-3">
                      <img
                        src={course.courseThumbnail}
                        alt={course.courseTitle}
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          /**
                           * IMAGE ERROR HANDLING
                           * 
                           * WHY NEEDED?
                           * - URL might be broken
                           * - Image might be deleted
                           * - Prevents broken image icon
                           * 
                           * SOLUTION: Hide image on error
                           */
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Course Title */}
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {course.courseTitle}
                  </h3>

                  {/* Instructor Name */}
                  <p className="text-sm text-gray-600 mb-2">
                    By {course.instructorName || "Unknown"}
                  </p>

                  {/* Category Badge */}
                  {course.courseCategory && (
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded mb-3">
                      {course.courseCategory}
                    </span>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-gray-800">
                        {course.progress}%
                      </span>
                    </div>
                    {/**
                     * PROGRESS BAR VISUALIZATION
                     * 
                     * HOW IT WORKS:
                     * - Outer div: gray background (total)
                     * - Inner div: blue fill (completed)
                     * - Width set dynamically: {course.progress}%
                     * 
                     * WHY INLINE STYLE?
                     * - Dynamic width needs inline style
                     * - Tailwind can't generate arbitrary percentages
                     */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Continue Learning Button */}
                  <button
                    onClick={() => handleContinueLearning(course.courseId)}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Continue Learning
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* View All Link */}
          {enrolledCourses.length > 3 && (
            /**
             * WHY SHOW "VIEW ALL"?
             * - User has more than 3 courses
             * - Dashboard shows only 3 (keeps it clean)
             * - Link to see complete list
             * 
             * WHERE IT GOES:
             * - Could go to /student/my-courses
             * - Or /student/progress (shows all with details)
             */
            <div className="text-center mt-6">
              <button
                onClick={() => navigate("/student/progress")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Courses →
              </button>
            </div>
          )}
        </div>
      </PageWrapper>
    </DashboardLayout>
  );
}

export default StudentDashboard;