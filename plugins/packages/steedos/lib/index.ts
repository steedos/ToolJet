import { QueryError, QueryResult, QueryService } from '@tooljet-plugins/common';
import { SourceOptions, QueryOptions } from './types';
import got, { Headers } from 'got';

export default class SteedosQueryService implements QueryService {
  authHeader(apikey: string): Headers {
    return { Authorization: `Bearer apikey,${apikey}`, 'Content-Type': 'application/json' };
  }

  async run(sourceOptions: SourceOptions, queryOptions: QueryOptions): Promise<QueryResult> {
    let result = {};
    let response = null;
    const operation = queryOptions.operation;
    const objectName = queryOptions.object_name;
    const url = sourceOptions.url;
    const apiKey = sourceOptions.api_key;

    try {
      switch (operation) {
        case 'list_records': {
          const pageSize = queryOptions.page_size || '';
          const offset = queryOptions.offset || '';

          response = await got(`${url}/api/v1/${objectName}/?pageSize=${pageSize}&offset=${offset}`, {
            method: 'get',
            headers: this.authHeader(apiKey),
          });

          result = JSON.parse(response.body);
          break;
        }

        case 'retrieve_record': {
          const recordId = queryOptions.record_id;

          response = await got(`${url}/api/v1/${objectName}/${recordId}`, {
            headers: this.authHeader(apiKey),
          });

          result = JSON.parse(response.body);
          break;
        }

        case 'create_record': {
          response = await got(`${url}/api/v1/${objectName}`, {
            method: 'post',
            headers: this.authHeader(apiKey),
            json: {
              records: JSON.parse(queryOptions.body),
            },
          });

          result = JSON.parse(response.body);

          break;
        }

        case 'update_record': {
          response = await got(`${url}/api/v1/${objectName}`, {
            method: 'patch',
            headers: this.authHeader(apiKey),
            json: {
              records: [
                {
                  id: queryOptions.record_id,
                  fields: JSON.parse(queryOptions.body),
                },
              ],
            },
          });

          result = JSON.parse(response.body);

          break;
        }

        case 'delete_record': {
          const _recordId = queryOptions.record_id;

          response = await got(`${url}/api/v1/${objectName}/${_recordId}`, {
            method: 'delete',
            headers: this.authHeader(apiKey),
          });
          result = JSON.parse(response.body);

          break;
        }
      }
    } catch (error) {
      console.log(error);
      throw new QueryError('Query could not be completed', error.message, {});
    }

    return {
      status: 'ok',
      data: result,
    };
  }
}
