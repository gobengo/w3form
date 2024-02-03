import { CARReaderStream } from 'carstream'
import { importDAG } from '@ucanto/core/delegation'

/**
 * @param {ReadableStream} car
 */
export async function createDelegationFromCar(car) {
  /** @type {import('carstream/api').Block[]} */
  const blocks = [];
  await car.pipeThrough(new CARReaderStream()).pipeTo(new WritableStream({
    async write(block) {
      blocks.push(block)
    }
  }))
  // @ts-expect-error blocks slightly different type
  const delegation = importDAG(blocks)
  return delegation
}
