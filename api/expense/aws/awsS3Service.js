require('dotenv').config();

const { S3Client, PutObjectCommand, GetObjectCommand, getSignedUrl } = require('@aws-sdk/client-s3'); // Updated import

const awsRegion = process.env.AWS_REGION || 'us-east-2'; 

const s3Client = new S3Client({ region: awsRegion }); 

const bucketName = process.env.S3_BUCKET_NAME;

const uploadFileToS3 = async ({ file, fileName, contentType }) => {
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: Buffer.from(file, 'base64'),
        ContentType: contentType,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return `https://${params.Bucket}.s3.${awsRegion}.amazonaws.com/${params.Key}`; // Use awsRegion directly
};

const downloadFromS3 = async (fileKey) => {
    const params = {
        Bucket: bucketName,
        Key: fileKey,
    };

    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);

    // Convert the response body stream to a buffer
    const streamToBuffer = async (stream) => {
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    };

    return streamToBuffer(response.Body);
};

module.exports = { uploadFileToS3, downloadFromS3 };