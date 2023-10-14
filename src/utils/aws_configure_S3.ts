import AWS from 'aws-sdk';
import { UploadedFile } from 'express-fileupload';


const configureS3Bucket = async () => {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
        throw 'AWS access key ID or secret access key is undefined.'
    }

    AWS.config.update({
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
        region: process.env.AWS_REGION,
    });

    const S3 = new AWS.S3();
    return S3;
}

const deleteFilesFromS3 = async (urls: string[]) => {
    const s3 = new AWS.S3();

    for (const url of urls) {
        const urlParts = url.split('/');
        const objectKey = urlParts[urlParts.length - 1];
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME || '',
            Key: objectKey,
        };

        try {
            await s3.deleteObject(uploadParams).promise();
            console.log(`File deleted successfully: ${url}`);
        } catch (error) {
            console.error(`Error deleting file: ${url}`, error);
            throw error;
        }
    }
};

export { configureS3Bucket, deleteFilesFromS3 };