import React, { useState, useEffect } from 'react';
import Footer from "../Footer";
import Header from "../Header";
import Sidebar from "../Sidebar";
import CourseCard from './CourseCard';

export default function Classes() {
    const [acceptedCourses, setAcceptedCourses] = useState([]);
    const [groupClasses, setGroupClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch accepted courses and group classes on component mount
    useEffect(() => {
        fetchAcceptedCourses();
        fetchGroupClasses();
    }, []);

    const fetchAcceptedCourses = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Authentication token not found");
                return;
            }

            const response = await fetch("https://edulink-backend-o9jo.onrender.com/api/v1/classes/accepted-classes", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAcceptedCourses(data.acceptedClasses || []);
            } else {
                setError("Failed to fetch accepted classes");
            }
        } catch (error) {
            console.error("Error fetching accepted classes:", error);
            setError("Failed to fetch individual classes");
        } finally {
            setLoading(false);
        }
    };

    const fetchGroupClasses = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Authentication token not found");
                return;
            }

            // Use the same endpoint as in TSchedulePage to get only logged-in tutor's group classes
            const response = await fetch("http://localhost:4000/api/v1/classes/my-group-classes-student", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                setError("Failed to fetch group classes");
                return;
            }

            const data = await response.json();
            
            if (data.groupClasses && data.groupClasses.length > 0) {
                // Map the fetched group classes to include the type and courseId
                const transformedGroupClasses = data.groupClasses.map(classItem => ({
                    ...classItem,
                    type: "Group",
                    courseId: classItem.course?._id
                }));
                
                setGroupClasses(transformedGroupClasses);
            } else {
                setGroupClasses([]);
            }
            
        } catch (error) {
            console.error("Error in fetchGroupClasses:", error);
            setError("Failed to fetch group classes");
        } finally {
            setLoading(false);
        }
    };

    const transformClassData = (classItem) => {
        // Check if it's a group class with participants
        
        return {
            id: classItem._id,
            title: classItem.type === "Group" 
                ? `[GROUP] ${classItem.course?.courseName || "Group Class"}` 
                : classItem.course?.courseName || "Untitled Class",
            type: classItem.type || "Unknown Type",
            time: classItem.time || "Unknown Time",
            description: classItem.course?.courseDescription || "No description provided",
            tutorName: classItem.tutor?.firstName || classItem.tutor?.email || "Unknown tutor",
            meetLink: classItem.classLink,
            duration: classItem.duration || 60
        };
    };

    return(
        <div className="flex min-h-screen bg-gray-100">
            <Header/>
            {/* Sidebar */}
            <div className="fixed top-0 left-0 w-64 h-screen bg-richblue-800 border-r border-richblack-700">
                <Sidebar />
            </div>
    
            {/* Main Content */}
            <div className="flex-1 ml-64 p-8 overflow-y-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-4 pt-14">Classes</h1>
                
                {loading && (
                    <div className="text-center py-8">
                        <p>Loading classes...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        <p>{error}</p>
                        <button 
                            onClick={() => {
                                setError(null);
                                fetchAcceptedCourses();
                                fetchGroupClasses();
                            }}
                            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && acceptedCourses.length === 0 && groupClasses.length === 0 && (
                    <div className="text-center py-8">
                        <p>No classes found. Check back later or refresh to update.</p>
                        <button 
                            onClick={() => {
                                fetchAcceptedCourses();
                                fetchGroupClasses();
                            }}
                            className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
                        >
                            Refresh Classes
                        </button>
                    </div>
                )}

                <div className="flex flex-wrap gap-4">
                    {/* Individual Classes */}
                    {acceptedCourses.map(course => (
                        <CourseCard 
                            key={`individual-${course._id}`}
                            {...transformClassData(course)}
                        />
                    ))}

                    {/* Group Classes */}
                    {groupClasses.map(course => (
                        <CourseCard 
                            key={`group-${course._id}`}
                            {...transformClassData(course)}
                        />
                    ))}
                </div>
            </div>
            <Footer/>
        </div>
    )
}