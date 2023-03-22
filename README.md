# Autotag action

This action autotags a repository depending on commit messages starting with "#major:", "#minor:", "#patch:".

## Example usage

```yaml
uses: epfl-si/autotag-action@1.0
```

## Test
Fill the git_log.txt file to be processed with the use case you need and run:
```
node parse_log.js
```