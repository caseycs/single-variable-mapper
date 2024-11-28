/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
let errorMock: jest.SpiedFunction<typeof core.error>
let getInputMock: jest.SpiedFunction<typeof core.getInput>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>
let exportVariableMock: jest.SpiedFunction<typeof core.exportVariable>

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
    exportVariableMock = jest.spyOn(core, 'exportVariable').mockImplementation()
  })

  it('strict string on 1st line', () => {
    // Set the action's inputs as return values from core.getInput()
    const input: { [name: string]: string } = {
      key: 'k1',
      map: 'k1:v1',
      separator: ':',
      export_to: 'output',
      mode: 'strict'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()

    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'value',
      expect.stringMatching('v1')
    )
  })

  it('strict string on 2nd line', async () => {
    // Set the action's inputs as return values from core.getInput()
    const input: { [name: string]: string } = {
      key: 'k2',
      map: 'k1:v1\nk2:v2',
      separator: ':',
      export_to: 'output',
      mode: 'strict'
    }
    getInputMock.mockImplementation(name => input[name])

    await main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()

    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'value',
      expect.stringMatching('v2')
    )
  })

  it('regex string', async () => {
    // Set the action's inputs as return values from core.getInput()
    const input: { [name: string]: string } = {
      key: 'staging-23',
      map: 'staging-\\d+:staging',
      separator: ':',
      export_to: 'output',
      mode: 'strict'
    }
    getInputMock.mockImplementation(name => input[name])

    await main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()

    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'value',
      expect.stringMatching('staging')
    )
  })

  it('mode fallback-to-original', async () => {
    // Set the action's inputs as return values from core.getInput()
    const input: { [name: string]: string } = {
      key: 'sandbox-25',
      map: 'staging-d+:staging',
      separator: ':',
      export_to: 'output',
      mode: 'fallback-to-original'
    }
    getInputMock.mockImplementation(name => input[name])

    await main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()

    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'value',
      expect.stringMatching('sandbox-25')
    )
  })

  it('mode fallback-to-default', async () => {
    // Set the action's inputs as return values from core.getInput()
    const input: { [name: string]: string } = {
      key: 'sandbox-25',
      map: 'staging-d+:staging',
      separator: ':',
      export_to: 'output',
      mode: 'fallback-to-default',
      default: 'default-value'
    }
    getInputMock.mockImplementation(name => input[name])

    await main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()

    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'value',
      expect.stringMatching('default-value')
    )
  })

  it('outputs and separator', async () => {
    // Set the action's inputs as return values from core.getInput()
    const input: { [name: string]: string } = {
      key: 'k1',
      map: 'k1|v1',
      separator: '|',
      export_to: 'output,env',
      export_to_env_name: 'test',
      mode: 'strict',
      default: ''
    }
    getInputMock.mockImplementation(name => input[name])

    await main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(errorMock).not.toHaveBeenCalled()

    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'value',
      expect.stringMatching('v1')
    )
    expect(exportVariableMock).toHaveBeenNthCalledWith(
      1,
      'test',
      expect.stringMatching('v1')
    )
  })
})
