import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/connect";
import Job from "@/lib/db/models/Job";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

// GET all jobs with optional filtering
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const query: any = {};
    
    // Apply filters
    const title = searchParams.get("title");
    if (title) {
      query.title = { $regex: title, $options: "i" };
    }
    
    const location = searchParams.get("location");
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }
    
    const category = searchParams.get("category");
    if (category) {
      query.category = category;
    }
    
    const employmentType = searchParams.get("employmentType");
    if (employmentType) {
      query.employmentType = employmentType;
    }
    
    const experienceLevel = searchParams.get("experienceLevel");
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }
    
    const minSalary = searchParams.get("minSalary");
    if (minSalary) {
      query.salaryMin = { $gte: parseInt(minSalary) };
    }
    
    const maxSalary = searchParams.get("maxSalary");
    if (maxSalary) {
      query.salaryMax = { $lte: parseInt(maxSalary) };
    }
    
    const skills = searchParams.get("skills");
    if (skills) {
      const skillsArray = skills.split(",");
      query.skills = { $in: skillsArray };
    }
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    // Sort
    const sort = searchParams.get("sort") || "-createdAt"; // Default: newest first
    
    const jobs = await Job.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name company");
    
    const totalJobs = await Job.countDocuments(query);
    
    return NextResponse.json({
      jobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      totalJobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

// POST create a new job
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "employer") {
      return NextResponse.json(
        { error: "Unauthorized. Only employers can create job listings" },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const body = await request.json();
    
    const job = await Job.create({
      ...body,
      createdBy: session.user.id,
      company: session.user.company,
    });
    
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}