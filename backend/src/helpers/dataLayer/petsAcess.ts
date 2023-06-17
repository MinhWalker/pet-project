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

	// TODO: create pet
  public async createPet(pet: PetItem): Promise<PetItem> {
		logger.info("Ready to add a new pet")

		await this.petDocument.put({
				TableName: this.petTable,
				Item: pet
		}).promise();

		logger.info(`pet ${pet.name} is added`);

		return pet;
	}

	// TODO: create attachment upload images
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

	// TODO: Get all pets for user
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

	// TODO: Update pet
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

// TODO: Get pet by ID
public async getPetById(userId: string, petId: string): Promise<PetItem> {
  if (userId) {
    logger.info(`Ready to get pet with ID: ${petId}`);

    const pets = await this.petDocument.query({
      TableName: this.petTable,
      KeyConditionExpression: "#petId = :petId AND #userId = :userId",
      ExpressionAttributeNames: {
        "#petId": "petId",
        "#userId": "userId"
      },
      ExpressionAttributeValues: {
        ":petId": petId,
        ":userId": userId
      }
    }).promise();

    if (pets.Items && pets.Items.length > 0) {
      const pet = pets.Items[0] as PetItem;
      logger.info(`Retrieved pet with ID: ${petId}`);
      return pet;
    } else {
      logger.warn(`Pet with ID ${petId} not found`);
    }
  } else {
    logger.error(`Unauthenticated operation`);
  }
}

// TODO: Search pet by name
public async searchPetsByName(userId: string, name: string, page: number, limit: number): Promise<PetItem[]> {
  if (userId) {
    logger.info(`Ready to search pets by name: ${name}`);

    const pageSize = limit || 10; // Default page size to 10 if not provided
    const startIndex = (page - 1) * pageSize; // Calculate the start index based on the page number

    const params = {
      TableName: this.petTable,
      IndexName: this.petsCreatedAtIndex,
      KeyConditionExpression: "#userId = :userId",
      FilterExpression: "contains(#name, :name)",
      ExpressionAttributeNames: {
        "#userId": "userId",
        "#name": "name"
      },
      ExpressionAttributeValues: {
        ":userId": userId,
        ":name": name
      },
      Limit: pageSize,
      ScanIndexForward: true,
      ExclusiveStartKey: undefined
    };

    // Set the ExclusiveStartKey to paginate results starting from the provided start index
    if (startIndex > 0) {
      const pets = await this.petDocument.query(params).promise();
      params.ExclusiveStartKey = {
        userId: userId,
        petId: pets.Items[startIndex - 1].petId // Set the last evaluated petId as the ExclusiveStartKey
      };
    }

    const result = await this.petDocument.query(params).promise();

    logger.info(`Query successfully for pets with name: ${name}`);

    return result.Items as PetItem[];
  } else {
    logger.error(`Unauthenticated operation`);
    return [];
  }
}

// TODO: delete pet
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
