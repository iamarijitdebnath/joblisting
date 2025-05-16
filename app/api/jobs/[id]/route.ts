import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/connect";
import Job from "@/lib/db/models/Job";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

// GET a specific job by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const job = await Job.findById(params.id).populate("createdBy", "name company");
    
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    
    return NextResponse.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}

// PUT update a job
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "employer") {
      return NextResponse.json(
        { error: "Unauthorized. Only employers can update job listings" },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const job = await Job.findById(params.id);
    
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    
    // Check if the job was created by the current user
    if (job.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized. You can only edit your own job listings" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    const updatedJob = await Job.findByIdAndUpdate(
      params.id,
      { ...body },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

// DELETE a job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "employer") {
      return NextResponse.json(
        { error: "Unauthorized. Only employers can delete job listings" },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const job = await Job.findById(params.id);
    
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    
    // Check if the job was created by the current user
    if (job.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized. You can only delete your own job listings" },
        { status: 403 }
      );
    }
    
    await Job.findByIdAndDelete(params.id);
    
    return NextResponse.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}