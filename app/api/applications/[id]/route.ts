import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/connect";
import Application from "@/lib/db/models/Application";
import Job from "@/lib/db/models/Job";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET a specific application
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const application = await Application.findById(params.id)
      .populate("jobId")
      .populate("userId", "name email");
    
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }
    
    // Check authorization
    if (
      session.user.role === "jobSeeker" &&
      application.userId.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Unauthorized. You can only view your own applications" },
        { status: 403 }
      );
    } else if (session.user.role === "employer") {
      // Check if the application is for a job created by this employer
      const job = await Job.findById(application.jobId);
      if (!job || job.createdBy.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "Unauthorized. You can only view applications for your own job listings" },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

// PUT update application status (for employers)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "employer") {
      return NextResponse.json(
        { error: "Unauthorized. Only employers can update application status" },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const application = await Application.findById(params.id);
    
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }
    
    // Check if the application is for a job created by this employer
    const job = await Job.findById(application.jobId);
    if (!job || job.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized. You can only update applications for your own job listings" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { status } = body;
    
    if (!["pending", "reviewed", "interviewing", "offered", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }
    
    const updatedApplication = await Application.findByIdAndUpdate(
      params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

// DELETE withdraw an application (for job seekers)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "jobSeeker") {
      return NextResponse.json(
        { error: "Unauthorized. Only job seekers can withdraw applications" },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const application = await Application.findById(params.id);
    
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }
    
    // Check if the application belongs to the current user
    if (application.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized. You can only withdraw your own applications" },
        { status: 403 }
      );
    }
    
    await Application.findByIdAndDelete(params.id);
    
    // Decrement the applications count for the job
    await Job.findByIdAndUpdate(application.jobId, {
      $inc: { applicationsCount: -1 },
    });
    
    return NextResponse.json({ message: "Application withdrawn successfully" });
  } catch (error) {
    console.error("Error withdrawing application:", error);
    return NextResponse.json(
      { error: "Failed to withdraw application" },
      { status: 500 }
    );
  }
}