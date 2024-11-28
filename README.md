# GitHub Action to simplify variable remapping

Single-Variable-Mapper action maps variable by regular expressions.

## Sample Workflows

### Map using regular expression

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
      - name: Print mapped value
        run: echo ${{ steps.mapper.outputs.value }}
        # staging
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
