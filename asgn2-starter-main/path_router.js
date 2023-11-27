const express = require('express');
const pool = require('./db');
const router = express.Router();
const path = require('path');
const bodyParser = require('body-parser');  // to process HTTP request body
// mutler for uploads 
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const fsPromises = require('fs').promises;
router.use(express.json());
router.use(bodyParser.urlencoded({ extended: true }));


router.get('/', async (req, res) => {
  res.redirect('/birds');
});

router.get('/birds', async (req, res) => {
  try {
    // getting sql data
    const query = `
          SELECT
            Bird.*,
            Photos.*,
            ConservationStatus.*
          FROM
            Bird
            JOIN Photos ON Bird.bird_id = Photos.bird_id
            JOIN ConservationStatus ON Bird.status_id = ConservationStatus.status_id;
          `;
    // fetching conservation status and birds data from MySQL
    const db = await pool.promise();
    const [statusRows] = await db.query('SELECT * FROM ConservationStatus');
    const conservation_status_data = statusRows;
    const [birdRows] = await db.query(query);
    const birds = birdRows;
    // need to render the view
    res.render('index', {
      title: 'Birds of Aotearoa',
      birds: birds,
      status: conservation_status_data
    });
  } catch (err) {  // error 
    console.error('There was an error fetcing the data:', err);
    res.status(500).send('Internal server Error');
  }
});

// create 
router.get('/birds/create', (req, res) => {
  res.render('create');
});


// view
router.get('/birds/:id', async (req, res) => {
  const id = req.params.id;
  const db = await pool.promise();
  const query = `
      SELECT
        Bird.*,
        Photos.*,
        ConservationStatus.*
      FROM
        Bird
        JOIN Photos ON Bird.bird_id = Photos.bird_id
        JOIN ConservationStatus ON Bird.status_id = ConservationStatus.status_id
      WHERE
        Bird.bird_id = ?;
    `;
  const [resultRows] = await db.query(query, [id]);
  const birdNum = resultRows[0];
  res.render('view', { data: birdNum }); // redirects us to the view page.ejs for the specific bird 
});



// edit
router.get('/birds/:id/edit', async (req, res) => {
  const id = req.params.id;
  const db = await pool.promise();
  // sql query
  const query = `
      SELECT
        Bird.*,
        Photos.*,
        ConservationStatus.*
      FROM
        Bird
        JOIN Photos ON Bird.bird_id = Photos.bird_id
        JOIN ConservationStatus ON Bird.status_id = ConservationStatus.status_id
      WHERE
        Bird.bird_id = ?;
    `;
  const [resultRows] = await db.query(query, [id]);
  // if there was no bird data found
  if (resultRows.length === 0) {
    console.log("There was no bird data found for the given id:", id);
    return res.status(404).send('Bird was not found');
  }
  const bird = resultRows[0];
  res.render('edit', { data: bird });
});



// delete
router.get('/birds/:id/delete', async (req, res) => {

  try {
    const id = req.params.id;
    const db = await pool.promise();
    const birdQuery = `DELETE FROM Photos WHERE bird_id = ?;`;
    const photoQuery = `DELETE FROM Bird WHERE bird_id = ?;`;

    await db.query(birdQuery, [id]);
    await db.query(photoQuery, [id]);
    // needs to redirect to the main page after deleting 
    res.redirect('/birds');
  } catch (err) {
    console.error(error);
    res.status(500).send('Unable to delete the bird');
  }
});

