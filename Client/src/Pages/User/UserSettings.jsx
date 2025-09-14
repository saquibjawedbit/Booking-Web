import React, { useState } from 'react'
import { Separator } from "../../components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { useAuth } from '../AuthProvider'
import { toast } from 'sonner'
import { UpdatePassword, VerifyNewEmail, UpdateEmail } from '../../Auth/UserAuth'

export const UserSettings = () => {
    const { user } = useAuth();
    const userProfile = {
        name: user?.user?.name || "John Doe",
        email: user?.user?.email || "",
        level: user?.user?.level || "Beginner",
        joinDate: user?.user?.joinDate || "2023-01-01",
        completedAdventures: user?.user?.completedAdventures || 0,
        experience: user?.user?.experience || 400,
        nextLevel: user?.user?.nextLevel || 1000,
    }
    const [extpassword, setExtPassword] = useState("");
    const [newpassword, setNewPassword] = useState("");
    const [newEmail, setNewEmail] = useState(user?.user?.email);
    const [isEmailChanged, setIsEmailChanged] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePassword = async () => {
        if (extpassword === "" || newpassword === "") {
            toast.error("Please fill in all fields.");
            return;
        }
        const res = await UpdatePassword({
            extpassword: extpassword,
            newpassword: newpassword,
        });
        console.log(res);
        if (res.statusCode === 200) {
            toast.success("Password updated successfully.");
            setExtPassword("");
            setNewPassword("");
        }
        else if (res.status === 400) {
            toast.error("Current password is incorrect.");
        }
        else {
            toast.error("Something went wrong. Please try again later.");
        }
    }

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setNewEmail(value);
        setIsEmailChanged(value !== userProfile.email && value !== "");
    }

    const handleEmailUpdate = async () => {
        if (!newEmail || newEmail === userProfile.email) {
            toast.error("Please enter a new email address");
            return;
        }
        setLoading(true);
        try {
            const res = await VerifyNewEmail(newEmail);
            if (res.status === 200) {
                setOtpSent(true);
                toast.success("OTP sent to your new email address");
            }
        } catch (error) {
            console.error("Error verifying email:", error);
            toast.error("An error occurred while verifying email");
        } finally {
            setLoading(false);
        }
    }

    const verifyOtp = async () => {
        if (!otp) {
            toast.error("Please enter OTP");
            return;
        }
        setLoading(true);
        try {
            const data = { email: newEmail, otp: otp };
            const res = await UpdateEmail(data);
            if (res.status === 200) {
                toast.success("Email updated successfully");
                setOtpSent(false);
                setOtp("");
                setNewEmail("");
                setIsEmailChanged(false);
                window.location.reload();
                // Update the user profile in context if needed
            } else if (res === 400) {
                toast.error("Invalid OTP");
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            toast.error("An error occurred while verifying OTP");
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="flex">
            <div className="w-full">
                <Card className="rounded-2xl border-gray-200">
                    <CardHeader>
                        <CardTitle>Account Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h4 className="font-medium mb-3">Personal Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <Input defaultValue={userProfile.name} className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <div className="relative">
                                        <Input
                                            value={newEmail}
                                            onChange={handleEmailChange}
                                            className="rounded-xl pr-20"
                                        />
                                        {isEmailChanged && !otpSent && (
                                            <Button
                                                onClick={handleEmailUpdate}
                                                disabled={loading}
                                                size="sm"
                                                className="absolute right-1 top-1 h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700"
                                            >
                                                {loading ? "..." : "Update"}
                                            </Button>
                                        )}
                                        {otpSent && (
                                            <Button
                                                onClick={verifyOtp}
                                                disabled={loading || !otp}
                                                size="sm"
                                                className="absolute right-1 top-1 h-8 px-3 text-xs bg-green-600 hover:bg-green-700"
                                            >
                                                {loading ? "..." : "Verify"}
                                            </Button>
                                        )}
                                    </div>
                                    {otpSent && (
                                        <div className="mt-2">
                                            <Input
                                                placeholder="Enter OTP sent to your new email"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="rounded-xl text-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-medium mb-3">Change Password</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Current Password</label>
                                    <Input type="password" onChange={(e) => { setExtPassword(e.target.value) }} className="rounded-xl border py-1 px-3" />

                                </div>
                                <div className="space-y-2 flex flex-col">
                                    <label className="text-sm font-medium">Ne Password</label>
                                    <Input type="password" onChange={(e) => { setNewPassword(e.target.value) }} className="rounded-xl border py-1 px-3" />
                                </div>
                            </div>
                        </div>

                        <button onClick={() => { handlePassword() }} className="bg-black text-white hover:bg-gray-800 p-2 rounded-xl">Save Changes</button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
