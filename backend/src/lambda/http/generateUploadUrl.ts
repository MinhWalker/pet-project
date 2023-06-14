import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createAttachmentPreSignedUrl } from '../../helpers/businessLogic/pets'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const petId = event.pathParameters.petId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const userId = getUserId(event);
    const uploadUrl = await createAttachmentPreSignedUrl(userId, petId)

    return {
        statusCode: 200,
        body: JSON.stringify({
            uploadUrl
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
