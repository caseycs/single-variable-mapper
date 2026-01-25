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

describe('correct input values, successful cases', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
    exportVariableMock = jest.spyOn(core, 'exportVariable').mockImplementation()
  })

  it('strict string on 1st line', () => {
    const input: { [name: string]: string } = {
      key: 'k1',
      map: 'k1:v1',
      separator: ':',
      export_to: 'output',
      mode: 'strict',
      allow_empty_map: 'false'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()

    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'value', 'v1')
  })

  it('strict string on 2nd line', () => {
    const input: { [name: string]: string } = {
      key: 'k2',
      map: 'k1:v1\nk2:v2',
      separator: ':',
      export_to: 'output',
      mode: 'strict',
      allow_empty_map: 'false'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()

    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'value', 'v2')
  })

  it('regex full string', () => {
    const input: { [name: string]: string } = {
      key: 'staging-23',
      map: 'staging-\\d+:staging',
      separator: ':',
      export_to: 'output',
      mode: 'strict',
      allow_empty_map: 'false'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()

    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'value', 'staging')
  })

  it('regex partial string', () => {
    const input: { [name: string]: string } = {
      key: 'staging-23.project.com',
      map: 'staging-\\d+:staging',
      separator: ':',
      export_to: 'output',
      mode: 'strict',
      allow_empty_map: 'false'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()

    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'value', 'staging')
  })

  it('regex partial string with ^ and $', () => {
    const input: { [name: string]: string } = {
      key: 'staging-23.project.com',
      map: '^staging-\\d+$:staging',
      separator: ':',
      export_to: 'output',
      mode: 'strict',
      allow_empty_map: 'false'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(setOutputMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()

    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'No suitable mapping found'
    )
  })

  it('mode fallback-to-original', () => {
    const input: { [name: string]: string } = {
      key: 'sandbox-25',
      map: 'staging-d+:staging',
      separator: ':',
      export_to: 'output',
      mode: 'fallback-to-original',
      allow_empty_map: 'false'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()

    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'value', 'sandbox-25')
  })

  it('mode fallback-to-default', () => {
    const input: { [name: string]: string } = {
      key: 'sandbox-25',
      map: 'staging-d+:staging',
      separator: ':',
      export_to: 'output',
      mode: 'fallback-to-default',
      default: 'default-value',
      allow_empty_map: 'false'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()

    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'value', 'default-value')
  })

  it('outputs and separator', () => {
    const input: { [name: string]: string } = {
      key: 'k1',
      map: 'k1|v1',
      separator: '|',
      export_to: 'output,env',
      export_to_env_name: 'test',
      mode: 'strict',
      default: '',
      allow_empty_map: 'false'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(errorMock).not.toHaveBeenCalled()

    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'value', 'v1')
    expect(exportVariableMock).toHaveBeenNthCalledWith(1, 'test', 'v1')
  })
})

describe('correct input values, edge cases', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
    exportVariableMock = jest.spyOn(core, 'exportVariable').mockImplementation()
  })

  it('strict mode, key not found', () => {
    const input: { [name: string]: string } = {
      key: 'k1',
      map: 'k2:v2',
      separator: ':',
      export_to: 'output',
      mode: 'strict',
      allow_empty_map: 'false'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()
    expect(setOutputMock).not.toHaveBeenCalled()

    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'No suitable mapping found'
    )
  })
})

describe('allowed empty map', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
    exportVariableMock = jest.spyOn(core, 'exportVariable').mockImplementation()
  })

  it('map not empty, fallback-to-default', () => {
    const input: { [name: string]: string } = {
      key: 'k1',
      map: 'k1:v2',
      separator: ':',
      export_to: 'output',
      mode: 'fallback-to-default',
      allow_empty_map: 'true'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()

    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'value', 'v2')
  })

  it('map not empty, strict', () => {
    const input: { [name: string]: string } = {
      key: 'k1',
      map: 'k1:v2',
      separator: ':',
      export_to: 'output',
      mode: 'strict',
      allow_empty_map: 'true'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()
    expect(setOutputMock).not.toHaveBeenCalled()

    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Strict mode is not possible when empty map is allowed'
    )
  })

  it('map empty, fallback-to-default', () => {
    const input: { [name: string]: string } = {
      key: 'k1',
      map: '',
      separator: ':',
      export_to: 'output',
      mode: 'fallback-to-default',
      default: 'v2',
      allow_empty_map: 'true'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()

    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'value', 'v2')
  })

  it('map empty, fallback-to-original', () => {
    const input: { [name: string]: string } = {
      key: 'k1',
      map: '',
      separator: ':',
      export_to: 'output',
      mode: 'fallback-to-original',
      default: 'v2',
      allow_empty_map: 'true'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()

    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'value', 'k1')
  })
})

