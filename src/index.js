const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const db = require('../db/db')
// Enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://sapalaorganics.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
db.connect()
  .then(() => {
    console.log('PostgreSQL database connected!');
  })
  .catch(err => {
    console.error('Error connecting to PostgreSQL database:', err);
  });
// const config = {
//   server: 'S50-63-12-86',
//   database: 'sapala2018',
//   options: {
//     trustedConnection: true,  // Use Windows Authentication
//   },
// };


app.use(bodyParser.json());
// Set the limit for parsing JSON requests
app.use(bodyParser.json({ limit: '50mb' }));

// Set the limit for parsing URL-encoded requests
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());
// Define the folder where image files will be stored
// const uploadFolder = path.join(__dirname, '../httpdocs/Images/new_products/');
const uploadFolder = `../httpdocs/Images/new_products/`

// Create the upload folder if it doesn't exist
fs.ensureDirSync(uploadFolder);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  // filename: (req, file, cb) => {
  //   console.log(file, '********file')
  //   const extension = path.extname(file.originalname);
  //   const filename = `${file.originalname}`;
  //   cb(null, filename);
  // },
  //   filename: (req, file, cb) => {
  //     const extension = path.extname(file.originalname);
  //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  //     const filename = `${uniqueSuffix}${extension}`;
  //     cb(null, filename);
  // },
  filename: (req, file, cb) => {
    const originalname = file.originalname;
    cb(null, originalname);
  },
});

const upload = multer({ storage });

// API endpoint to upload an image
app.post('/upload', upload.single('image'), (req, res) => {

  res.status(200).json({ message: 'Image uploaded successfully.' });
});

// // API endpoint to retrieve an image
// app.get('/image/:filename', (req, res) => {
//   const { filename } = req.params;
//   const filePath = path.join(uploadFolder, filename);
//   res.sendFile(filePath);
// });

app.get('/image/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const uploadFolder = path.resolve(__dirname, '..', 'httpdocs', 'Images', 'new_products');
    const filePath = path.join(uploadFolder, filename);
    res.sendFile(filePath);
  } catch (error) {
    // Handle the error appropriately, such as sending an error response
    res.status(500).send('Internal Server Error');
  }
});


// API endpoint to get a list of all files
app.get('/files', async (req, res) => {
  try {
    const files = await fs.readdir(uploadFolder);
    res.status(200).json({ files });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving the list of files.' });
  }
});

// API endpoint to remove an image
app.delete('/image/:filename', async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadFolder, filename);
  try {
    await fs.unlink(filePath);
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Error removing the image.' });
  }
});

// API endpoint to add a new job listing
app.post('/jobs', async (req, res) => {
  console.log(req.body);
  const { jobTitle, description, qualifications, experience, locations, requiredSkills } = req.body;

  try {
    // Insert the job details into the database
    const newJob = await db.query(
      'INSERT INTO jobs (job_title, description, qualifications, experience, locations, required_skills) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [jobTitle, description, qualifications, experience, locations, requiredSkills]
    );

    res.status(200).json({ status: 200, message: 'Job listing added successfully.', job: newJob.rows[0] });
  } catch (error) {
    console.error('Error adding job listing:', error);
    res.status(500).json({ error: error });
  }
});


// API endpoint to get all job listings
app.get('/jobs', async (req, res) => {
  try {
    // Retrieve all job listings from the database
    const jobs = await db.query('SELECT * FROM jobs');

    res.status(200).json({ jobs: jobs.rows });
  } catch (error) {
    console.error('Error retrieving job listings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to add a new job applicant
app.post('/applicants', async (req, res) => {
  const { full_name, email, mobile_number, qualifications, resume_file } = req.body;

  try {
    // Insert the applicant details into the database using db.query
    const newApplicant = await db.query(
      'INSERT INTO applicants (full_name, email, mobile_number, qualifications, resume_file) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [full_name, email, mobile_number, qualifications, resume_file]
    );

    res.status(200).json({ status: 200, message: 'Applicant added successfully.', applicant: newApplicant.rows[0] });
  } catch (error) {
    console.error('Error adding applicant:', error);
    res.status(500).json({ error: error });
  }
});

// API endpoint to get all applicants
app.get('/applicants', async (req, res) => {
  try {
    // Retrieve all applicants from the database
    const allApplicants = await db.query('SELECT * FROM applicants');

    res.status(200).json({ status: 200, message: 'All applicants retrieved successfully.', applicants: allApplicants.rows });
  } catch (error) {
    console.error('Error retrieving applicants:', error);
    res.status(500).json({ error: error });
  }
});






// // Connect to SQL Server
// sql.connect(config)
//   .then(pool => {
//     // Query
//     return pool.request().query('SELECT * FROM Sapala_JobsCareer');
//   })
//   .then(result => {
//     console.log(result.recordset);
//   })
//   .catch(err => {
//     console.error('Error connecting to SQL Server:', err);
//   })
//   .finally(() => {
//     // Close the SQL connection
//     sql.close();
//   });


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});