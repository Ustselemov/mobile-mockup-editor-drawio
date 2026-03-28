# Editor Model ERD

This project was generated with the assistance of Codex AI and prompted by Ustselemov.

```mermaid
erDiagram
    EDITOR_DOCUMENT {
      string id
      string name
      string version
      number idCounter
    }

    BOARD_MODEL {
      number zoom
      number panX
      number panY
      number gridSize
      boolean showGrid
      boolean snapToGrid
      boolean guides
    }

    DOCUMENT_META {
      string source
      string originalFileName
      string importedAt
      number unsupportedCount
    }

    EDITOR_NODE {
      string id
      string type
      string parentId
      number x
      number y
      number width
      number height
      boolean visible
      boolean locked
    }

    EDITOR_EDGE {
      string id
      string parentId
      string sourceId
      string targetId
      boolean orthogonal
    }

    EDITOR_DOCUMENT ||--|| BOARD_MODEL : contains
    EDITOR_DOCUMENT ||--|| DOCUMENT_META : annotates
    EDITOR_DOCUMENT ||--o{ EDITOR_NODE : stores
    EDITOR_DOCUMENT ||--o{ EDITOR_EDGE : stores
    EDITOR_NODE ||--o{ EDITOR_NODE : "parentId / children[]"
    EDITOR_EDGE }o--|| EDITOR_NODE : source
    EDITOR_EDGE }o--|| EDITOR_NODE : target
```