describe('input validation', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
    exportVariableMock = jest.spyOn(core, 'exportVariable').mockImplementation()
  })

  it('empty key', () => {
    const input: { [name: string]: string } = {
      key: '',
      map: 'k1:v1',
      separator: ':',
      mode: 'strict',
      export_to: 'output',
      allow_empty_map: 'false'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()
    expect(setOutputMock).not.toHaveBeenCalled()

    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'Key is empty')
  })

  it('empty map', () => {
    const input: { [name: string]: string } = {
      key: 'k1',
      map: '',
      mode: 'strict',
      export_to: 'output',
      allow_empty_map: 'false'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()
    expect(setOutputMock).not.toHaveBeenCalled()

    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'Map is empty')
  })

  it('empty separator', () => {
    const input: { [name: string]: string } = {
      key: 'k1',
      map: 'k1:v1',
      mode: 'strict',
      separator: '',
      export_to: 'output',
      allow_empty_map: 'false'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()
    expect(setOutputMock).not.toHaveBeenCalled()

    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'Separator is empty')
  })

  it('invalid mode', () => {
    const input: { [name: string]: string } = {
      key: 'k1',
      map: 'k1:v1',
      mode: 'invalid',
      separator: ':',
      export_to: 'env',
      allow_empty_map: 'false'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()
    expect(setOutputMock).not.toHaveBeenCalled()

    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching('Invalid mode')
    )
  })

  it('invalid export_to - empty', () => {
    const input: { [name: string]: string } = {
      key: 'k1',
      map: 'k1:v1',
      mode: 'strict',
      separator: ':',
      export_to: '',
      allow_empty_map: 'false'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()
    expect(setOutputMock).not.toHaveBeenCalled()

    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching('Invalid export_to')
    )
  })

  it('invalid export_to - invalid', () => {
    const input: { [name: string]: string } = {
      key: 'k1',
      map: 'k1:v1',
      mode: 'strict',
      separator: ':',
      export_to: 'env,invalid',
      allow_empty_map: 'false'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()
    expect(setOutputMock).not.toHaveBeenCalled()

    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching('Invalid export_to')
    )
  })

  it('missing export_to_env_name', () => {
    const input: { [name: string]: string } = {
      key: 'k1',
      map: 'k1:v1',
      separator: ':',
      mode: 'strict',
      export_to: 'env',
      export_to_env_name: '',
      allow_empty_map: 'false'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()
    expect(setOutputMock).not.toHaveBeenCalled()

    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching('Empty export_to_env_name')
    )
  })

  it('invalid separator or map line - one piece', () => {
    const input: { [name: string]: string } = {
      key: 'k1',
      map: 'k1:v1',
      separator: '|',
      mode: 'strict',
      export_to: 'output',
      allow_empty_map: 'false'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()
    expect(setOutputMock).not.toHaveBeenCalled()

    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching('Pattern and value pair missing')
    )
  })

  it('invalid separator or map line - 3 pieces', () => {
    const input: { [name: string]: string } = {
      key: 'k1',
      map: 'k1:v1:v2',
      separator: ':',
      mode: 'strict',
      export_to: 'output',
      allow_empty_map: 'false'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()
    expect(setOutputMock).not.toHaveBeenCalled()

    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching('Pattern and value pair missing')
    )
  })

  it('invalid allow_empty_map', () => {
    const input: { [name: string]: string } = {
      key: 'k1',
      map: 'k1:v1',
      separator: ':',
      mode: 'strict',
      export_to: 'output',
      allow_empty_map: 'bla'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()
    expect(setOutputMock).not.toHaveBeenCalled()

    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching('Invalid allow_empty_map')
    )
  })

  it('invalid regex pattern', () => {
    const input: { [name: string]: string } = {
      key: 'k1',
      map: '[invalid(regex:value',
      separator: ':',
      mode: 'strict',
      export_to: 'output',
      allow_empty_map: 'false'
    }
    getInputMock.mockImplementation(name => input[name])

    main.run()
    expect(runMock).toHaveReturned()

    expect(errorMock).not.toHaveBeenCalled()
    expect(exportVariableMock).not.toHaveBeenCalled()
    expect(setOutputMock).not.toHaveBeenCalled()

    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching('Invalid regex pattern')
    )
  })
})
