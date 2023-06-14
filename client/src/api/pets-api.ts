import { apiEndpoint } from '../config'
import { Pet } from '../types/Pet';
import { CreatePetRequest } from '../types/CreatePetRequest';
import Axios from 'axios'
import { UpdatePetRequest } from '../types/UpdatePetRequest';

export async function getPets(idToken: string): Promise<Pet[]> {
  console.log('Fetching todos')

  const response = await Axios.get(`${apiEndpoint}/todos`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Pets:', response.data)
  return response.data.items
}

export async function createPet(
  idToken: string,
  newPet: CreatePetRequest
): Promise<Pet> {
  const response = await Axios.post(`${apiEndpoint}/todos`,  JSON.stringify(newPet), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchPet(
  idToken: string,
  todoId: string,
  updatedPet: UpdatePetRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/todos/${todoId}`, JSON.stringify(updatedPet), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deletePet(
  idToken: string,
  todoId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/todos/${todoId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  todoId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/todos/${todoId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
