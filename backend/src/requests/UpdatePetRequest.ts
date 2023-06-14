/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdatePetRequest {
  name: string
  dueDate: string
  done: boolean
}