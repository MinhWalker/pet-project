import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreatePetRequest } from '../../requests/CreatePetRequest'
import { getUserId } from '../utils';
import { createPet } from '../../helpers/businessLogic/pets'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      const newPet: CreatePetRequest = JSON.parse(event.body);
      // TODO: Implement creating a new TODO item
      const userId = getUserId(event);

      const result = await createPet(newPet, userId);

      return {
          statusCode: 200,
          body: JSON.stringify({
              item: result
          }),
      }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
