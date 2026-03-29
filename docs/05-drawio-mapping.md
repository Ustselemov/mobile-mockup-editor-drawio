# V5 Draw.io Mapping

## Internal rule
JSON document model remains the primary in-memory representation.

## Supported draw.io subset
- `mxfile`
- `diagram`
- `mxGraphModel`
- `mxCell`
- `mxGeometry`
- vertex cells
- edge cells
- `style`
- `value`

## Import/export behavior
- supported nodes map into internal nodes
- supported edges map into internal connectors
- unsupported shapes are preserved as fallback nodes with warnings
- no silent data loss is allowed
