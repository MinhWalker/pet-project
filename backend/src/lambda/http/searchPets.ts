import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { searchPetsByName } from '../../helpers/businessLogic/pets'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      const petName = event.pathParameters.name
      const userId = getUserId(event);
      const pets = await searchPetsByName(userId, petName)

      return {
          statusCode: 200,
          body: JSON.stringify({
              items: pets
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
