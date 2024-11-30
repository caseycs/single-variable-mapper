import * as core from '@actions/core'

interface Input {
  key: string
  map: [string, string][]
  separator: string
  mode: Mode
  export_to: ExportTo[]
  export_to_env_name: string
  default_value: string
  allow_empty_map: boolean
}

enum Mode {
  Strict = 'strict',
  FallbackOriginal = 'fallback-to-original',
  FallbackDefault = 'fallback-to-default'
}

const ModeReverse: Record<string, Mode> = {
  strict: Mode.Strict,
  'fallback-to-original': Mode.FallbackOriginal,
  'fallback-to-default': Mode.FallbackDefault
}

enum ExportTo {
  Env = 'env',
  Output = 'output',
  Log = 'log'
}

const ExportToReverse: Record<string, ExportTo> = {
  env: ExportTo.Env,
  output: ExportTo.Output,
  log: ExportTo.Log
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export function run(): void {
  try {
    const input = validateAndGetInput()

    // empty map
    if (input.allow_empty_map && input.map.join('') === '') {
      switch (input.mode) {
        case Mode.FallbackOriginal:
          setOutput(input, input.key)
          return
        case Mode.FallbackDefault:
          setOutput(input, input.default_value)
          return
        default:
          throw new Error(`Unexpected mode`)
      }
    }

    // normal mode
    let result: string | undefined

    for (const pair of input.map) {
      core.debug(`Map pair: ${JSON.stringify(pair)}`)
      if (new RegExp(pair[0]).test(input.key)) {
        result = pair[1]
      }
    }

    if (result === undefined) {
      core.debug(`Mapping not found, mode: ${input.mode}`)
      switch (input.mode) {
        case Mode.FallbackOriginal:
          result = input.key
          break
        case Mode.FallbackDefault:
          result = input.default_value
          break
        default:
          throw new Error('No suitable mapping found')
      }
    }

    setOutput(input, result)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

function validateAndGetInput(): Input {
  if (core.getInput('separator') === '') {
    throw new Error(`Separator is empty`)
  }

  const map: [string, string][] = []
  for (let line of core.getInput('map').trim().split(/\r?\n/)) {
    console.log(line)
    line = line.trim()
    if (line === '') {
      continue
    }
    console.log(line)
    const pair = line.split(core.getInput('separator')).map(v => v.trim())
    if (pair.length != 2) {
      throw new Error(
        `Pattern and value pair missing, incorrect map or separator: ${line}, separator ${core.getInput('separator')}`
      )
    }
    map.push([pair[0], pair[1]])
  }

  const input: Input = {
    key: core.getInput('key'),
    map: map,
    separator: core.getInput('separator'),
    mode: ModeReverse[core.getInput('mode')],
    export_to: core
      .getInput('export_to')
      .split(',')
      .map(v => ExportToReverse[v.trim()]),
    export_to_env_name: core.getInput('export_to_env_name'),
    default_value: core.getInput('default'),
    allow_empty_map:
      typeof core.getInput('allow_empty_map') === 'string' &&
      core.getInput('allow_empty_map') != ''
  } as const

  if (input.key === '') {
    throw new Error(`Key is empty`)
  }

  if (input.mode === undefined) {
    throw new Error(
      `Invalid mode: "${core.getInput('mode')}". It must be one of: strict, fallback-to-original, fallback-to-default`
    )
  }

  if (input.allow_empty_map) {
    if (input.mode === Mode.Strict) {
      throw new Error(`Strict mode is not possible when empty map is allowed`)
    }
  } else if (input.map.join('') === '') {
    throw new Error(`Map is empty`)
  }

  if (input.export_to.filter(v => v === undefined).length) {
    throw new Error(
      `Invalid export_to: "${core.getInput('export_to')}". It must be one of: output, env`
    )
  }

  if (
    input.export_to.includes(ExportTo.Env) &&
    input.export_to_env_name == ''
  ) {
    throw new Error(
      `Empty export_to_env_name: it's required when export_to contains env`
    )
  }

  return input
}

function setOutput(input: Input, result: string): void {
  core.info(`Mapped value: ${result}`)

  // Set outputs for other workflow steps to use
  if (input.export_to.includes(ExportTo.Output)) {
    core.setOutput('value', result)
  }
  if (input.export_to.includes(ExportTo.Env)) {
    core.exportVariable(input.export_to_env_name, result)
  }
}
