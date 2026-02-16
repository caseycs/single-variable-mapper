import * as core from '@actions/core'

export interface MockSpies {
  errorMock: jest.SpiedFunction<typeof core.error>
  getInputMock: jest.SpiedFunction<typeof core.getInput>
  setFailedMock: jest.SpiedFunction<typeof core.setFailed>
  setOutputMock: jest.SpiedFunction<typeof core.setOutput>
  exportVariableMock: jest.SpiedFunction<typeof core.exportVariable>
}

export function setupMocks(): MockSpies {
  return {
    errorMock: jest.spyOn(core, 'error').mockImplementation(),
    getInputMock: jest.spyOn(core, 'getInput').mockImplementation(),
    setFailedMock: jest.spyOn(core, 'setFailed').mockImplementation(),
    setOutputMock: jest.spyOn(core, 'setOutput').mockImplementation(),
    exportVariableMock: jest
      .spyOn(core, 'exportVariable')
      .mockImplementation()
  }
}
