import { ApolloLink, Operation, FetchResult, Observable, ApolloClientOptions } from '@apollo/client'
import { print, GraphQLError } from 'graphql'
import { createClient, Client } from 'graphql-ws'

import { FileLike } from './saltyRTCChunk'
import WebRTCSocket from './WebRTCSocket'

export const INSECURE_LOCAL_CONNECTION = (
  process.env.INSECURE_LOCAL_CONNECTION === '1'
  // @ts-ignore
  && localStorage.getItem('INSECURE_LOCAL_CONNECTION') === '1'
)

// const randomisedExponentialBackoff = async (retries) => {
//   let retryDelay = 60_000; // start with 3s delay
//   for (let i = 0; i < retries; i++) {
//       retryDelay *= 2;
//   }
//   await new Promise((resolve) => setTimeout(resolve, retryDelay +
//       // add random timeout from 300ms to 3s
//       Math.floor(Math.random() * (3000 - 300) + 300)));
// }

export default class WebRTCLink extends ApolloLink {
  private client: Client
  // public closed: boolean = false
  private files: Map<string, FileLike>
  private nextID: number

  public constructor(options?: any) {
    super()

    this.files = new Map();
    this.nextID = 1;
    if (INSECURE_LOCAL_CONNECTION) {
      this.client = createClient({
        url: process.env.INSECURE_LOCAL_WS_URL,
        keepAlive: Number.MAX_SAFE_INTEGER,
      })
    } else {
      this.client = createClient({
        retryAttempts: Number.MAX_SAFE_INTEGER,
        lazy: false,
        onNonLazyError: (e) => console.log('Non-Lazy Error', e),
        url: options.url,
        // WebRTC connections are expensive to create
        keepAlive: Number.MAX_SAFE_INTEGER,
        // retryWait: randomisedExponentialBackoff,
        webSocketImpl: WebRTCSocket({
          ...options,
          files: this.files,
        }),
      })
    }
    // this.client.on('connected', (socket, payload) => {
    //   console.log('connected?', { payload })
    // })
    // this.client.on('closed', (e) => {
    //   this.closed = true
    //   options.onClose?.(e)
    // })
  }

  request(operation: Operation): Observable<FetchResult> {
    const name = operation.operationName
    const logRequests = false
    if (logRequests && name) {
      console.log('REQUEST', name)
    }

    let { variables } = operation;

    if (variables != null) {
      // if variables are supplied, construct new by uploading any files and replacing the values by pointer IDs
      const normalizeVariables = (val) => {
        if (
          val instanceof File ||
          val instanceof Blob ||
          val instanceof FileList
        ) {
          // value is a file, create a file pointer
          const filePointer = `#__graphql_file__:${this.nextID}`;
          this.files.set(filePointer, val);
          this.nextID += 1;
          return filePointer;
        } else if (val instanceof Array && typeof val !== 'string') {
          return val.map(normalizeVariables)
        } else if (typeof val === 'object' && val != null) {
          return Object.fromEntries(Object.entries(val).map(
            ([k2, v2]) => [k2, normalizeVariables(v2)],
          ))
        } else {
          // not a file, just pass the value through
          return val;
        }
      };

      variables = normalizeVariables(variables);
    }

    let normalizedOperation = {
      ...operation,
      ...(variables == null ? {} : { variables }),
    }

    return new Observable((sink) => {
      return this.client.subscribe<FetchResult>(
        { ...normalizedOperation, query: print(operation.query as any) },
        {
          next: (...args) => {
            // if (logRequests && name) {
            //   console.log('NEXT', name, ...args)
            // }
            return sink.next(...args)
          },
          complete: (...args) => {
            if (logRequests && name) {
              console.log('COMPLETE', name, ...args)
            }
            return sink.complete(...args)
          },
          error: (err) => {
            if (logRequests && name) {
              console.log('ERROR!', name)
            }
            if (err instanceof Error) {
              sink.error(err)
            } else if (err instanceof CloseEvent) {
              sink.error(
                new Error(
                  `Socket closed with event ${err.code}` + err.reason
                    ? `: ${err.reason}` // reason will be available on clean closes
                    : '',
                ),
              )
            } else {
              sink.error(
                new Error(
                  (err as GraphQLError[])
                    .map(({ message }) => message)
                    .join(', '),
                ),
              )
            }
          },
        },
      )
    })
  }
}
