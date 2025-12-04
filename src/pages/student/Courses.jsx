import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/firebase";
import {
  collection,
  query,
  where,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom"; // ✅ ADDED: For navigation
import Loader from "../../components/ui/Loader";

/**
 * WHY THIS FILE EXISTS:
 * - Students need to browse available courses
 * - Students need to enroll in courses
 * - We need to check if they're already enrolled
 *
 * FIRESTORE COLLECTIONS USED:
 * - courses (READ) - fetch published courses
 * - enrollments (WRITE) - create new enrollment
 * - enrollments (READ) - check existing enrollments
 */

const Courses = () => {
  const { profile } = useAuth();
  const navigate = useNavigate(); // ✅ ADDED: For navigating to course details

  // ========================================
  // STATE MANAGEMENT
  // ========================================

  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // ========================================
  // FETCH COURSES FROM FIRESTORE
  // ========================================

  useEffect(() => {
    if (!profile?.uid) {
      return;
    }

    const coursesRef = collection(db, "courses");
    const q = query(coursesRef, where("status", "==", "published"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const coursesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCourses(coursesData);
        setFilteredCourses(coursesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [profile?.uid]);

  // ========================================
  // FETCH ENROLLED COURSES
  // ========================================

  useEffect(() => {
    if (!profile?.uid) return;

    const enrollmentsRef = collection(db, "enrollments");
    const q = query(enrollmentsRef, where("userId", "==", profile.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const enrolledSet = new Set(
        snapshot.docs.map((doc) => doc.data().courseId)
      );
      setEnrolledCourses(enrolledSet);
    });

    return () => unsubscribe();
  }, [profile?.uid]);

  // ========================================
  // FILTER BY CATEGORY
  // ========================================

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);

    if (category === "All") {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter((course) => course.category === category);
      setFilteredCourses(filtered);
    }
  };

  // ========================================
  // SEARCH FUNCTIONALITY
  // ========================================

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = courses.filter(
      (course) =>
        course.title?.toLowerCase().includes(term) ||
        course.description?.toLowerCase().includes(term)
    );

    setFilteredCourses(filtered);
  };

  // ========================================
  // ENROLLMENT LOGIC
  // ========================================

  const handleEnroll = async (courseId, courseName) => {
    if (!profile?.uid) {
      toast.error("Please login to enroll");
      return;
    }

    if (enrolledCourses.has(courseId)) {
      toast.info("You are already enrolled in this course");
      return;
    }

    try {
      await addDoc(collection(db, "enrollments"), {
        userId: profile.uid,
        courseId: courseId,
        enrolledAt: serverTimestamp(),
        progress: 0,
        completedModules: [],
      });

      toast.success(`Successfully enrolled in ${courseName}!`);
    } catch (error) {
      console.error("Error enrolling:", error);
      toast.error("Failed to enroll. Please try again.");
    }
  };

  // ========================================
  // ✅ NEW: NAVIGATION TO COURSE DETAILS
  // ========================================

  /**
   * WHY THIS FUNCTION?
   * - Students should be able to preview course before enrolling
   * - Shows course description, modules, instructor info
   * - Better decision making before enrollment
   *
   * WHERE IT GOES:
   * - /student/course-details/:courseId
   * - CourseDetails.jsx component
   */
  const handleViewDetails = (courseId) => {
    navigate(`/student/course/${courseId}`);
  };

  // ========================================
  // LOADING STATE
  // ========================================

  if (loading) {
    return <Loader />;
  }

  // ========================================
  // RENDER UI
  // ========================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Available Courses</h1>
        <p className="text-gray-600 mt-2">
          Browse and enroll in courses to start learning
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Category Filters */}
      <div className="mb-8 flex flex-wrap gap-3">
        {["All", "Development", "Business", "Design", "Marketing"].map(
          (category) => (
            <button
              key={category}
              onClick={() => handleCategoryFilter(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-blue-500"
              }`}
            >
              {category}
            </button>
          )
        )}
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No courses found matching your criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourses.has(course.id);

            return (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                {/* Course Thumbnail */}
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400x300?text=Course";
                    }}
                  />
                )}

                <div className="p-6">
                  {/* Category Badge */}
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full mb-3">
                    {course.category}
                  </span>

                  {/* Course Title */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {course.title}
                  </h3>

                  {/* Course Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Instructor */}
                  <p className="text-sm text-gray-500 mb-4">
                    By {course.createdByName || "Instructor"}
                  </p>

                  {/* Module Count */}
                  <p className="text-sm text-gray-500 mb-4">
                    {course.modules?.length || 0} modules
                  </p>

                  {/* ========================================
                      ✅ UPDATED: BUTTONS SECTION
                      ======================================== */}

                  {/* 
                    WHY TWO BUTTONS NOW?
                    1. "View Details" - Preview before enrolling
                    2. "Enroll Now" / "Go to Course" - Take action
                    
                    LAYOUT LOGIC:
                    - If NOT enrolled: "View Details" + "Enroll Now"
                    - If enrolled: "View Details" + "Go to Course" + "Enrolled ✓" badge
                  */}

                  <div className="flex flex-col gap-2">
                    {/* View Details Button - Always Visible */}
                    <button
                      onClick={() => handleViewDetails(course.id)}
                      className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
                    >
                      View Details
                    </button>

                    {/* Enroll/Go to Course Button - Conditional */}
                    <div className="flex gap-2">
                      {isEnrolled ? (
                        <>
                          <button
                            onClick={() =>
                              navigate(`/student/watch/${course.id}`)
                            }
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Go to Course
                          </button>
                          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center">
                            Enrolled ✓
                          </span>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEnroll(course.id, course.title)}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Enroll Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Courses;
