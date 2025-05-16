import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/connect";
import Application from "@/lib/db/models/Application";
import Job from "@/lib/db/models/Job";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET applications for a job seeker or employer
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    let query: any = {};
    
    // Different query based on user role
    if (session.user.role === "jobSeeker") {
      // Job seekers can only see their own applications
      query.userId = session.user.id;
    } else if (session.user.role === "employer") {
      // Employers can see applications for their jobs
      const jobId = searchParams.get("jobId");
      
      if (jobId) {
        // Check if the job belongs to this employer
        const job = await Job.findById(jobId);
        
        if (!job || job.createdBy.toString() !== session.user.id) {
          return NextResponse.json(
            { error: "Unauthorized. You can only view applications for your own job listings" },
            { status: 403 }
          );
        }
        
        query.jobId = jobId;
      } else {
        // Get all jobs by this employer
        const employerJobs = await Job.find({ createdBy: session.user.id }).select("_id");
        const jobIds = employerJobs.map(job => job._id);
        query.jobId = { $in: jobIds };
      }
    }
    
    // Filtering by status
    const status = searchParams.get("status");
    if (status) {
      query.status = status;
    }
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    const applications = await Application.find(query)
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .populate("jobId", "title company location")
      .populate("userId", "name email");
    
    const totalApplications = await Application.countDocuments(query);
    
    return NextResponse.json({
      applications,
      currentPage: page,
      totalPages: Math.ceil(totalApplications / limit),
      totalApplications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

// POST create a new application
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "jobSeeker") {
      return NextResponse.json(
        { error: "Unauthorized. Only job seekers can submit applications" },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const body = await request.json();
    const { jobId, resumeUrl, coverLetter } = body;
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    
    // Check if already applied to this job
    const existingApplication = await Application.findOne({
      jobId,
      userId: session.user.id,
    });
    
    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 400 }
      );
    }
    
    // Create application
    const application = await Application.create({
      jobId,
      userId: session.user.id,
      resumeUrl,
      coverLetter,
      status: "pending",
    });
    
    // Increment the applications count for the job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });
    
    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}