"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { SearchIcon, BriefcaseIcon, CheckCircleIcon, ClockIcon } from "lucide-react";

interface Application {
    _id: string;
    jobId: {
        _id: string;
        title: string;
        company: string;
        location: string;
    };
    status: string;
    createdAt: string;
}

export default function JobSeekerDashboard() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await fetch("/api/applications");
                if (!response.ok) {
                    throw new Error("Failed to fetch applications");
                }
                const data = await response.json();
                setApplications(data.applications);
            } catch (error) {
                console.error("Error fetching applications:", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch your applications",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplications();
    }, [toast]);

    if (isLoading) {
        return (
            <div className="container max-w-7xl mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-8">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48" />
                    ))}
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "reviewed":
                return "bg-blue-100 text-blue-800";
            case "interviewing":
                return "bg-purple-100 text-purple-800";
            case "offered":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="container max-w-7xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Job Seeker Dashboard</h1>
                <Button asChild>
                    <Link href="/jobs">
                        <SearchIcon className="w-4 h-4 mr-2" />
                        Browse Jobs
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Applications
                                </p>
                                <h2 className="text-3xl font-bold">{applications.length}</h2>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-full">
                                <BriefcaseIcon className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Active Interviews
                                </p>
                                <h2 className="text-3xl font-bold">
                                    {applications.filter((app) => app.status === "interviewing").length}
                                </h2>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-full">
                                <CheckCircleIcon className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Recent Activity
                                </p>
                                <h2 className="text-3xl font-bold">
                                    {applications.filter(app => {
                                        const daysSinceCreated = Math.floor(
                                            (Date.now() - new Date(app.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                                        );
                                        return daysSinceCreated <= 7;
                                    }).length}
                                </h2>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-full">
                                <ClockIcon className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Applications</CardTitle>
                </CardHeader>
                <CardContent>
                    {applications.length === 0 ? (
                        <div className="text-center py-12">
                            <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Start your job search and apply to positions that match your skills
                            </p>
                            <Button asChild>
                                <Link href="/jobs">Browse Jobs</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {applications.map((application) => (
                                <div
                                    key={application._id}
                                    className="flex flex-col md:flex-row justify-between items-start gap-4 p-4 border rounded-lg"
                                >
                                    <div className="space-y-2">
                                        <Link
                                            href={`/jobs/${application.jobId._id}`}
                                            className="text-lg font-semibold hover:text-primary"
                                        >
                                            {application.jobId.title}
                                        </Link>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary">
                                                {application.jobId.company}
                                            </Badge>
                                            <Badge variant="secondary">
                                                {application.jobId.location}
                                            </Badge>
                                            <Badge
                                                className={getStatusColor(application.status)}
                                                variant="outline"
                                            >
                                                {application.status.charAt(0).toUpperCase() +
                                                    application.status.slice(1)}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Applied {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/jobs/${application.jobId._id}`}>
                                                View Job
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}