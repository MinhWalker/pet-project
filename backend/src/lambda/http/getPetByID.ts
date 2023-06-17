import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getPetByID } from '../../helpers/businessLogic/pets'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      const petId = event.pathParameters.petId
      const userId = getUserId(event);
      const pet = await getPetByID(userId, petId)

      return {
          statusCode: 200,
          body: JSON.stringify({
              items: pet
          })
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
