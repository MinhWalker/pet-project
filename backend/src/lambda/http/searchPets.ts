import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { searchPetsByName } from '../../helpers/businessLogic/pets'
import { getUserId } from '../utils'

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      const petName = event.pathParameters.name;
      const userId = getUserId(event);
  
      // Get the page and limit query parameters from the request
      const page = parseInt(event.queryStringParameters?.page || '1', 10);
      const limit = parseInt(event.queryStringParameters?.limit || '10', 10);
  
      const pets = await searchPetsByName(userId, petName, page, limit);
  
      return {
        statusCode: 200,
        body: JSON.stringify({
          items: pets,
        }),
      };
    }
  );

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
