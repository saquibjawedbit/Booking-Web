import UserLayout from "./UserLayout"
import AdventureExperienceCard from "../../components/AdventureExperienceCard"

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import {
    Calendar,
    Award,
    TrendingUp,
    Target,
} from "lucide-react"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import { useAuth } from "../AuthProvider"
import { Separator } from "../../components/ui/separator"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { getCurrentUserSessionBookings } from "../../Api/booking.api"
import { getUserAdventureExperiences, getUserAdventures } from "../../Api/user.api"

export default function UserDashboardPage() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [adventureExperiences, setAdventureExperiences] = useState([]);
    const [levelData, setLevelData] = useState({
        overallLevel: 0,
        totalExperience: 0,
        averageLevel: 0,
        adventureCount: 0
    });
    const [adventureStats, setAdventureStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [experienceLoading, setExperienceLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch bookings and adventure experiences on component mount
    useEffect(() => {
        const fetchUserAdventures = async () => {
            try {
                const response = await getUserAdventures();
                console.log("Adventure response:", response);
                if (response.success) {
                    const adventures = response.data.adventures || [];
                    const stats = adventures.map((adv) => ({
                        name: adv.name,
                        totalSessions: adv.totalSessions || 0,
                    }));

                    setAdventureStats(stats);
                    console.log("Adventure Stats", adventureStats)
                }

            } catch (error) {
                console.error("Error fetching user adventures:", error);
            }
        };

        async function loadUserAdventureData() {
            try {
                const response = await getUserAdventureExperiences();
                console.log("Adventure Experience response:", response);

                const adventureData = response?.data?.data;
                if (!adventureData) {
                    console.warn("No adventure data found");
                    return;
                }

                const { levelData, adventureExperiences } = adventureData;
                setLevelData(levelData || { level: 1, progress: 0 });
                setCompletedAdventures(adventureExperiences?.length || 0);
            } catch (error) {
                console.error('Error fetching user adventure experiences:', error);
            }
        }

        loadUserAdventureData();
        fetchUserAdventures();

        const fetchData = async () => {
            try {
                setLoading(true);
                setExperienceLoading(true);
                setError(null);

                // Fetch bookings
                const bookingResponse = await getCurrentUserSessionBookings({
                    page: 1,
                    limit: 100, // Get all bookings for stats calculation
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                });
                const bookingData = bookingResponse.data.data || bookingResponse.data;
                setBookings(bookingData.bookings || []);

                // Fetch adventure experiences
                const experienceResponse = await getUserAdventureExperiences();
                if (experienceResponse.success) {
                    setAdventureExperiences(experienceResponse.data.adventureExperiences || []);
                    setLevelData(experienceResponse.data.levelData || {
                        overallLevel: 0,
                        totalExperience: 0,
                        averageLevel: 0,
                        adventureCount: 0
                    });
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to load dashboard data");
                setBookings([]);
                setAdventureExperiences([]);
            } finally {
                setLoading(false);
                setExperienceLoading(false);
            }
        };

        fetchData();
    }, []);

    // Process bookings to get adventure statistics
    const processBookingStats = () => {
        const currentDate = new Date();
        let completedAdventures = 0;
        let upcomingAdventures = 0;

        bookings.forEach(booking => {
            // Only count non-cancelled bookings
            if (booking.status !== 'cancelled' && booking.session?.startTime) {
                const sessionStartTime = new Date(booking.session.startTime);

                if (sessionStartTime < currentDate) {
                    // Adventure has already happened
                    completedAdventures++;
                } else {
                    // Adventure is upcoming
                    upcomingAdventures++;
                }
            }
        });

        return { completedAdventures, upcomingAdventures };
    };

    const { completedAdventures, upcomingAdventures } = processBookingStats();

    // Dynamic grid classes based on number of adventures
    const getGridClasses = (count) => {
        if (count === 1) {
            return "grid grid-cols-1 gap-6"; // Full width for 1 card
        } else if (count === 2) {
            return "grid grid-cols-1 md:grid-cols-2 gap-6"; // Half width for 2 cards
        } else if (count === 3) {
            return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"; // Third width for 3 cards
        } else {
            return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"; // Max 3 per row for 4+ cards
        }
    };

    const userProfile = {
        name: user.user.name || "John Doe",
        email: user.user.email || "",
        level: Math.floor((levelData.totalExperience || 0) / 100), // Level increases every 100 XP
        joinDate: user.user.joinDate || "2023-01-01",
        completedAdventures,
        experience: levelData.totalExperience || 0,
        nextLevel: (Math.floor((levelData.totalExperience || 0) / 100) + 1) * 100, // Next 100 XP milestone
        upcomingAdventures,
        adventureCount: levelData.adventureCount || 0,
    }
    const progressPercentage = userProfile.experience > 0 ?
        ((userProfile.experience % 100) / 100) * 100 : 0;

    const achievementData = [
        {
            category: "Skiing",
            achievements: [
                { title: "First Adventure", description: "First Descent" },
                { title: "Adventure Explorer", description: "Complete 10 Sessions" },
                { title: "Adventure Master", description: "Master a Difficult Slope" },
                { title: "Adventure Legend", description: "Season Rider (20+ sessions)" },
            ],
        },
        {
            category: "Snowshoe Hiking",
            achievements: [
                { title: "First Adventure", description: "First Hike" },
                { title: "Adventure Explorer", description: "Complete 5 Winter Hikes" },
                { title: "Adventure Master", description: "Conquer a Tough Trail" },
                { title: "Adventure Legend", description: "Winter Challenge Explorer" },
            ],
        },
        {
            category: "Ski Touring",
            achievements: [
                { title: "First Adventure", description: "First Tour" },
                { title: "Adventure Explorer", description: "Complete 10 Tours" },
                { title: "Adventure Master", description: "Reach a High Peak" },
                { title: "Adventure Legend", description: "Conquer a Technical Route" },
            ],
        },
        {
            category: "Mountain Biking",
            achievements: [
                { title: "First Adventure", description: "First Ride" },
                { title: "Adventure Explorer", description: "Complete 10 Rides" },
                { title: "Adventure Master", description: "Master a Technical Trail" },
                { title: "Adventure Legend", description: "Longest Distance Rider" },
            ],
        },
        {
            category: "Mountain Hiking",
            achievements: [
                { title: "First Adventure", description: "First Hike" },
                { title: "Adventure Explorer", description: "Complete 5 Hikes" },
                { title: "Adventure Master", description: "Conquer a Challenging Route" },
                { title: "Adventure Legend", description: "Weekend Expedition Finisher" },
            ],
        },
        {
            category: "Paragliding",
            achievements: [
                { title: "First Adventure", description: "First Flight" },
                { title: "Adventure Explorer", description: "Complete 5 Flights in a Season" },
                { title: "Adventure Master", description: "Fly in Tough Weather" },
                { title: "Adventure Legend", description: "Tandem Pro Recommendation" },
            ],
        },
        {
            category: "Ziplining",
            achievements: [
                { title: "First Adventure", description: "First Zipline Ride" },
                { title: "Adventure Explorer", description: "Complete 10 Ziplines" },
                { title: "Adventure Master", description: "Conquer an Extreme Course" },
                { title: "Adventure Legend", description: "Zipline Master" },
            ],
        },
        {
            category: "Canyoning",
            achievements: [
                { title: "First Adventure", description: "First Canyon Adventure" },
                { title: "Adventure Explorer", description: "Complete 5 Canyon Routes" },
                { title: "Adventure Master", description: "Conquer a Technical Canyon" },
                { title: "Adventure Legend", description: "Expedition Member" },
            ],
        },
        {
            category: "Rafting",
            achievements: [
                { title: "First Adventure", description: "First Whitewater Ride" },
                { title: "Adventure Explorer", description: "Complete 10 Rafting Trips" },
                { title: "Adventure Master", description: "Master a Challenging Section" },
                { title: "Adventure Legend", description: "Team Leader" },
            ],
        },
        {
            category: "Kitesurfing",
            achievements: [
                { title: "First Adventure", description: "First Ride" },
                { title: "Adventure Explorer", description: "Complete 10 Lessons" },
                { title: "Adventure Master", description: "Wind Master" },
                { title: "Adventure Legend", description: "Competition Participant" },
            ],
        },
        {
            category: "Windsurfing",
            achievements: [
                { title: "First Adventure", description: "First Windsurf" },
                { title: "Adventure Explorer", description: "Complete 10 Sessions" },
                { title: "Adventure Master", description: "Master Strong Winds" },
                { title: "Adventure Legend", description: "Wind Champion" },
            ],
        },
        {
            category: "Scuba Diving",
            achievements: [
                { title: "First Adventure", description: "First Dive" },
                { title: "Adventure Explorer", description: "Complete 10 Dives" },
                { title: "Adventure Master", description: "Explore a Challenging Site" },
                { title: "Adventure Legend", description: "Certified Explorer" },
            ],
        },
        {
            category: "Stand-Up Paddle (SUP)",
            achievements: [
                { title: "First Adventure", description: "First SUP Ride" },
                { title: "Adventure Explorer", description: "Complete 10 Rides" },
                { title: "Adventure Master", description: "Longest Distance Achieved" },
                { title: "Adventure Legend", description: "SUP Champion" },
            ],
        },
        {
            category: "Snorkeling",
            achievements: [
                { title: "First Adventure", description: "First Snorkeling Session" },
                { title: "Adventure Explorer", description: "Complete 10 Sessions" },
                { title: "Adventure Master", description: "Night Snorkeling" },
                { title: "Adventure Legend", description: "Underwater Photography Expert" },
            ],
        },
        {
            category: "Camping",
            achievements: [
                { title: "First Adventure", description: "First Camping Trip" },
                { title: "Adventure Explorer", description: "Complete 5 Trips per Year" },
                { title: "Adventure Master", description: "Survival Skills Certified" },
                { title: "Adventure Legend", description: "Extreme Camping Hero" },
            ],
        },
        {
            category: "Winter Survival Courses",
            achievements: [
                { title: "First Adventure", description: "First Survival Course" },
                { title: "Adventure Explorer", description: "Complete 3 Courses" },
                { title: "Adventure Master", description: "Survive Extreme Weather" },
                { title: "Adventure Legend", description: "Instructor’s Choice Award" },
            ],
        },
        {
            category: "Snowmobile Safari",
            achievements: [
                { title: "First Adventure", description: "First Safari" },
                { title: "Adventure Explorer", description: "Complete 5 Safaris" },
                { title: "Adventure Master", description: "Master a Challenging Route" },
                { title: "Adventure Legend", description: "Safari Leader" },
            ],
        },
        {
            category: "Bouldering",
            achievements: [
                { title: "First Adventure", description: "First Climb" },
                { title: "Adventure Explorer", description: "Complete 10 Climbs" },
                { title: "Adventure Master", description: "Conquer a Difficult Wall" },
                { title: "Adventure Legend", description: "Competition Participant" },
            ],
        },
        {
            category: "Orienteering",
            achievements: [
                { title: "First Adventure", description: "First Course" },
                { title: "Adventure Explorer", description: "Complete 5 Courses" },
                { title: "Adventure Master", description: "Conquer a Difficult Terrain" },
                { title: "Adventure Legend", description: "Orienteering Champion" },
            ],
        },
        {
            category: "Trail Running",
            achievements: [
                { title: "First Adventure", description: "First Trail Run" },
                { title: "Adventure Explorer", description: "Complete 10 Runs" },
                { title: "Adventure Master", description: "Conquer a Challenging Trail" },
                { title: "Adventure Legend", description: "Race Participant" },
            ],
        },
        {
            category: "Tree Climbing",
            achievements: [
                { title: "First Adventure", description: "First Climb" },
                { title: "Adventure Explorer", description: "Complete 10 Climbs" },
                { title: "Adventure Master", description: "Conquer an Advanced Tree Route" },
                { title: "Adventure Legend", description: "Tree Master" },
            ],
        },
        {
            category: "Photography Expeditions",
            achievements: [
                { title: "First Adventure", description: "First Photography Trip" },
                { title: "Adventure Explorer", description: "Complete 5 Trips" },
                { title: "Adventure Master", description: "Capture Rare Shots" },
                { title: "Adventure Legend", description: "Professional Photographer" },
            ],
        },
        {
            category: "Hot Air Balloon Rides",
            achievements: [
                { title: "First Adventure", description: "First Balloon Ride" },
                { title: "Adventure Explorer", description: "Complete 5 Flights" },
                { title: "Adventure Master", description: "Fly in Challenging Conditions" },
                { title: "Adventure Legend", description: "Sky Explorer" },
            ],
        },
        {
            category: "Horseback Riding",
            achievements: [
                { title: "First Adventure", description: "First Ride" },
                { title: "Adventure Explorer", description: "Complete 10 Rides" },
                { title: "Adventure Master", description: "Conquer a Challenging Route" },
                { title: "Adventure Legend", description: "Horse Master" },
            ],
        },
        {
            category: "Slackline",
            achievements: [
                { title: "First Adventure", description: "First Balance Attempt" },
                { title: "Adventure Explorer", description: "Complete 10 Sessions" },
                { title: "Adventure Master", description: "Longest Balance Record" },
                { title: "Adventure Legend", description: "Slackline Champion" },
            ],
        },
        {
            category: "OCR Training",
            achievements: [
                { title: "First Adventure", description: "First OCR Race" },
                { title: "Adventure Explorer", description: "Complete 10 Courses" },
                { title: "Adventure Master", description: "Conquer a Difficult Obstacle" },
                { title: "Adventure Legend", description: "OCR Champion" },
            ],
        },
        {
            category: "Adventure Camps",
            achievements: [
                { title: "First Adventure", description: "First Participation" },
                { title: "Adventure Explorer", description: "Attend 5 Camps" },
                { title: "Adventure Master", description: "Instructor’s Recommendation" },
                { title: "Adventure Legend", description: "Camp Leader" },
            ],
        },
        {
            category: "Longboarding",
            achievements: [
                { title: "First Adventure", description: "First Ride" },
                { title: "Adventure Explorer", description: "Complete 10 Sessions" },
                { title: "Adventure Master", description: "Perform a Difficult Trick" },
                { title: "Adventure Legend", description: "Competition Rider" },
            ],
        },
        {
            category: "Off-road Motorbike Tours",
            achievements: [
                { title: "First Adventure", description: "First Ride" },
                { title: "Adventure Explorer", description: "Complete 5 Tours" },
                { title: "Adventure Master", description: "Master a Tough Track" },
                { title: "Adventure Legend", description: "Tour Leader" },
            ],
        },
        {
            category: "Birdwatching",
            achievements: [
                { title: "First Adventure", description: "First Observation" },
                { title: "Adventure Explorer", description: "Identify 50 Species" },
                { title: "Adventure Master", description: "Spot a Rare Bird" },
                { title: "Adventure Legend", description: "Birding Expert" },
            ],
        },
        {
            category: "Night Hiking",
            achievements: [
                { title: "First Adventure", description: "First Night Hike" },
                { title: "Adventure Explorer", description: "Complete 5 Hikes" },
                { title: "Adventure Master", description: "Conquer Difficult Conditions" },
                { title: "Adventure Legend", description: "Night Explorer" },
            ],
        },
        {
            category: "Forest Therapy",
            achievements: [
                { title: "First Adventure", description: "First Session" },
                { title: "Adventure Explorer", description: "Complete 10 Sessions" },
                { title: "Adventure Master", description: "Group Leader" },
                { title: "Adventure Legend", description: "Forest Guru" },
            ],
        },
        {
            category: "Archery",
            achievements: [
                { title: "First Adventure", description: "First Bullseye Shot" },
                { title: "Adventure Explorer", description: "Complete 10 Trainings" },
                { title: "Adventure Master", description: "Competition Participant" },
                { title: "Adventure Legend", description: "Archery Master" },
            ],
        },
        {
            category: "Multi-Adventure Tours",
            achievements: [
                { title: "First Adventure", description: "First Adventure Tour" },
                { title: "Adventure Explorer", description: "Complete 5 Tours" },
                { title: "Adventure Master", description: "Conquer a Tough Route" },
                { title: "Adventure Legend", description: "Multi-Adventure Leader" },
            ],
        },
        {
            category: "Wakeboarding",
            achievements: [
                { title: "First Adventure", description: "First Ride" },
                { title: "Adventure Explorer", description: "Complete 10 Sessions" },
                { title: "Adventure Master", description: "Master a Difficult Trick" },
                { title: "Adventure Legend", description: "Competition Rider" },
            ],
        },
        {
            category: "Powered Paragliding",
            achievements: [
                { title: "First Adventure", description: "First Powered Flight" },
                { title: "Adventure Explorer", description: "Complete 5 Flights" },
                { title: "Adventure Master", description: "Fly in Tough Weather" },
                { title: "Adventure Legend", description: "Instructor’s Choice" },
            ],
        },
        {
            category: "Drone Operator Training",
            achievements: [
                { title: "First Adventure", description: "First Training" },
                { title: "Adventure Explorer", description: "Complete 5 Trainings" },
                { title: "Adventure Master", description: "Master Action Filming" },
                { title: "Adventure Legend", description: "Certified Drone Operator" },
            ],
        },

    ];

    return (
        <UserLayout>
            <div className="min-h-screen  p-4 sm:p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-black">Dashboard</h1>
                            <p className="text-gray-600">Welcome back, {userProfile.name}</p>
                        </div>

                        <div className="flex px-3 items-center gap-3">
                            <Link to="/browse" variant="outline" className="flex px-3 py-1 text-white bg-black items-center gap-2 rounded-xl  hover:bg-gray-800">
                                <Calendar className="h-4 w-4" />
                                Browse Adventures
                            </Link>

                            <Link to="/shop" className="bg-black px-3 py-1 text-white hover:bg-gray-800 rounded-xl">Shop</Link>
                        </div>
                    </div>

                    {/* User Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                        {/* Level Card */}
                        <Card className="rounded-2xl border-gray-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium">Overall Adventure Level</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Avatar className="h-16 w-16 border-2 border-black">
                                            <AvatarFallback className="bg-black text-white text-lg font-bold">
                                                {userProfile.level}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium">Level {userProfile.level}</span>
                                            <span className="text-sm text-gray-500">
                                                {userProfile.experience}/{userProfile.nextLevel} XP
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-black rounded-full transition-all duration-500"
                                                style={{ width: `${progressPercentage}%` }}></div>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <p className="text-xs text-gray-500">
                                                {userProfile.nextLevel - userProfile.experience} XP to next milestone
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {userProfile.adventureCount} adventures
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Completed Adventures */}
                        <Card className="rounded-2xl border-gray-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium">Completed Adventures</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Award className="h-8 w-8 text-black" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold">
                                            {loading ? "..." : error ? "0" : userProfile.completedAdventures}
                                        </p>
                                        <p className="text-sm text-gray-500">Adventures completed</p>
                                        {error && (
                                            <p className="text-xs text-red-500 mt-1">{error}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Upcoming Adventures */}
                        <Card className="rounded-2xl border-gray-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium">Upcoming Adventures</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Calendar className="h-8 w-8 text-black" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold">
                                            {loading ? "..." : error ? "0" : userProfile.upcomingAdventures}
                                        </p>
                                        <p className="text-sm text-gray-500">Adventures scheduled</p>
                                        {error && (
                                            <p className="text-xs text-red-500 mt-1">{error}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Adventure Experiences Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Adventure Experience</h2>
                                <p className="text-gray-600">
                                    {adventureExperiences.length > 0
                                        ? `Your progress in ${adventureExperiences.length} adventure${adventureExperiences.length !== 1 ? 's' : ''}`
                                        : "Your progress in each adventure"
                                    }
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                    {userProfile.adventureCount} Adventure{userProfile.adventureCount !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        {experienceLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : adventureExperiences.length > 0 ? (
                            <div className={getGridClasses(adventureExperiences.length)}>
                                {adventureExperiences.map((adventureExp, index) => (
                                    <AdventureExperienceCard
                                        key={adventureExp._id}
                                        adventureExp={adventureExp}
                                        isFullWidth={adventureExperiences.length === 1}
                                        index={index}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Card className="rounded-2xl border-gray-200 border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                        <Award className="h-10 w-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Adventure Experience Yet</h3>
                                    <p className="text-gray-600 text-center mb-8 max-w-md">
                                        Start your adventure journey by booking your first session and gain experience points to level up!
                                    </p>
                                    <Link
                                        to="/browse"
                                        className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors font-medium"
                                    >
                                        Browse Adventures
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="stats">
                        <div className="lg:col-span-2">
                            <Card className="rounded-2xl border-gray-200">
                                <CardHeader>
                                    <CardTitle>Level Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-medium mb-3">Overall Experience Progress</h4>
                                            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                                                    style={{ width: `${progressPercentage}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between mt-2 text-sm">
                                                <span>{userProfile.experience} XP</span>
                                                <span>{userProfile.nextLevel} XP (Next Level)</span>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="text-center p-4 bg-gray-50 rounded-xl">
                                                <div className="flex items-center justify-center mb-2">
                                                    <Award className="h-8 w-8 text-blue-500" />
                                                </div>
                                                <p className="text-2xl font-bold text-gray-900">{userProfile.level}</p>
                                                <p className="text-sm text-gray-600">Overall Level</p>
                                            </div>
                                            <div className="text-center p-4 bg-gray-50 rounded-xl">
                                                <div className="flex items-center justify-center mb-2">
                                                    <Target className="h-8 w-8 text-purple-500" />
                                                </div>
                                                <p className="text-2xl font-bold text-gray-900">{userProfile.adventureCount}</p>
                                                <p className="text-sm text-gray-600">Adventures Tried</p>
                                            </div>
                                        </div>

                                        <Separator />
                                        <h4 className="text-lg font-medium">Achievements</h4>

                                        {achievementData.map((section, index) => {
                                            const matchedAdventure = adventureStats.find(
                                                (adv) => adv.name.toLowerCase() === section.category.toLowerCase()
                                            );

                                            const totalSessions = matchedAdventure?.totalSessions || 0;

                                            return (
                                                <div key={index} className="mb-6">
                                                    <h4 className="text-lg font-medium mb-3">{section.category}</h4>
                                                    <div className="flex flex-col gap-4">
                                                        {section.achievements.map((item, i) => {
                                                            let isEarned = false;

                                                            if (i === 0 && totalSessions >= 1) isEarned = true;
                                                            if (i === 1 && totalSessions >= 5) isEarned = true;
                                                            if (i === 2 && totalSessions >= 10) isEarned = true;
                                                            if (i === 3 && totalSessions >= 20) isEarned = true;

                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className={`flex items-center gap-4 p-4 rounded-2xl bg-gray-100 ${isEarned ? "opacity-100" : "opacity-50"
                                                                        }`}
                                                                >
                                                                    <Award
                                                                        className={`h-8 w-8 ${isEarned ? "text-gray-800 opacity-100" : "text-gray-800 opacity-50"}`}
                                                                    />
                                                                    <div>
                                                                        <span className="text-sm font-medium text-gray-600">{item.title}</span>
                                                                        <p className="text-xs text-gray-400">{item.description}</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    )
}
