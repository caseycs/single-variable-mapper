# GitHub Action to simplify variable remapping

Single-Variable-Mapper action maps variable by regular expressions.

[![Build & Deploy](https://github.com/caseycs/single-variable-mapper/actions/workflows/ci.yml/badge.svg)](https://github.com/caseycs/single-variable-mapper/actions/workflows/ci.yml)
[![Coverage Status](badges/coverage.svg)](https://github.com/caseycs/single-variable-mapper/actions)

## Sample Workflows

### Map using regular expression

```yaml
name: single-variable-mapper example
on:
  workflow_dispatch:
    inputs:
      env:
        description: 'Where to deploy'
        required: true
        default: 'staging.project.com'
        type: choice
        options:
          - 'staging.project.com'
          - 'staging-1.project.com'
          - 'staging-2.project.com'
          - 'sandbox.project.com'
          - 'sandbox-1.project.com'
          - 'sandbox-2.project.com'
          - 'project.com'
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Map deployment target to environment config
        uses: caseycs/single-variable-mapper@master
        id: mapper
        with:
          key: '${{ github.event.inputs.env }}'
          map: |
            staging(-\d+)?: staging
            sandbox(-\d+)?: sandbox
            project.com: prod
      - name: Print mapped value
        run: echo ${{ steps.mapper.outputs.value }}
        # staging for staging-X.project.com or staging.project.com
```

### Remap string value

Also showcasing different output options

```yaml
- uses: caseycs/single-variable-mapper@master
  with:
    key: sandbox
    map: |
      sandbox: preprod
    export_to: env
    export_to_env_name: mapper_value
- name: Print mapped value
  run: |
    echo ${{ env.mapper_value }}
  # preprod
```

### Custom separator

```yaml
- uses: caseycs/single-variable-mapper@master
  id: mapper
  with:
    key: staging-25
    map: |
      staging-\d+|staging
    separator: '|'
- name: Print mapped value
  run: |
    echo ${{ steps.mapper.outputs.value }}
  # staging
```

## Modes

- `fallback-to-default` - use default value when no match was found
- `fallback-to-original` - use original key when no match was found
- `strict` (default) - fail when no match was found

```yaml
- uses: caseycs/single-variable-mapper@master
  id: mapper
  with:
    key: staging
    map: |
      sandbox: preprod
    mode: fallback-to-original
- name: Print mapped value
  run: |
    echo ${{ steps.mapper.outputs.value }}
  # staging
```

```yaml
- uses: caseycs/single-variable-mapper@master
  id: mapper
  with:
    key: staging
    map: |
      sandbox: preprod
    mode: fallback-to-default
    default: playground
- name: Print mapped value
  run: |
    echo ${{ steps.mapper.outputs.value }}
  # playground
```

## Edge case - map can be empty

Mode `strict` is not supported in this case

```yaml
- uses: caseycs/single-variable-mapper@master
  id: mapper
  with:
    key: staging-5
    map: ''
    mode: fallback-to-original
    allow_empty_map: true
- name: Print mapped value
  run: |
    echo ${{ steps.mapper.outputs.value }}
  # staging-5
```
