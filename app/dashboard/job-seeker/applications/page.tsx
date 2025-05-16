"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

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
    resumeUrl: string;
    coverLetter?: string;
}

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
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

    const handleWithdraw = async (applicationId: string) => {
        try {
            const response = await fetch(`/api/applications/${applicationId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to withdraw application");
            }

            setApplications((prev) =>
                prev.filter((app) => app._id !== applicationId)
            );

            toast({
                title: "Success",
                description: "Application withdrawn successfully",
            });
        } catch (error) {
            console.error("Error withdrawing application:", error);
            toast({
                title: "Error",
                description: "Failed to withdraw application",
                variant: "destructive",
            });
        }
    };

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

    const filteredApplications = applications.filter((app) =>
        statusFilter === "all" ? true : app.status === statusFilter
    );

    if (isLoading) {
        return (
            <div className="container max-w-7xl mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-8">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-7xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Applications</h1>
                <Button asChild>
                    <Link href="/jobs">Browse More Jobs</Link>
                </Button>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Application History</CardTitle>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Applications</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="reviewed">Reviewed</SelectItem>
                                <SelectItem value="interviewing">Interviewing</SelectItem>
                                <SelectItem value="offered">Offered</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredApplications.length === 0 ? (
                        <div className="text-center py-12">
                            <h3 className="text-lg font-semibold mb-2">No applications found</h3>
                            <p className="text-muted-foreground mb-4">
                                {statusFilter === "all"
                                    ? "Start applying to jobs to see your applications here"
                                    : `No applications with status "${statusFilter}"`}
                            </p>
                            {statusFilter === "all" && (
                                <Button asChild>
                                    <Link href="/jobs">Browse Jobs</Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredApplications.map((application) => (
                                <div
                                    key={application._id}
                                    className="border rounded-lg p-6 space-y-4"
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                        <div className="space-y-2">
                                            <Link
                                                href={`/jobs/${application.jobId._id}`}
                                                className="text-xl font-semibold hover:text-primary"
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
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <a
                                                    href={application.resumeUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    View Resume
                                                </a>
                                            </Button>
                                            {application.status === "pending" && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleWithdraw(application._id)}
                                                >
                                                    Withdraw
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {application.coverLetter && (
                                        <div className="mt-4">
                                            <h4 className="font-medium mb-2">Cover Letter</h4>
                                            <p className="text-muted-foreground whitespace-pre-line">
                                                {application.coverLetter}
                                            </p>
                                        </div>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        Applied {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}