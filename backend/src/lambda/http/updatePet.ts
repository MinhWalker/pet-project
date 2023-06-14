import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updatePet } from '../../helpers/businessLogic/pets'
import { UpdatePetRequest } from '../../requests/UpdatePetRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      const petId = event.pathParameters.petId
      const updatedPet: UpdatePetRequest = JSON.parse(event.body)
      // DONE: Update a PET item with the provided id using values in the "updatedPet" object
      const userId = getUserId(event);
      await updatePet(userId, petId, updatedPet);

      return {
          statusCode: 200,
          body: JSON.stringify({})
      }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
