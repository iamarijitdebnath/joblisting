import connectToDatabase from './connect';
import User from './models/User';
import Job from './models/Job';
import Application from './models/Application';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

async function seed() {
  try {
    await connectToDatabase();
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const passwordHash = await bcrypt.hash('password123', 10);

    const employer1 = await User.create({
      name: 'Tech Innovations Inc',
      email: 'employer@example.com',
      password: passwordHash,
      role: 'employer',
      company: 'Tech Innovations Inc',
      location: 'San Francisco, CA',
      bio: 'Leading tech company specializing in AI solutions',
      website: 'https://techinnovations.example.com',
    });

    const employer2 = await User.create({
      name: 'Global Solutions Ltd',
      email: 'employer2@example.com',
      password: passwordHash,
      role: 'employer',
      company: 'Global Solutions Ltd',
      location: 'New York, NY',
      bio: 'International consultancy firm with expertise in digital transformation',
      website: 'https://globalsolutions.example.com',
    });

    const jobSeeker1 = await User.create({
      name: 'John Doe',
      email: 'jobseeker@example.com',
      password: passwordHash,
      role: 'jobSeeker',
      location: 'Boston, MA',
      bio: 'Experienced software developer with 5+ years of experience',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      education: [
        {
          institution: 'MIT',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          from: new Date('2015-09-01'),
          to: new Date('2019-05-30'),
          current: false,
        },
      ],
      experience: [
        {
          title: 'Frontend Developer',
          company: 'WebTech Solutions',
          location: 'Remote',
          from: new Date('2019-06-15'),
          to: new Date('2022-12-31'),
          current: false,
          description: 'Developed and maintained React applications',
        },
      ],
    });

    console.log('Created users');

    // Create jobs
    const job1 = await Job.create({
      title: 'Senior Frontend Developer',
      company: 'Tech Innovations Inc',
      location: 'San Francisco, CA',
      description: 'We are looking for an experienced Frontend Developer to join our team.',
      requirements: [
        '5+ years of experience with JavaScript/TypeScript',
        'Strong knowledge of React and state management',
        'Experience with modern CSS and responsive design',
        'Understanding of web accessibility standards',
      ],
      responsibilities: [
        'Develop and maintain frontend applications',
        'Collaborate with designers and backend developers',
        'Optimize applications for performance',
        'Write clean, maintainable code',
      ],
      employmentType: 'full-time',
      experienceLevel: 'senior',
      salaryMin: 120000,
      salaryMax: 160000,
      category: 'Software Development',
      skills: ['JavaScript', 'React', 'TypeScript', 'CSS', 'HTML'],
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdBy: employer1._id,
    });

    const job2 = await Job.create({
      title: 'Full Stack Developer',
      company: 'Global Solutions Ltd',
      location: 'New York, NY',
      description: 'Join our development team to create innovative solutions for our clients.',
      requirements: [
        '3+ years of experience with full stack development',
        'Proficiency in JavaScript, Node.js and React',
        'Experience with databases (SQL and NoSQL)',
        'Understanding of cloud services (AWS/Azure)',
      ],
      responsibilities: [
        'Design and develop web applications',
        'Work with both frontend and backend technologies',
        'Collaborate in an agile environment',
        'Troubleshoot and debug applications',
      ],
      employmentType: 'full-time',
      experienceLevel: 'mid',
      salaryMin: 90000,
      salaryMax: 120000,
      category: 'Software Development',
      skills: ['JavaScript', 'Node.js', 'React', 'MongoDB', 'AWS'],
      applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      createdBy: employer2._id,
    });

    const job3 = await Job.create({
      title: 'Product Designer',
      company: 'Tech Innovations Inc',
      location: 'Remote',
      description: 'Looking for a creative Product Designer to join our UX team.',
      requirements: [
        '3+ years of experience in product design',
        'Proficiency with design tools (Figma, Sketch)',
        'Understanding of user-centered design principles',
        'Portfolio showcasing previous work',
      ],
      responsibilities: [
        'Create user flows, wireframes and prototypes',
        'Conduct user research and usability testing',
        'Collaborate with developers to implement designs',
        'Maintain and improve design systems',
      ],
      employmentType: 'full-time',
      experienceLevel: 'mid',
      salaryMin: 95000,
      salaryMax: 130000,
      category: 'Design',
      skills: ['UI/UX', 'Figma', 'User Research', 'Prototyping'],
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdBy: employer1._id,
    });

    console.log('Created jobs');

    // Create applications
    await Application.create({
      jobId: job1._id,
      userId: jobSeeker1._id,
      resumeUrl: 'https://example.com/resumes/johndoe.pdf',
      coverLetter: 'I am excited to apply for this position...',
      status: 'pending',
    });

    await Application.create({
      jobId: job3._id,
      userId: jobSeeker1._id,
      resumeUrl: 'https://example.com/resumes/johndoe-design.pdf',
      coverLetter: 'I have always been passionate about design...',
      status: 'reviewed',
    });

    console.log('Created applications');

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();