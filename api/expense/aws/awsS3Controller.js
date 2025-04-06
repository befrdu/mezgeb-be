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
     if (!file) {
         return res.status(400).send('No file uploaded.');
     }

     const fileName = file.originalname;
     const fileAsFormData = file.buffer.toString('base64'); // Convert buffer to base64 string
     const formData = {
         file: fileAsFormData,
         fileName: fileName,
         contentType: file.mimetype // Optional: include content type
     };
     console.log(`Uploading file: ${fileName}`);
     //console.log(`Base64 string: ${fileAsFormData}`);
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

    const { fileKey } = req.body;

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