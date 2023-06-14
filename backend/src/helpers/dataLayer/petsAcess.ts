import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../../utils/logger'
import { PetItem } from '../../models/PetItem'
import { PetUpdate } from '../../models/PetUpdate';
import {AttachmentUtils} from "../fileStorage/attachmentUtils";

const AWS = require("aws-sdk");
const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('PetsAccess')

// DONE: Implement the dataLayer logic

export class PetsAccess {
  private readonly petTable = process.env.PETS_TABLE
  private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET
  private readonly petsCreatedAtIndex = process.env.PETS_CREATED_AT_INDEX

  private petDocument: DocumentClient;

  constructor() {
		this.petDocument = new XAWS.DynamoDB.DocumentClient();
	}

  public async createPet(pet: PetItem): Promise<PetItem> {
		logger.info("Ready to add a new pet")

		await this.petDocument.put({
				TableName: this.petTable,
				Item: pet
		}).promise();

		logger.info(`pet ${pet.name} is added`);

		return pet;
	}

	public async createAttachmentPresignedUrl(userId: string, petId: string, attachmentId: string) {
		const attachmentUtil = new AttachmentUtils();
		const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${attachmentId}`;

		if (userId) {
				await this.petDocument.update({
						TableName: this.petTable,
						Key: {
								petId, userId
						},
						UpdateExpression: "set #attachmentUrl = :attachmentUrl",
						ExpressionAttributeNames: {
								"#attachmentUrl": "attachmentUrl"
						},
						ExpressionAttributeValues: {
								":attachmentUrl": attachmentUrl
						}
				}).promise();

				logger.info(`Url ${await attachmentUtil.createAttachmentPreSignedUrl(attachmentId)}`);

				return await attachmentUtil.createAttachmentPreSignedUrl(attachmentId);
		} else {
				logger.error("Unauthenticated operation");
		}
	}

	public async getPets(userId: string) : Promise<PetItem[]> {
		if (userId) {
				logger.info("Ready to get all pets");

				const pets = await this.petDocument.query({
						TableName: this.petTable,
						IndexName: this.petsCreatedAtIndex,
						KeyConditionExpression: "#userId = :userId",
						ExpressionAttributeNames: {
								"#userId": "userId"
						},
						ExpressionAttributeValues: {
								":userId": userId
						}
				}).promise();

				logger.info(`Query successfully ${pets.Items}`);

				return pets.Items as PetItem[];
		} else {
				logger.error(`Unauthenticated operation`);
		}
	}
	public async updatePet(userId: string, petId: string, pet: PetUpdate) {
		if (userId) {
				logger.info(`Found pet ${petId}, ready for update`);

				await this.petDocument.update({
						TableName: this.petTable,
						Key: {
								petId,
								userId
						},
						UpdateExpression: "set #name = :name, #dueDate = :dueDate, #done = :done",
						ExpressionAttributeNames: {
								"#name": "name",
								"#dueDate": "dueDate",
								"#done": "done"
						},
						ExpressionAttributeValues: {
								":name": pet.name,
								":dueDate": pet.dueDate,
								":done": pet.done
						}
				}).promise();

				logger.info("Updated successfull ", pet)
		} else {
				logger.error(`Unauthenticated operation`);
		}
}

public async deletePet(userId: string, petId: string) {
		if (userId) {
				logger.info(`Ready to delete pet ${petId}`);

				await this.petDocument.delete({
						TableName: this.petTable,
						Key: {
								petId,
								userId
						}
				}).promise();

				logger.info("Delete successful");
		} else {
				logger.error("Unauthenticated operation");
		}
	}
}
