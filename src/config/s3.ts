import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const s3=new AWS.S3({
    region:'ap-northeast-1',
    accessKeyId:process.env.accessKeyId,
    secretAccessKey:process.env.secretAccessKey
})

export default s3;