import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deletePet } from '../../helpers/businessLogic/pets'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const petId = event.pathParameters.petId;
    // DONE: Remove a TODO item by id
      const userId = getUserId(event);

      await deletePet(userId, petId)
    
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
