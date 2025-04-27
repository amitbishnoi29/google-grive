const express = require("express");
const router = express.Router();
const multer = require("multer");
const File = require("../models/File");
const Folder = require("../models/Folder");
const { uploadFile, getFileUrl, deleteFile, downloadFile } = require("../services/s3Service");
const mongoose = require("mongoose");


// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 * 100, // 10MB limit
  },
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};
const clients = {}; // Keep track of clients by upload id

router.get("/upload-progress/:uploadId", (req, res) => {
  const { uploadId } = req.params;
  console.log("uploadId", uploadId);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients[uploadId] = res;

  req.on("close", () => {
    delete clients[uploadId];
  });
});
// Upload file
router.post(
  "/upload",
  isAuthenticated,
  upload.single("file"),
  async (req, res) => {
    console.log("\n📤 Upload Request:");
    console.log("Time:", new Date().toISOString());
    console.log("IP:", req.ip);
    console.log("File Name:", req.file?.originalname);
    console.log("Parent:", typeof req.body.parent);
    console.log("File Path:", req.body.path);

    const uploadId = req.body.uploadId;

    let parent = req.body.parent;
    if (parent !== "/") {
      //fetch parent folder from db
      const parentFolder = await Folder.findOne({
        _id: parent,
        owner: req.user._id,
      });
      parent = parentFolder.path;
    }

    if (!req.file) {
      console.log("❌ No file provided");
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      // Create S3 key with folder path
      const folderPath = req.body.path ? `${req.body.path}/` : "";
      const parentFolder = parent !== "/" ? `${parent}/` : "";
      const s3Key = `${req.user._id}/${parentFolder}${req.file.originalname}`;

      // Upload to S3
      await uploadFile(req.file, s3Key, (progress) => {
        const sseRes = clients[uploadId];
        if (sseRes) {
          sseRes.write(`data: ${JSON.stringify({ progress })}\n\n`);
        }
      });

      // Create file record
      const file = new File({
        name: req.file.originalname,
        originalName: req.file.originalname,
        s3Key,
        size: req.file.size,
        type: req.file.mimetype,
        owner: req.user._id,
        parentFolder: parent,
      });

      await file.save();
      console.log("✅ File uploaded successfully");
      res.json({
        success: true,
        message: "File uploaded successfully",
      });
    } catch (error) {
      console.error("❌ Upload Error:", error);
      res.status(500).json({ message: "Error uploading file" });
    }
  }
);

// Upload folder
router.post(
  "/folder/upload",
  isAuthenticated,
  upload.array("files"),
  async (req, res) => {
    console.log("\n📁 Folder Upload Request:");
    console.log("Time:", new Date().toISOString());
    console.log("IP:", req.ip);
    console.log("Number of files:", req.files?.length || 0);
    console.log("Parent:", req.body.parent);

    let parent = req.body.parent;
    if (parent !== "/") {
      //fetch parent folder from db
      const parentFolder = await Folder.findOne({
        _id: parent,
        owner: req.user._id,
      });
      parent = parentFolder.path;
    }

    if (!req.files || req.files.length === 0) {
      console.log("❌ No files provided");
      return res.status(400).json({ message: "No files uploaded" });
    }

    try {
      const uploadedFiles = [];
      const fileData = JSON.parse(req.body["file-data"] || "[]");

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const fileInfo = fileData[i] || {};

        // Create S3 key with folder path
        const folderPath = fileInfo.path ? `${fileInfo.path}/` : "";
        const s3Key = `${req.user._id}/${folderPath}${Date.now()}-${
          file.originalname
        }`;

        // Upload to S3
        await uploadFile(file, s3Key);

        // Create file record
        const fileRecord = new File({
          name: file.originalname,
          originalName: file.originalname,
          s3Key,
          size: file.size,
          type: file.mimetype,
          owner: req.user._id,
          parentFolder: parent,
          path: fileInfo.path || null,
        });

        await fileRecord.save();
        uploadedFiles.push(fileRecord);
      }

      console.log("✅ Folder uploaded successfully");
      res.json(uploadedFiles);
    } catch (error) {
      console.error("❌ Folder Upload Error:", error);
      res.status(500).json({ message: "Error uploading folder" });
    }
  }
);

