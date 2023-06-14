import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import {Types} from "aws-sdk/clients/s3"

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
export class AttachmentUtils {
    private s3: Types;
    private readonly bucketName: string = process.env.ATTACHMENT_S3_BUCKET;
    private readonly expires: number = parseInt(process.env.SIGNED_URL_EXPIRATION);

    constructor() {
        this.s3 = new XAWS.S3({ signatureVersion: 'v4' });
    }

    public async createAttachmentPreSignedUrl(attachmentId: string): Promise<string> {
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: attachmentId,
            Expires: this.expires
        }) as string;
    }
}