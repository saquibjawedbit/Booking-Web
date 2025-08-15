import UserLayout from "./UserLayout"

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Separator } from '../../components/ui/separator'
import { Award } from "lucide-react"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { useAuth } from '../AuthProvider'

export default function UserProfilePage() {
    const { user } = useAuth();
    console.log("User Data", user)
    const userProfile = {
        name: user.user.name || "John Doe",
        email: user.user.email || "",
        level: user.user.level || "Beginner",
        joinDate: user.user.updatedAt
  ? new Date(user.user.updatedAt).toLocaleDateString()
  : "2023-01-01",
        completedAdventures: user.user.completedAdventures || 0,
        experience: user.user.level || 400,
        nextLevel: user.user.nextLevel || Math.floor(user.user.level/100) * 100 + 100, // Example calculation for next level
    }
    const progressPercentage = (userProfile.experience / userProfile.nextLevel) * 100
    return (
        <UserLayout>
            <div className="min-h-screen">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-black">Profile</h1>
                            <p className="text-gray-600">Manage your personal information</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <Card className="rounded-2xl border-gray-200">
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex flex-col items-center">
                                        <Avatar className="h-24 w-24 mb-4 border-4 border-gray-200">
                                            <AvatarFallback className="bg-black text-white text-2xl">
                                                {userProfile.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <h3 className="text-xl font-bold">{userProfile.name}</h3>
                                        <p className="text-gray-500">{userProfile.email}</p>
                                        <Badge className="mt-2 bg-black text-white rounded-full">{Math.floor(userProfile.level / 100)}</Badge>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h4 className="font-medium mb-2">Account Details</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Member since</span>
                                                <span>{userProfile.joinDate}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Completed Adventures</span>
                                                <span>{userProfile.completedAdventures}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Experience Points</span>
                                                <span>{userProfile.experience} XP</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-2">
                            <Card className="rounded-2xl border-gray-200">
                                <CardHeader>
                                    <CardTitle>Adventure Stats</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-medium mb-3">Experience Progress</h4>
                                            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-black rounded-full"
                                                    style={{ width: `${progressPercentage}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between mt-2 text-sm">
                                                <span>{userProfile.experience} XP</span>
                                                <span>{userProfile.nextLevel} XP (Next Level)</span>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div>
                                            <h4 className="font-medium mb-3">Achievements</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-2xl">
                                                    <Award className="h-8 w-8 text-black mb-2" />
                                                    <span className="text-sm font-medium">First Adventure</span>
                                                </div>
                                                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-2xl">
                                                    <Award className="h-8 w-8 text-black mb-2" />
                                                    <span className="text-sm font-medium">Adventure Explorer</span>
                                                </div>
                                                <div className="flex flex-col items-center p-3 bg-gray-100 rounded-2xl opacity-50">
                                                    <Award className="h-8 w-8 text-gray-400 mb-2" />
                                                    <span className="text-sm font-medium">Adventure Master</span>
                                                </div>
                                            </div>
                                        </div>
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
