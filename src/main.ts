import * as core from '@actions/core'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export function run(): void {
  try {
    const key: string = core.getInput('key')
    const map: string = core.getInput('map')
    const separator: string = core.getInput('separator')
    const mode: string = core.getInput('mode')
    const export_to: string = core.getInput('export_to')
    const default_value: string = core.getInput('default')

    // Validate the input
    const mode_pattern = /^(strict|fallback-to-original|fallback-to-default)$/
    if (!mode_pattern.test(mode)) {
      throw new Error(
        `Invalid mode: "${mode}". It must be one of: strict, fallback-to-original, fallback-to-default`
      )
    }

    const export_to_pattern = /^((env|log|output),?)+$/
    if (!export_to_pattern.test(export_to)) {
      throw new Error(
        `Invalid export_to: "${export_to}". Possible options, divided by comma: output,env,log`
      )
    }

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    // core.debug(`Waiting ${ms} milliseconds ...`)

    let result: string | undefined

    const lines = map.trim().split(/\r?\n/)

    for (const line of lines) {
      core.debug(`Line: ${line}`)
      const pair = line.split(separator) // Destructure key and value
      if (pair.length != 2) {
        throw new Error(`Key/value pair not found: ${line}`)
      }
      const regex = new RegExp(`^${pair[0]}$`)
      core.debug(`RegExp: ${regex}`)
      if (regex.test(key)) {
        result = pair[1]
      }
    }

    if (result === undefined) {
      console.log(`Mapping not found, mode: ${mode}`)
      switch (mode) {
        case 'fallback-to-original':
          result = key
          break
        case 'fallback-to-default':
          result = default_value
          break
        default:
          throw new Error('No suitable mapping found')
      }
    }

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.debug(`Mapped value: ${result}`)

    // Set outputs for other workflow steps to use
    if (export_to.includes('output')) {
      core.setOutput('value', result)
    }
    if (export_to.includes('env')) {
      core.exportVariable('value', result)
    }
    if (export_to.includes('log')) {
      core.info(`Mapped value: ${result}`)
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
