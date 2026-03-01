/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

jest.unstable_mockModule('@actions/core', () => core)

const mainMock = {
  run: jest.fn()
}
jest.unstable_mockModule('../src/main.js', () => mainMock)

describe('index', () => {
  it('calls run when imported', async () => {
    await import('../src/index.js')

    expect(mainMock.run).toHaveBeenCalled()
  })
})
