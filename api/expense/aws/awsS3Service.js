const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const bucketName = process.env.S3_BUCKET_NAME;

async function uploadFileToS3(formData) {
    if (!formData.file || !formData.fileName) {
        throw new Error('File data or file name is missing');
    }

    const buffer = Buffer.from(formData.file, 'base64'); // Convert base64 file data to a buffer
    const params = {
        Bucket: bucketName,
        Key: formData.fileName, // Use the file name from formData
        Body: buffer,
        ContentType: formData.contentType || 'application/octet-stream' // Use content type from formData or default
       // ACL: 'public-read' // Adjust permissions if needed
    };

    try {
        console.log(`Uploading file: ${formData.fileName}`);
        const data = await s3.upload(params).promise();
        console.log(`File uploaded successfully: ${data.Location}`);
        return data.Location; // Return the S3 file location
    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw error;
    }
}

async function downloadFromS3(fileKey) {
    if (!fileKey) {
        throw new Error('File key is missing');
    }

    const params = {
        Bucket: bucketName,
        Key: fileKey // The key of the file to download
    };

    try {
        console.log(`Downloading file: ${fileKey}`);
        const data = await s3.getObject(params).promise();
        console.log(`File downloaded successfully`);
        return data.Body; // Return the file content as a buffer
    } catch (error) {
        console.error('Error downloading from S3:', error);
        throw error;
    }
}

module.exports = {
    uploadFileToS3: uploadFileToS3,
    downloadFromS3: downloadFromS3
};