// need to write post requests for saving bird after creating
router.post('/birds/create', upload.single('photo_upload'), async (req, res) => {
  try {
    const { body: newBirdData, file } = req;
    const db = await pool.promise();
    let newPhotoName = file?.originalname || null;
    if (newPhotoName) {
      let counter = 0;
      let photoPath = path.join(__dirname, 'public/images', newPhotoName);

      // checking if there is a file conflict 
      while (await fsPromises.access(photoPath).then(() => true).catch(() => false)) {
        counter++;
        const extension = path.extname(newPhotoName);
        const name = path.basename(newPhotoName, extension);
        newPhotoName = `${name}_${counter}${extension}`;
        photoPath = path.join(__dirname, 'public/images', newPhotoName);
      }
      await fsPromises.writeFile(photoPath, file.buffer);
    }
    // geting status
    const statusId = 'SELECT status_id FROM ConservationStatus WHERE status_name = ?';
    const [[{ status_id: newStatusId }]] = await db.query(statusId, [newBirdData.status_name]);

    // inserting the new bird into the db
    const insertBirdQuery = 'INSERT INTO Bird SET ?';
    await db.query(insertBirdQuery, {
      primary_name: newBirdData.primary_name,
      english_name: newBirdData.english_name,
      scientific_name: newBirdData.scientific_name,
      order_name: newBirdData.order_name,
      family: newBirdData.family,
      length: newBirdData.length,
      weight: newBirdData.weight,
      status_id: newStatusId
    });

    //if the photo was added we also insert the photo data into the photos table
    if (newPhotoName) {
      const [[{ 'LAST_INSERT_ID()': birdId }]] = await db.query('SELECT LAST_INSERT_ID()');
      const insertPhoto = 'INSERT INTO photos SET ?';
      await db.query(insertPhoto, {
        bird_id: birdId,
        filename: newPhotoName,
        photographer: newBirdData.photographer
      });
    }
    // redirecting back  to the main page after editing 
    res.redirect('/birds');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while creating the bird.');
  }
});

//update, need to write post request for saving bird after editing 
router.post('/birds/edit/:id', upload.single('photo_upload'), async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  const db = await pool.promise();

  try {
    let newPhotoName = null;
    if (req.file) {
      newPhotoName = req.file.originalname;
      let counter = 1;
      let photoPath = path.join(__dirname, 'public/images', newPhotoName);

      // checking if the a file with the same name exists and appending a number if the same photo name exists 
      while (await fsPromises.access(photoPath).catch(() => false)) {
        newPhotoName = `${path.parse(req.file.originalname).name}_${counter}${path.parse(req.file.originalname).ext}`;
        photoPath = path.join(__dirname, 'public/images', newPhotoName);
        counter++;
      }
      await fsPromises.writeFile(photoPath, req.file.buffer);
    }
// if there is a new photo then we can update 
    if (newPhotoName) {
      const updatePhotoFilenameQuery = 'UPDATE photos SET filename = ? WHERE bird_id = ?';
      await db.query(updatePhotoFilenameQuery, [newPhotoName, id]);
    }
    // updating info for the photo in teh database
    const updatePhotographerQuery = 'UPDATE photos SET photographer = ? WHERE bird_id = ?';
    await db.query(updatePhotographerQuery, [updatedData.photographer, id]);

    // getting the status_id so we can update the bird table
    const statusIdQuery = 'SELECT status_id FROM ConservationStatus WHERE status_name = ?';
    const [statusRow] = await db.query(statusIdQuery, [updatedData.status_name]);
    const newStatusId = statusRow[0].status_id;
    const updateBirdQuery = 'UPDATE Bird SET primary_name = ?, english_name = ?, scientific_name = ?, order_name = ?, family = ?, length = ?, weight = ?, status_id = ? WHERE bird_id = ?';
    
    await db.query(updateBirdQuery, [updatedData.primary_name, updatedData.english_name, updatedData.scientific_name, updatedData.order_name, updatedData.family, updatedData.length, updatedData.weight, newStatusId, id]);
    // redirecting back  to the main page after editing 
    res.redirect('/birds');

  } catch (error) {
    console.error(error);
    res.status(500).send('There was an error when updating the bird.');
  }
});


//  404 path router (has to be the last router )
router.get('*', async (req, res) => {
  res.render("404"); 
});

module.exports = router;
