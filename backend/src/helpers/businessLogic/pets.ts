import { PetsAccess } from '../dataLayer/petsAcess'
import { CreatePetRequest } from '../../requests/CreatePetRequest'
import { UpdatePetRequest } from '../../requests/UpdatePetRequest'
import { createLogger } from '../../utils/logger'
import * as uuid from 'uuid'

const logger = createLogger("Business Logic CRUD pet");
const petAccessLayer = new PetsAccess();
// DONE: Implement businessLogic
export const createPet = async (request: CreatePetRequest, userId: string) => {
  logger.info("BL: createPet");

  if (request) {
      logger.info("Adding a new pet");
      const petId = uuid.v4()
      return await petAccessLayer.createPet({
          userId: userId,
          petId: petId,
          createdAt: (new Date()).toISOString(),
          done: false,
          attachmentUrl: null,
          ...request
      });
  } else {
      logger.error("Add failure");
  }
}

export const createAttachmentPreSignedUrl = async (userId, petId) => {
  const attachmentId = uuid.v4();

  return await petAccessLayer.createAttachmentPresignedUrl(userId, petId, attachmentId);
}

export const getPetsForUser = async (userId: string) => {
  return await petAccessLayer.getPets(userId);
}

export const updatePet = async (userId: string, petId: string, request: UpdatePetRequest) => {
  await petAccessLayer.updatePet(userId, petId, request);
}

export const getPetByID = async (userId: string, petId: string) => {
  return await petAccessLayer.getPetById(userId, petId);
}

export const searchPetsByName = async (userId: string, name: string, page: number, limit: number) => {
  return await petAccessLayer.searchPetsByName(userId, name, page, limit);
}

export const deletePet = async (userId: string, petId: string) => {
  await petAccessLayer.deletePet(userId, petId);
}