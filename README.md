# GitHub Action to simplify variable mapping by a specific key

Sinelg-Variable-Mapper action maps variable by regular expressions.

## Sample Workflows

### Match multiple values to single using regular expression pattern

```yaml
on: [push]
name: single-variable-mapper example
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: caseycs/single-variable-mapper@master
        id: mapper
        with:
          key: staging-5
          map: |
            sandbox-\d+: sandbox
            staging-\d+: staging
      - name: Echo environment
        run: echo ${{ steps.mapper.outputs.value }}
        # staging
```

### Remap value

Also showcasing different output options

```yaml
- uses: caseycs/single-variable-mapper@master
  id: mapper
  with:
    key: sandbox
    map: |
      sandbox: preprod
    export_to: output, env
    export_to_env_name: mapper_value
- name: Echo environment
  run: |
    echo ${{ steps.mapper.outputs.value }}
    echo ${{ env.mapper_value }}
  # preprod
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
- name: Echo environment
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
- name: Echo environment
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
- name: Echo environment
  run: |
    echo ${{ steps.mapper.outputs.value }}
  # playground
```