// Get all files for current user
router.get("/getFiles", isAuthenticated, async (req, res) => {
  let parent = req.query.path;
  
  try {
    if (parent !== "/") {
        if (!mongoose.Types.ObjectId.isValid(parent)) {
            return res.status(400).json({ message: "Invalid folder ID format" });
          }
      //fetch parent folder from db
      const parentFolder = await Folder.findOne({
        _id: parent,
        owner: req.user._id,
      });
      parent = parentFolder.path;
    }

    const files = await File.find({
      owner: req.user._id,
      parentFolder: parent,
    });

    // Get signed URLs for each file
    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const url = await getFileUrl(file.s3Key);
        // console.log(url)
        return {
          ...file.toObject(),
          url,
        };
      })
    );

    res.json(filesWithUrls);
    // console.log(filesWithUrls)
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ message: "Error fetching files" });
  }
});

// Search files and folders
router.get("/search", isAuthenticated, async (req, res) => {
  console.log("\n🔍 Search Request:");
  console.log("Time:", new Date().toISOString());
  console.log("IP:", req.ip);
  console.log("Query:", req.query.query);

  try {
    const { query } = req.query;

    // Search files
    const files = await File.find({
      owner: req.user._id,
      name: { $regex: query, $options: "i" },
    });

    // Search folders
    const folders = await Folder.find({
      owner: req.user._id,
      name: { $regex: query, $options: "i" },
    });

    // Get signed URLs for files
    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const url = await getFileUrl(file.s3Key);
        return {
          ...file.toObject(),
          url,
        };
      })
    );

    // Add type to folders
    const foldersWithType = folders.map((folder) => ({
      ...folder.toObject(),
      type: "folder",
    }));

    // Combine and sort results
    const results = [...filesWithUrls, ...foldersWithType].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    console.log("✅ Search results:", {
      files: filesWithUrls.length,
      folders: foldersWithType.length,
    });

    res.json(results);
  } catch (error) {
    console.error("❌ Search Error:", error);
    res.status(500).json({ message: "Error searching files and folders" });
  }
});

// Rename file
router.patch("/:id/rename", isAuthenticated, async (req, res) => {
  try {
    const { name } = req.body;
    const file = await File.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { name },
      { new: true }
    );

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const url = await getFileUrl(file.s3Key);
    res.json({
      ...file.toObject(),
      url,
    });
  } catch (err) {
    console.error("Error renaming file:", err);
    res.status(500).json({ message: "Error renaming file" });
  }
});

// Delete file
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Delete from S3
    await deleteFile(file.s3Key);

    // Delete from database
    await File.findByIdAndDelete(req.params.id);

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({ message: "Error deleting file" });
  }
});

// Create folder
router.post("/create-folder", isAuthenticated, async (req, res) => {
  console.log("\n📁 Create Folder Request:");
  console.log("Time:", new Date().toISOString());
  console.log("IP:", req.ip);
  console.log("Folder Name:", req.body.name);
  console.log("Path:", req.body.path);
  console.log("Parent ID:", req.body.parent);
 
  try {
    let parent = req.body.parent;
    if (parent !== "/") {
        if (!mongoose.Types.ObjectId.isValid(req.body.parent)) {
            return res.status(400).json({ message: "Invalid folder ID format" });
          }
      //fetch parent folder from db
      const parentFolder = await Folder.findOne({
        _id: parent,
        owner: req.user._id,
      });
      parent = parentFolder.path;
    }
    const path = parent === "/" ? req.body.name : parent + "/" + req.body.name;

    // Create folder record
    const folder = new Folder({
      name: req.body.name,
      owner: req.user._id,
      parentFolder: parent,
      path,
    });

    await folder.save();
    console.log("✅ Folder created successfully");
    res.json(folder);
  } catch (error) {
    console.error("❌ Create Folder Error:", error);
    res.status(500).json({ message: "Error creating folder" });
  }
});

// Get folders by parent and owner
router.get("/getFolders", isAuthenticated, async (req, res) => {
  console.log("\n📂 Get Folders Request:");
  console.log("Time:", new Date().toISOString());
  console.log("IP:", req.ip);
  console.log("Parent:", req.query.parent);
  console.log("Owner:", req.user._id);
  let parent = req.query.parent;
  
  try {
    if (parent !== "/") {
      //fetch parent folder from db
      if (!mongoose.Types.ObjectId.isValid(parent)) {
        return res.status(400).json({ message: "Invalid folder ID format" });
      }

      const parentFolder = await Folder.findOne({
        _id: parent,
        owner: req.user._id,
      });
      console.log("parentFolder", parentFolder);
      parent = parentFolder.path;
    }
    console.log("parent after db", parent);

    const query = { owner: req.user._id, parentFolder: parent };

    const folders = await Folder.find(query);
    console.log("✅ Found folders:", folders.length);
    res.json(folders);
  } catch (error) {
    console.error("❌ Get Folders Error:", error);
    res.status(500).json({ message: "Error fetching folders" });
  }
});

