import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getPetsForUser as getPetsForUser } from '../../helpers/businessLogic/pets'
import { getUserId } from '../utils';

// DONE: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      // Write your code here
      const userId = getUserId(event);
      const pets = await getPetsForUser(userId)

      return {
          statusCode: 200,
          body: JSON.stringify({
              items: pets
          })
      }
  }
)

handler.use(
  cors({
    credentials: true
  })
  
)
