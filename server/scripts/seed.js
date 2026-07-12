import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import User from "../models/userModel.js";
import Department from "../models/departmentModel.js";
import Category from "../models/categoryModel.js";
import Asset from "../models/assetModel.js";
import Booking from "../models/bookingModel.js";
import Maintenance from "../models/maintenanceModel.js";

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/assetflow_db";

const ago = (days) => new Date(Date.now() - days * 86400000);
const future = (days) => new Date(Date.now() + days * 86400000);

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  await User.deleteMany({});
  await Department.deleteMany({});
  await Category.deleteMany({});
  await Asset.deleteMany({});
  await Booking.deleteMany({});
  await Maintenance.deleteMany({});
  console.log("Cleared collections");

  const categories = await Category.insertMany([
    { name: "Laptop",             description: "Portable computing devices including MacBooks and Windows notebooks." },
    { name: "Desktop PC",         description: "Stationary workstations and all-in-one computing units." },
    { name: "Monitor",            description: "Display screens from 24 inch to 34 inch ultrawide panels." },
    { name: "Projector",          description: "Ceiling-mounted and portable presentation projectors." },
    { name: "Conference Room",    description: "Meeting rooms bookable for internal and client sessions." },
    { name: "Vehicle",            description: "Company cars and vans available for business travel." },
    { name: "Server",             description: "Physical rack servers and blade systems in the data centre." },
    { name: "Printer & Scanner",  description: "Multifunction print, scan, and copy machines." },
    { name: "Network Equipment",  description: "Switches, routers, access points, and firewalls." },
    { name: "Mobile Device",      description: "Company-issued smartphones and tablets." },
  ]);
  const cat = Object.fromEntries(categories.map(c => [c.name, c]));
  console.log("Inserted " + categories.length + " categories");

  const departments = await Department.insertMany([
    { name: "Information Technology", code: "IT",  description: "Manages company hardware, software, networks, and cybersecurity." },
    { name: "Human Resources",        code: "HR",  description: "Oversees recruitment, onboarding, payroll, and workplace culture." },
    { name: "Finance & Accounting",   code: "FIN", description: "Handles budgeting, financial reporting, audits, and vendor payments." },
    { name: "Operations",             code: "OPS", description: "Coordinates day-to-day business processes and logistics." },
    { name: "Marketing",              code: "MKT", description: "Develops brand strategy, digital campaigns, and market research." },
    { name: "Research & Development", code: "RD",  description: "Drives product innovation, prototyping, and technology scouting." },
  ]);
  const dept = Object.fromEntries(departments.map(d => [d.code, d]));
  console.log("Inserted " + departments.length + " departments");

  const hashPw = async pw => bcrypt.hash(pw, await bcrypt.genSalt(10));

  const usersRaw = [
    { name: "Arjun Sharma",       email: "admin@admin",  pw: "Admin@123",   role: "Admin",          deptCode: "IT"  },
    { name: "Priya Nair",         email: "priya.nair@assetflow.com",    pw: "Manager@123", role: "AssetManager",   deptCode: "OPS" },
    { name: "Rahul Mehta",        email: "rahul.mehta@assetflow.com",   pw: "Manager@123", role: "AssetManager",   deptCode: "IT"  },
    { name: "Kavita Reddy",       email: "kavita.reddy@assetflow.com",  pw: "Head@123",    role: "DepartmentHead", deptCode: "HR"  },
    { name: "Sanjay Patel",       email: "sanjay.patel@assetflow.com",  pw: "Head@123",    role: "DepartmentHead", deptCode: "FIN" },
    { name: "Deepa K",            email: "deepa.k@assetflow.com",       pw: "Head@123",    role: "DepartmentHead", deptCode: "OPS" },
    { name: "Vikram Singh",       email: "vikram.singh@assetflow.com",  pw: "Head@123",    role: "DepartmentHead", deptCode: "MKT" },
    { name: "Ananya Iyer",        email: "ananya.iyer@assetflow.com",   pw: "Head@123",    role: "DepartmentHead", deptCode: "RD"  },
    { name: "Rohan Gupta",        email: "rohan.gupta@assetflow.com",   pw: "Pass@123",    role: "Employee",       deptCode: "IT"  },
    { name: "Sneha Joshi",        email: "sneha.joshi@assetflow.com",   pw: "Pass@123",    role: "Employee",       deptCode: "IT"  },
    { name: "Amit Verma",         email: "amit.verma@assetflow.com",    pw: "Pass@123",    role: "Employee",       deptCode: "HR"  },
    { name: "Pooja Desai",        email: "pooja.desai@assetflow.com",   pw: "Pass@123",    role: "Employee",       deptCode: "HR"  },
    { name: "Kiran Rao",          email: "kiran.rao@assetflow.com",     pw: "Pass@123",    role: "Employee",       deptCode: "FIN" },
    { name: "Meena Subramaniam",  email: "meena.sub@assetflow.com",     pw: "Pass@123",    role: "Employee",       deptCode: "FIN" },
    { name: "Harish Kumar",       email: "harish.kumar@assetflow.com",  pw: "Pass@123",    role: "Employee",       deptCode: "OPS" },
    { name: "Lakshmi Venkat",     email: "lakshmi.v@assetflow.com",     pw: "Pass@123",    role: "Employee",       deptCode: "OPS" },
    { name: "Raj Malhotra",       email: "raj.malhotra@assetflow.com",  pw: "Pass@123",    role: "Employee",       deptCode: "MKT" },
    { name: "Divya Pillai",       email: "divya.pillai@assetflow.com",  pw: "Pass@123",    role: "Employee",       deptCode: "MKT" },
    { name: "Nikhil Saxena",      email: "nikhil.saxena@assetflow.com", pw: "Pass@123",    role: "Employee",       deptCode: "RD"  },
    { name: "Sunita Bose",        email: "sunita.bose@assetflow.com",   pw: "Pass@123",    role: "Employee",       deptCode: "RD"  },
  ];

  const userDocs = await Promise.all(usersRaw.map(async u => ({
    name: u.name, email: u.email,
    password: await hashPw(u.pw),
    role: u.role,
    department: dept[u.deptCode]._id,
  })));
  const users = await User.insertMany(userDocs);
  const u = Object.fromEntries(users.map(x => [x.email, x]));
  console.log("Inserted " + users.length + " users");

  await Department.findByIdAndUpdate(dept["IT"]._id,  { departmentHead: u["admin@admin"]._id });
  await Department.findByIdAndUpdate(dept["HR"]._id,  { departmentHead: u["kavita.reddy@assetflow.com"]._id });
  await Department.findByIdAndUpdate(dept["FIN"]._id, { departmentHead: u["sanjay.patel@assetflow.com"]._id });
  await Department.findByIdAndUpdate(dept["OPS"]._id, { departmentHead: u["deepa.k@assetflow.com"]._id });
  await Department.findByIdAndUpdate(dept["MKT"]._id, { departmentHead: u["vikram.singh@assetflow.com"]._id });
  await Department.findByIdAndUpdate(dept["RD"]._id,  { departmentHead: u["ananya.iyer@assetflow.com"]._id });
  console.log("Assigned department heads");

  const assetsRaw = await Asset.insertMany([
    { name: "MacBook Pro 14 M3",      serialNumber: "MBP-2024-001",  model: "Apple MacBook Pro M3",       category: cat["Laptop"]._id,            department: dept["IT"]._id,  purchaseDate: ago(120), cost: 215000, status: "Assigned",    assignedTo: u["rohan.gupta@assetflow.com"]._id,   description: "14-inch MacBook Pro with M3 chip, 18GB RAM, 512GB SSD", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=60" },
    { name: "Dell XPS 15",            serialNumber: "DELL-XPS-002",  model: "Dell XPS 15 9530",           category: cat["Laptop"]._id,            department: dept["IT"]._id,  purchaseDate: ago(200), cost: 145000, status: "Assigned",    assignedTo: u["sneha.joshi@assetflow.com"]._id,   description: "Dell XPS 15 with Intel i9, 32GB RAM, 1TB SSD", image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=60" },
    { name: "Lenovo ThinkPad X1",     serialNumber: "TP-X1-003",     model: "Lenovo ThinkPad X1 Carbon",  category: cat["Laptop"]._id,            department: dept["HR"]._id,  purchaseDate: ago(90),  cost: 120000, status: "Assigned",    assignedTo: u["kavita.reddy@assetflow.com"]._id,  description: "Lightweight business laptop with 16GB RAM and vPro", image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=60" },
    { name: "HP EliteBook 840",       serialNumber: "HP-EB-004",     model: "HP EliteBook 840 G10",       category: cat["Laptop"]._id,            department: dept["FIN"]._id, purchaseDate: ago(180), cost: 98000,  status: "Assigned",    assignedTo: u["sanjay.patel@assetflow.com"]._id,  description: "HP EliteBook with security features and 14-inch display", image: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=600&auto=format&fit=crop&q=60" },
    { name: "MacBook Air M2",         serialNumber: "MBA-M2-005",    model: "Apple MacBook Air M2",       category: cat["Laptop"]._id,            department: dept["MKT"]._id, purchaseDate: ago(60),  cost: 115000, status: "Assigned",    assignedTo: u["raj.malhotra@assetflow.com"]._id,  description: "MacBook Air M2 for design and content creation", image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop&q=60" },
    { name: "Dell Latitude 5540",     serialNumber: "DL-5540-006",   model: "Dell Latitude 5540",         category: cat["Laptop"]._id,            department: dept["OPS"]._id, purchaseDate: ago(300), cost: 85000,  status: "Available",   assignedTo: null,                                 description: "Business-class Dell Latitude for field operations", image: "https://images.unsplash.com/photo-1496181130207-8191609e3461?w=600&auto=format&fit=crop&q=60" },
    { name: "Lenovo IdeaPad Flex 5",  serialNumber: "LNV-FLEX-007",  model: "Lenovo IdeaPad Flex 5",      category: cat["Laptop"]._id,            department: dept["RD"]._id,  purchaseDate: ago(45),  cost: 72000,  status: "Assigned",    assignedTo: u["nikhil.saxena@assetflow.com"]._id, description: "2-in-1 convertible laptop for R&D prototyping work", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=60" },
    { name: "iMac 24 M3 Workstation", serialNumber: "IMAC-001",      model: "Apple iMac 24-inch M3",      category: cat["Desktop PC"]._id,        department: dept["IT"]._id,  purchaseDate: ago(365), cost: 185000, status: "Assigned",    assignedTo: u["admin@admin"]._id,  description: "iMac 24-inch for system administration and dev work", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=60" },
    { name: "Dell OptiPlex 7090",     serialNumber: "DOP-7090-002",  model: "Dell OptiPlex 7090",         category: cat["Desktop PC"]._id,        department: dept["FIN"]._id, purchaseDate: ago(400), cost: 75000,  status: "Assigned",    assignedTo: u["kiran.rao@assetflow.com"]._id,     description: "Compact desktop for financial reporting tasks", image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&auto=format&fit=crop&q=60" },
    { name: "HP ProDesk 600 G6",      serialNumber: "HP-PD-003",     model: "HP ProDesk 600 G6",          category: cat["Desktop PC"]._id,        department: dept["OPS"]._id, purchaseDate: ago(500), cost: 68000,  status: "Maintenance", assignedTo: null,                                 description: "HP desktop in operations, currently under repair", image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=60" },
    { name: "LG UltraWide 34",        serialNumber: "LG-UW-001",     model: "LG 34WN80C-B",               category: cat["Monitor"]._id,           department: dept["IT"]._id,  purchaseDate: ago(250), cost: 45000,  status: "Assigned",    assignedTo: u["admin@admin"]._id,  description: "34-inch curved ultrawide QHD monitor", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=60" },
    { name: "Dell 27 4K Monitor",     serialNumber: "DELL-MON-002",  model: "Dell P2723QE",               category: cat["Monitor"]._id,           department: dept["RD"]._id,  purchaseDate: ago(150), cost: 38000,  status: "Assigned",    assignedTo: u["ananya.iyer@assetflow.com"]._id,   description: "27-inch 4K USB-C monitor for detailed design review", image: "https://images.unsplash.com/photo-1545239351-ef35f43d514b?w=600&auto=format&fit=crop&q=60" },
    { name: "Samsung 32 Curved",      serialNumber: "SAM-CRV-003",   model: "Samsung C32G55TQWN",         category: cat["Monitor"]._id,           department: dept["MKT"]._id, purchaseDate: ago(80),  cost: 32000,  status: "Available",   assignedTo: null,                                 description: "32-inch curved gaming-grade monitor for creative work", image: "https://images.unsplash.com/photo-1551645121-d1034da75057?w=600&auto=format&fit=crop&q=60" },
    { name: "Epson EB-L510U Laser",   serialNumber: "EPS-LSR-001",   model: "Epson EB-L510U",             category: cat["Projector"]._id,         department: dept["OPS"]._id, purchaseDate: ago(500), cost: 95000,  status: "Available",   assignedTo: null,                                 description: "5200 lumen laser projector for the main boardroom", image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=60" },
    { name: "BenQ MW560 Portable",    serialNumber: "BNQ-MW-002",    model: "BenQ MW560",                 category: cat["Projector"]._id,         department: dept["HR"]._id,  purchaseDate: ago(200), cost: 35000,  status: "Available",   assignedTo: null,                                 description: "Portable WXGA projector for HR training sessions", image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&auto=format&fit=crop&q=60" },
    { name: "Boardroom Alpha",        serialNumber: "ROOM-ALPHA-01", model: "Boardroom Floor 5",           category: cat["Conference Room"]._id,   department: dept["OPS"]._id, purchaseDate: ago(1800),cost: 0,      status: "Available",   assignedTo: null,                                 description: "Seats 20, 85-inch display, video conferencing enabled", image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=600&auto=format&fit=crop&q=60" },
    { name: "Meeting Room Beta",      serialNumber: "ROOM-BETA-02",  model: "Meeting Room Floor 3",        category: cat["Conference Room"]._id,   department: dept["OPS"]._id, purchaseDate: ago(1800),cost: 0,      status: "Available",   assignedTo: null,                                 description: "Seats 8, 55-inch display, whiteboard and VC setup", image: "https://images.unsplash.com/photo-1517502884422-41eaaced0168?w=600&auto=format&fit=crop&q=60" },
    { name: "Innovation Lab Gamma",   serialNumber: "ROOM-GAMM-03",  model: "Lab Floor 2",                 category: cat["Conference Room"]._id,   department: dept["RD"]._id,  purchaseDate: ago(730), cost: 0,      status: "Available",   assignedTo: null,                                 description: "R&D workshop space with modular desks and 3D printer", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=60" },
    { name: "Toyota Innova Crysta",   serialNumber: "VEH-TIC-001",   model: "Toyota Innova Crysta 2.4V",  category: cat["Vehicle"]._id,           department: dept["OPS"]._id, purchaseDate: ago(730), cost: 2200000,status: "Available",   assignedTo: null,                                 description: "7-seater company vehicle for client travel and airport pickups", image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=60" },
    { name: "Maruti Ertiga",          serialNumber: "VEH-MER-002",   model: "Maruti Suzuki Ertiga ZXi",   category: cat["Vehicle"]._id,           department: dept["OPS"]._id, purchaseDate: ago(400), cost: 1100000,status: "Assigned",    assignedTo: u["harish.kumar@assetflow.com"]._id,  description: "Fleet vehicle used for inter-city operations logistics", image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=60" },
    { name: "Dell PowerEdge R750",    serialNumber: "SRV-PE-001",    model: "Dell PowerEdge R750",         category: cat["Server"]._id,            department: dept["IT"]._id,  purchaseDate: ago(600), cost: 850000, status: "Available",   assignedTo: null,                                 description: "Primary app server - 2x Intel Xeon, 256GB RAM", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=60" },
    { name: "HPE ProLiant DL380",     serialNumber: "SRV-HP-002",    model: "HPE ProLiant DL380 Gen10",   category: cat["Server"]._id,            department: dept["IT"]._id,  purchaseDate: ago(800), cost: 720000, status: "Available",   assignedTo: null,                                 description: "Secondary backup and DR server rack unit", image: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=60" },
    { name: "HP LaserJet Pro MFP",    serialNumber: "PRN-HP-001",    model: "HP LaserJet Pro M479fdw",    category: cat["Printer & Scanner"]._id, department: dept["HR"]._id,  purchaseDate: ago(900), cost: 42000,  status: "Available",   assignedTo: null,                                 description: "Colour laser multifunction printer on HR floor", image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop&q=60" },
    { name: "Canon imageRUNNER",      serialNumber: "PRN-CAN-002",   model: "Canon imageRUNNER 2630i",    category: cat["Printer & Scanner"]._id, department: dept["FIN"]._id, purchaseDate: ago(500), cost: 68000,  status: "Maintenance", assignedTo: null,                                 description: "High-speed office printer in finance department", image: "https://images.unsplash.com/photo-1562408590-e32931084e23?w=600&auto=format&fit=crop&q=60" },
    { name: "Cisco Catalyst 9300",    serialNumber: "NET-CSC-001",   model: "Cisco Catalyst 9300-48P",    category: cat["Network Equipment"]._id, department: dept["IT"]._id,  purchaseDate: ago(900), cost: 320000, status: "Available",   assignedTo: null,                                 description: "Core PoE switch for the main data centre rack", image: "https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=600&auto=format&fit=crop&q=60" },
    { name: "Fortinet FortiGate 80F", serialNumber: "NET-FTN-002",   model: "Fortinet FortiGate 80F",     category: cat["Network Equipment"]._id, department: dept["IT"]._id,  purchaseDate: ago(600), cost: 185000, status: "Available",   assignedTo: null,                                 description: "Next-gen firewall for enterprise perimeter security", image: "https://images.unsplash.com/photo-1601597111158-2fceff270190?w=600&auto=format&fit=crop&q=60" },
    { name: "iPhone 15 Pro",          serialNumber: "MOB-IP-001",    model: "Apple iPhone 15 Pro",        category: cat["Mobile Device"]._id,     department: dept["IT"]._id,  purchaseDate: ago(100), cost: 134900, status: "Assigned",    assignedTo: u["admin@admin"]._id,  description: "Company iPhone for the IT Admin", image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=60" },
    { name: "Samsung Galaxy S24+",    serialNumber: "MOB-SAM-002",   model: "Samsung Galaxy S24+",        category: cat["Mobile Device"]._id,     department: dept["OPS"]._id, purchaseDate: ago(50),  cost: 99999,  status: "Assigned",    assignedTo: u["deepa.k@assetflow.com"]._id,       description: "Company Android device for Ops Head", image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=60" },
    { name: "iPad Pro 12.9",          serialNumber: "MOB-IPD-003",   model: "Apple iPad Pro 12.9 M2",     category: cat["Mobile Device"]._id,     department: dept["RD"]._id,  purchaseDate: ago(75),  cost: 112900, status: "Assigned",    assignedTo: u["sunita.bose@assetflow.com"]._id,   description: "iPad Pro for UX design and remote presentations", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=60" },
  ]);
  const a = Object.fromEntries(assetsRaw.map(x => [x.serialNumber, x]));
  console.log("Inserted " + assetsRaw.length + " assets");

  await Booking.insertMany([
    { asset: a["ROOM-ALPHA-01"]._id, bookedBy: u["admin@admin"]._id,  purpose: "Quarterly Business Review - All Hands",                    startDate: ago(15),    endDate: new Date(ago(15).getTime()   + 4*3600000), status: "Approved"  },
    { asset: a["ROOM-BETA-02"]._id,  bookedBy: u["kavita.reddy@assetflow.com"]._id,  purpose: "New Hire Orientation - Batch 12",                          startDate: ago(10),    endDate: new Date(ago(10).getTime()   + 3*3600000), status: "Approved"  },
    { asset: a["VEH-TIC-001"]._id,   bookedBy: u["sanjay.patel@assetflow.com"]._id,  purpose: "Client pickup from BLR Airport - TechCorp CXO",            startDate: ago(5),     endDate: new Date(ago(5).getTime()    + 6*3600000), status: "Approved"  },
    { asset: a["EPS-LSR-001"]._id,   bookedBy: u["vikram.singh@assetflow.com"]._id,  purpose: "Product Launch Presentation - Marketing Summit",           startDate: ago(3),     endDate: new Date(ago(3).getTime()    + 2*3600000), status: "Approved"  },
    { asset: a["ROOM-ALPHA-01"]._id, bookedBy: u["ananya.iyer@assetflow.com"]._id,   purpose: "Design Sprint - Phase 2 Planning",                         startDate: future(2),  endDate: new Date(future(2).getTime() + 5*3600000), status: "Approved"  },
    { asset: a["ROOM-BETA-02"]._id,  bookedBy: u["rahul.mehta@assetflow.com"]._id,   purpose: "Vendor Demo - Cloud Storage Solutions",                    startDate: future(3),  endDate: new Date(future(3).getTime() + 2*3600000), status: "Approved"  },
    { asset: a["VEH-TIC-001"]._id,   bookedBy: u["priya.nair@assetflow.com"]._id,    purpose: "Regulatory site inspection - Whitefield Office",           startDate: future(5),  endDate: new Date(future(5).getTime() + 8*3600000), status: "Approved"  },
    { asset: a["EPS-LSR-001"]._id,   bookedBy: u["deepa.k@assetflow.com"]._id,       purpose: "Ops Town Hall - Monthly",                                  startDate: future(7),  endDate: new Date(future(7).getTime() + 2*3600000), status: "Approved"  },
    { asset: a["BNQ-MW-002"]._id,    bookedBy: u["kavita.reddy@assetflow.com"]._id,  purpose: "Leadership Training - Emotional Intelligence Workshop",     startDate: ago(20),    endDate: new Date(ago(20).getTime()   + 6*3600000), status: "Cancelled" },
    { asset: a["ROOM-GAMM-03"]._id,  bookedBy: u["nikhil.saxena@assetflow.com"]._id, purpose: "Hackathon - AI Prototype Sprint",                           startDate: ago(7),     endDate: new Date(ago(7).getTime()    + 48*3600000), status: "Approved" },
  ]);
  console.log("Inserted 10 bookings");

  await Maintenance.insertMany([
    { asset: a["HP-PD-003"]._id,    reportedBy: u["harish.kumar@assetflow.com"]._id,       title: "System not booting - BIOS failure",            description: "HP ProDesk fails to POST on startup; displays BIOS checksum error. Requires CMOS battery replacement and BIOS flash.", priority: "High",     status: "Resolved", cost: 2500,  notes: "CMOS battery replaced. BIOS updated to latest firmware. System tested OK.", resolvedAt: ago(2)  },
    { asset: a["PRN-CAN-002"]._id,  reportedBy: u["kiran.rao@assetflow.com"]._id,           title: "Paper jam and roller degradation",              description: "Canon imageRUNNER frequently jams at tray 2. Feed roller needs replacement. Error code E002-0001 displayed.",          priority: "Medium",   status: "Approved", cost: 4800,  notes: "Service engineer scheduled for Thursday. Replacement roller ordered.",        resolvedAt: null    },
    { asset: a["DELL-XPS-002"]._id, reportedBy: u["sneha.joshi@assetflow.com"]._id,         title: "Battery draining within 2 hours",              description: "Dell XPS 15 battery health dropped to 34%. Cannot complete a workday on a single charge. Replacement battery required.",  priority: "Medium",   status: "Pending",  cost: 0,     notes: "",                                                                            resolvedAt: null    },
    { asset: a["NET-CSC-001"]._id,  reportedBy: u["rahul.mehta@assetflow.com"]._id,         title: "Switch port flapping - VLAN 10 instability",   description: "Ports Gi1/0/12 to Gi1/0/16 on Catalyst 9300 intermittently going down, causing network drops on finance floor.",          priority: "Critical", status: "Approved", cost: 0,     notes: "Cisco TAC case opened. Firmware update to 17.9.5 scheduled this weekend.",   resolvedAt: null    },
    { asset: a["VEH-MER-002"]._id,  reportedBy: u["harish.kumar@assetflow.com"]._id,        title: "Scheduled 30000 km service",                   description: "Maruti Ertiga is due for periodic service - oil change, brake inspection, tyre rotation, and AC servicing.",                priority: "Low",      status: "Resolved", cost: 8500,  notes: "Full service completed at Maruti authorised service centre. Next at 60k km.", resolvedAt: ago(10) },
    { asset: a["LG-UW-001"]._id,    reportedBy: u["admin@admin"]._id,        title: "Display flickering at high refresh rate",      description: "LG UltraWide monitor flickers intermittently at 120Hz via DisplayPort. No issue at 60Hz.",                               priority: "Low",      status: "Rejected", cost: 0,     notes: "Vendor confirmed driver compatibility issue. Referred to LG warranty support.",resolvedAt: null    },
    { asset: a["MBP-2024-001"]._id, reportedBy: u["rohan.gupta@assetflow.com"]._id,         title: "Keyboard sticky keys - liquid spill",          description: "MacBook Pro keyboard has sticky spacebar and command key after accidental liquid spill at desk.",                          priority: "High",     status: "Pending",  cost: 0,     notes: "",                                                                            resolvedAt: null    },
    { asset: a["SRV-PE-001"]._id,   reportedBy: u["admin@admin"]._id,        title: "RAID array rebuild - failed disk replacement",  description: "Disk slot 4 on PowerEdge R750 RAID-6 shows predictive failure. Array running in degraded mode.",                          priority: "Critical", status: "Resolved", cost: 18000, notes: "New 2.4TB SAS drive installed. RAID rebuild completed in 6 hours. Health OK.", resolvedAt: ago(4)  },
  ]);
  console.log("Inserted 8 maintenance records");

  console.log("\nSeed complete! Login credentials:");
  console.log("  Admin:         admin@admin  / Admin@123");
  console.log("  AssetManager:  priya.nair@assetflow.com    / Manager@123");
  console.log("  DeptHead:      kavita.reddy@assetflow.com  / Head@123");
  console.log("  Employee:      rohan.gupta@assetflow.com   / Pass@123");

  await mongoose.disconnect();
}

seed().catch(err => { console.error("Seed error:", err); process.exit(1); });
