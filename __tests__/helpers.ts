import type { jest } from '@jest/globals'
import type * as core from '@actions/core'
import * as coreMock from '../__fixtures__/core.js'

export interface MockSpies {
  errorMock: jest.Mock<typeof core.error>
  getInputMock: jest.Mock<typeof core.getInput>
  setFailedMock: jest.Mock<typeof core.setFailed>
  setOutputMock: jest.Mock<typeof core.setOutput>
  exportVariableMock: jest.Mock<typeof core.exportVariable>
}

export function setupMocks(): MockSpies {
  return {
    errorMock: coreMock.error,
    getInputMock: coreMock.getInput,
    setFailedMock: coreMock.setFailed,
    setOutputMock: coreMock.setOutput,
    exportVariableMock: coreMock.exportVariable
  }
}
