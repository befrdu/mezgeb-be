const express = require('express');
const {uploadFileToS3, downloadFromS3} = require('./awsS3Service');
const router = express.Router();
const multer = require('multer');
//const {checkToken} = require('../../auth/token_validation');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

 router.post('/upload', upload.single('file'), (req, res) => {
    console.log("receivied file to uplaod upload route");

     const file = req.file;
     const fileUniqueKey = req.body.fileUniqueKey; // Will be used for final release

     const fileName = file.originalname; //will be removed for final release
     
     console.log(`File originalName for testing: ${fileName}`);

     if (!file || !fileUniqueKey) {
         return res.status(400).send('No file uploaded. Either file or fileUniqueKey is missing.');
     }
     
     const fileAsFormData = file.buffer.toString('base64'); // Convert buffer to base64 string
     const formData = {
         file: fileAsFormData,
         fileUniqueKey: fileName, // Will be replaced by fileUniqueKey for final release
         contentType: file.mimetype // Optional: include content type
     };
     console.log(`Uploading file: ${fileUniqueKey}`);
    
     uploadFileToS3(formData)
         .then((url) => {
             res.status(200).json({url: url});          
             console.log(`File uploaded successfully: ${url}`);
         })
         .catch((error) => {
             console.error(`Error uploading file: ${error}`);
             res.status(500).send('Error uploading file.');
         });
 });

 router.post('/download', async (req, res) => {
    console.log("receivied request", req.body);

    //const { fileKey } = req.body; will be used for final release

    const fileKey = req.body.fileName;

    if (!fileKey) {
        console.error('File key is missing');
        return res.status(400).send('File key is required.');
    }

    try {
        console.log(`Downloading file with key: ${fileKey}`);
        const fileContent = await downloadFromS3(fileKey);

        // Set appropriate headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="${fileKey}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.status(200).send(fileContent);
        console.log(`File downloaded successfully: ${fileKey}`);
    } catch (error) {
        console.error(`Error downloading file: ${error}`);
        res.status(500).send('Error downloading file.');
    }
});
        
 module.exports = router;