// Delete folder
router.delete("/folder/:id", isAuthenticated, async (req, res) => {
  console.log("\n🗑️ Delete Folder Request:");
  console.log("Time:", new Date().toISOString());
  console.log("IP:", req.ip);
  console.log("Folder ID:", req.params.id);

  try {
    // Check if folder exists and belongs to user
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!folder) {
      console.log("❌ Folder not found");
      return res.status(404).json({ message: "Folder not found" });
    }

    // Delete all files in the folder
    const files = await File.find({ parentFolder: req.params.id });
    for (const file of files) {
      await deleteFile(file.s3Key);
      await File.findByIdAndDelete(file._id);
    }

    // Delete all subfolders recursively
    const deleteSubfolders = async (folderId) => {
      const subfolders = await Folder.find({ parentFolder: folderId });
      for (const subfolder of subfolders) {
        // Delete files in subfolder
        const subfolderFiles = await File.find({ parentFolder: subfolder._id });
        for (const file of subfolderFiles) {
          await deleteFile(file.s3Key);
          await File.findByIdAndDelete(file._id);
        }
        // Recursively delete subfolders
        await deleteSubfolders(subfolder._id);
        await Folder.findByIdAndDelete(subfolder._id);
      }
    };

    // Delete the folder and its contents
    await deleteSubfolders(req.params.id);
    await Folder.findByIdAndDelete(req.params.id);

    console.log("✅ Folder and its contents deleted successfully");
    res.json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Folder Error:", error);
    res.status(500).json({ message: "Error deleting folder" });
  }
});

// Get folder path
router.get("/folders/:id/path", isAuthenticated, async (req, res) => {
  console.log("\n📂 Get Folder Path Request:");
  console.log("Time:", new Date().toISOString());
  console.log("IP:", req.ip);
  console.log("Folder ID:", req.params.id);

 
  try {
    const folderId = req.params.id;
    if(folderId !== '/'){
      if(!mongoose.Types.ObjectId.isValid(folderId)){
        return res.status(400).json({ message: "Invalid folder ID format" });
      }
    }
    const path = [];
    let currentFolder = await Folder.findOne({
      _id: folderId,
      owner: req.user._id,
    });

    if (!currentFolder) {
      console.log("❌ Folder not found");
      return res.status(404).json({ message: "Folder not found" });
    }

    // Add current folder to path
    path.unshift({
      id: currentFolder._id,
      name: currentFolder.name,
    });

    // Traverse up the folder hierarchy
    let count = 2;
    while (
      currentFolder.parentFolder &&
      currentFolder.parentFolder !== "/" &&
      count--
    ) {
      currentFolder = await Folder.findOne({
        path: currentFolder.parentFolder,
        owner: req.user._id,
      });

      if (!currentFolder) {
        break;
      }

      path.unshift({
        id: currentFolder._id,
        name: currentFolder.name,
      });
    }

    console.log("✅ Folder path retrieved successfully");
    res.json(path);
  } catch (error) {
    console.error("❌ Get Folder Path Error:", error);
    res.status(500).json({ message: "Error retrieving folder path" });
  }
});

// Download file
router.get('/:id/download', isAuthenticated, async (req, res) => {
    console.log('\n📥 Download Request:');
    console.log('Time:', new Date().toISOString());
    console.log('IP:', req.ip);
    console.log('File ID:', req.params.id);

    try {
        // Validate file ID format
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            console.log('❌ Invalid file ID format:', req.params.id);
            return res.status(400).json({ 
                message: 'Invalid file ID format',
                error: 'INVALID_ID_FORMAT'
            });
        }

        // Find file in database
        const file = await File.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!file) {
            console.log('❌ File not found');
            return res.status(404).json({ 
                message: 'File not found',
                error: 'FILE_NOT_FOUND'
            });
        }

        // Get pre-signed download URL
        const downloadUrl = await downloadFile(file.s3Key);
        if (!downloadUrl) {
            console.log('❌ Failed to generate download URL');
            return res.status(500).json({
                message: 'Error generating download URL',
                error: 'URL_GENERATION_ERROR'
            });
        }

        console.log('✅ Download URL generated successfully');
        res.json({
            url: downloadUrl,
            name: file.name,
            type: file.type,
            size: file.size
        });
    } catch (error) {
        console.error('❌ Download Error:', error);
        
        // Handle specific error types
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                message: 'Invalid file ID format',
                error: 'INVALID_ID_FORMAT'
            });
        }
        
        res.status(500).json({ 
            message: 'Error generating download URL',
            error: 'SERVER_ERROR',
            details: error.message
        });
    }
});

module.exports = router;
