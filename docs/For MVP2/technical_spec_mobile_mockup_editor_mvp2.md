# Техническое задание для Codex AI — MVP2  
## Проект: браузерный редактор мобильных макетов с импортом/экспортом Draw.io

**Статус:** рабочее ТЗ v2.0  
**Назначение:** задать второй этап проекта:  
1) формальная приемка и gap-analysis MVP1,  
2) закрытие всех критичных разрывов,  
3) развитие редактора до устойчивого, удобного и расширяемого MVP2.

---

## 0. План документа

В MVP2 должны быть покрыты следующие блоки:

1. Контекст и цель MVP2  
2. Зависимости от документов MVP1  
3. Обязательный входной gate: аудит MVP1  
4. Что такое MVP2 и что именно в него входит  
5. Что не входит в MVP2  
6. UX и внешний вид MVP2  
7. Подробные функциональные требования  
8. Каталог элементов MVP2  
9. Визуальный стандарт и design tokens  
10. Модель данных v2  
11. Draw.io import/export v2  
12. Алгоритмы поведения  
13. Документация и артефакты  
14. Тестирование и QA  
15. Acceptance criteria для MVP2  
16. Пошаговый план реализации  
17. Решения по умолчанию

---

## 1. Контекст и цель MVP2

### 1.1. Исходная точка
Существует первое ТЗ:
- `technical_spec_mobile_mockup_editor_for_codex.md`

Существует также наблюдаемый набор референсов:
- `drawio_observed_tokens_from_example.json`

MVP2 не должен стартовать “с чистого листа”.  
Сначала нужно понять, **что реально сделано в MVP1**, а что только заявлено.

### 1.2. Главная цель MVP2
Сделать продукт, который:

- формально проходит приемку по MVP1;
- закрывает все Blocker и High gaps первого этапа;
- становится заметно удобнее как редактор;
- поддерживает расширенный, но все ещё контролируемый поднабор mobile-макетов;
- лучше сохраняет структуру и стили при import/export `.drawio`;
- пригоден для повседневой ручной работы и для дальнейшей AI-генерации.

### 1.3. Ключевая идея MVP2
MVP2 — это не новая идея продукта, а **укрепление и развитие уже заложенной архитектуры**.

Формула второго этапа:

```text
MVP1 audit
-> close blockers and gaps
-> harden data model and import/export
-> improve editor usability
-> expand supported mobile components
-> deliver stable working MVP2
```

---

## 2. Источники истины для MVP2

Во время работы над MVP2 источниками истины являются:

1. `technical_spec_mobile_mockup_editor_for_codex.md` — ТЗ MVP1.
2. `mvp1_acceptance_audit_protocol.md` — протокол аудита MVP1.
3. `drawio_observed_tokens_from_example.json` — токены, стили, реальные примитивы.
4. Исходный файл `one-click-flow-sketch.drawio`.
5. Реальный код текущего репозитория.
6. Новый документ `technical_spec_mobile_mockup_editor_mvp2.md` — это ТЗ.
7. Отчеты аудита, которые будут созданы в `docs/audit/`.

Если между MVP1 и кодом есть расхождение, сначала должно быть зафиксировано **состояние факта** в аудите, а потом принято инженерное решение в MVP2.

---

## 3. Обязательный входной gate: сначала аудит MVP1

До начала существенной переработки продукта Codex обязан выполнить аудит MVP1 по протоколу `mvp1_acceptance_audit_protocol.md`.

### 3.1. Обязательные результаты входного gate
До реализации MVP2 должны существовать файлы:

```text
docs/audit/mvp1_requirement_traceability_matrix.md
docs/audit/mvp1_manual_test_protocol.md
docs/audit/mvp1_automated_test_report.md
docs/audit/mvp1_drawio_roundtrip_report.md
docs/audit/mvp1_gap_list.md
docs/audit/mvp1_final_acceptance_report.md
```

### 3.2. Что должно быть сделано после аудита
На базе `mvp1_gap_list.md` нужно составить backlog:

- blockers to fix first;
- major gaps to fix before feature expansion;
- minor gaps and polish;
- technical debt and refactors;
- known acceptable limitations.

### 3.3. Жёсткое правило
Если аудит MVP1 показывает незакрытые Blocker-проблемы, то **feature expansion MVP2 нельзя делать раньше их исправления**.

---

## 4. Что именно входит в MVP2

MVP2 включает 5 больших направлений.

### 4.1. Направление A — Закрытие разрывов MVP1
Нужно:
- исправить все Blocker gaps;
- закрыть все критические проблемы модели данных;
- устранить потери данных при import/export;
- довести до рабочего состояния обещанные в MVP1 функции.

### 4.2. Направление B — UX-улучшение редактора
Нужно сделать редактор заметно удобнее:
- лучше навигация по доске;
- лучше работа со screen и containment;
- лучше multi-select;
- align/distribute;
- keyboard shortcuts;
- copy/paste / duplicate;
- lock/hide;
- fit actions;
- более внятный inspector;
- более внятное layers/tree.

### 4.3. Направление C — Расширение набора mobile-элементов
Нужно сохранить все элементы MVP1 и добавить типовые mobile UI-примитивы, которых ещё не хватало.

### 4.4. Направление D — Качество import/export
Нужно повысить fidelity:
- лучше маппинг style props;
- лучше стабильность parent-child;
- явные fallback nodes для неподдержанного;
- отчеты по импорту и round-trip;
- меньше silent normalization.

### 4.5. Направление E — Тесты, документация, приемка
Нужно:
- расширить coverage;
- добавить визуальные и E2E-проверки;
- документировать архитектуру и ограничения;
- сделать финальный acceptance report для MVP2.

---

## 5. Что НЕ входит в MVP2

В MVP2 не нужно делать:

- multi-user collaboration;
- облачный backend;
- комментарии и ревью как в Figma;
- полноценный клон diagrams.net;
- поддержку всех shape family draw.io;
- prototyping / transitions / interactions runtime;
- плагины;
- сложный auto-layout уровня Figma/Sketch;
- серверный AI backend.

Важно: продукт по-прежнему остаётся **узким специализированным редактором mobile mockups + flow схем**.

---

## 6. Образ продукта и UX MVP2

## 6.1. Как должен выглядеть продукт

Редактор должен ощущаться как:
- чистая браузерная рабочая среда;
- controlled design surface;
- удобный board с несколькими screen и lane;
- быстрый доступ к типовым компонентам;
- прозрачная иерархия `board -> lane -> screen -> section/container -> element`;
- понятные правки свойств справа;
- понятная структура слева;
- визуально спокойный, инженерный интерфейс, без декоративного шума.

## 6.2. Layout приложения
Обязательная структура:

1. **Top bar**
   - название проекта/документа;
   - New / Open / Import Draw.io / Export Draw.io / Save JSON / Load JSON;
   - undo / redo;
   - zoom controls;
   - fit board / fit selection / fit screen;
   - toggles: grid / snap / guides / debug.

2. **Left rail / left sidebar**
   - palette элементов;
   - screen presets;
   - component presets;
   - templates;
   - поиск по библиотеке;
   - minimap — желательно.

3. **Central board**
   - бесконечная доска;
   - pan/zoom;
   - selection box;
   - lanes and screens;
   - drag/drop/resize.

4. **Right sidebar**
   - inspector;
   - geometry;
   - style;
   - text/content;
   - layout;
   - tokens;
   - debug/xml.

5. **Bottom status bar** (рекомендуется)
   - zoom;
   - cursor coords;
   - selected node type;
   - width/height;
   - validation state;
   - autosave state.

## 6.3. Navigation и board-опыт
MVP2 должен поддерживать:

- pan:
  - middle mouse drag;
  - space + drag;
  - trackpad gestures;
- zoom:
  - ctrl/cmd + wheel;
  - UI controls;
  - fit board;
  - fit selection;
  - fit current screen;
- marquee selection;
- optional minimap;
- grid и guides по умолчанию включены;
- grid default = `10`, как в эталонном файле.

---

## 7. Функциональные требования MVP2

---

## 7.1. Board и viewport

### Обязательно
- бесконечная рабочая поверхность;
- pan/zoom без лагов;
- smooth scrolling и drag;
- выделение рамкой;
- grid on/off;
- snap on/off;
- guides on/off;
- fit board / fit selection / fit screen.

### Дополнительно желательно
- minimap;
- recentre on selected node;
- quick zoom presets.

---

## 7.2. Lane / Flow area

Нужно поддерживать `FlowLane` как в MVP1:
- крупная сценарная зона;
- заголовок;
- vertical orientation default;
- может содержать screens, texts, arrows;
- экспорт в `swimlane`.

Свойства:
- id
- title
- x, y
- width, height
- startSize
- fill
- stroke
- children

Поведение:
- lane можно перемещать;
- screen внутри lane остаются в пределах lane, если такой режим включён;
- screen может существовать и без lane, если это не запрещено настройкой документа.

---

## 7.3. Screen v2

Screen — главный контейнер для mobile UI.

### Обязательно
- создание нового screen;
- screen presets;
- editable width/height;
- border radius;
- name/title;
- optional subtitle;
- clip children;
- containment;
- move screen по board;
- child coordinates relative to screen.

### Правила
- screen всегда является валидным parent для UI-элементов;
- child нельзя случайно унести за пределы screen;
- если child выходит за bounds во время drag/resize, применяется clamp;
- reparent допускается только явно;
- move screen не должен разрушать child geometry.

### Рекомендуемые presets
- small phone: `320x568`
- medium phone: `360x780`
- iPhone-like: `390x844`
- tall android: `412x915`

### Базовый visual default из эталона
- `fillColor = #ffffff`
- `strokeColor = #1c2a30`
- `arcSize = 14`
- `container = 1`
- `connectable = 0`

---

## 7.4. Selection model

Нужно поддерживать:

- single select;
- multi-select;
- shift-select;
- marquee select;
- selection via layers tree;
- selection via canvas click;
- group transform box for multi-select;
- escape clears selection.

---

## 7.5. Drag / move / resize

### Обязательно
- drag selected node;
- resize via handles;
- clamp to parent bounds;
- drag multiple elements;
- optional snapping to siblings and parent padding.

### Правила
- movement updates node geometry;
- move inside parent uses parent-local coordinates;
- reparent converts coordinates to new local space;
- resize cannot produce negative width/height;
- tiny accidental drags should be debounced into one history transaction.

---

## 7.6. Layers / tree

Нужно:

- визуальное дерево документа;
- видно тип, название, parent-child и order;
- можно выделить node через дерево;
- можно менять порядок;
- можно скрыть node;
- можно lock node;
- можно менять parent drag-and-drop, если это не нарушает правила вложенности.

Дополнительно:
- цветовой или иконографический индикатор типа node;
- фильтр по названию и типу.

---

## 7.7. Inspector v2

Inspector должен быть нормализован по секциям.

### Секции inspector:
1. Geometry
2. Appearance
3. Typography
4. Content
5. Layout / nesting
6. Tokens
7. Advanced / raw style
8. Debug / XML preview

### Geometry
- x
- y
- width
- height
- min/max (если есть)
- rotation не нужна, если её не поддерживает продукт

### Appearance
- fillColor
- strokeColor
- strokeWidth
- opacity
- borderRadius
- shadow (если поддерживается)
- visible
- locked

### Typography
- text
- html
- fontSize
- fontWeight
- fontFamily
- textColor
- align
- verticalAlign
- lineHeight

### Content
Для composite:
- field label/value
- button label
- list items
- badge text
- banner title/body
- file tile name/status
- modal title/body/actions

### Layout / nesting
- parentId
- zIndex/order
- padding
- spacing
- clipChildren
- autoHeight (если поддерживается)

### Tokens
Нужно уметь:
- назначить token;
- сбросить в token default;
- применить local override.

---

## 7.8. Clipboard / duplication / keyboard

MVP2 должен поддерживать:

- copy
- paste
- duplicate
- delete
- undo
- redo
- arrow-key nudge
- shift+arrow larger nudge
- select all in current screen (желательно)
- bring forward / send backward (при наличии z-order)

---

## 7.9. Component library MVP2

MVP2 должен поддерживать два уровня сущностей:

### Уровень 1 — primitives
- Text
- Rect / Container
- Edge / Arrow
- Divider
- ImagePlaceholder
- IconPlaceholder

### Уровень 2 — composite components
- Field
- CheckboxRow
- RadioRow
- SwitchRow
- Button
- SegmentedControl
- Badge / Chip
- Banner
- ProductRow
- InfoRow
- PriceRow
- List
- ListItem
- FileTile / PDFTile
- EmptyState
- Modal
- BottomSheet
- TopNav/Header
- TabBar
- Toast
- SkeletonGroup
- CommentCloud

Все composite должны быть либо:
- отдельными node types,
- либо definitions + child composition, но с управляемой схемой.

---

## 7.10. Templates, presets, reusable snippets

Нужно:

- screen presets;
- component presets;
- template gallery;
- возможность вставить готовую секцию;
- возможность сохранить selection как snippet/preset — желательно;
- минимум 3 screen templates и 8 component presets.

Рекомендуемые templates:
- checkout screen
- cart screen
- success/payment result screen
- auth/login screen
- document/result viewer screen

---

## 7.11. Validation v2

Validation engine должен быть расширен и использоваться не только перед export, но и в editor.

### Проверки
- duplicate ID
- invalid node type
- missing required props
- invalid nesting
- invalid edge endpoints
- orphan child
- geometry <= 0
- child outside parent bounds
- cycle in parent chain
- unsupported style props
- invalid token reference
- composite structure corruption

### Уровни
- fatal
- warning
- info

### UI
- validation summary panel;
- warnings in status bar;
- export block on fatal.

---

## 7.12. Import Draw.io v2

MVP2 должен улучшить импорт по сравнению с MVP1.

### Обязательно
- import `.drawio` файла из local disk;
- parse `mxfile / diagram / mxGraphModel / root / mxCell`;
- распознавание:
  - lane/swimlane
  - screen frame
  - text
  - edge
  - rounded containers
  - cloud note
- mapping style string -> internal style object;
- mapping `mxGeometry`;
- mapping `value` HTML;
- warnings on unsupported.

### Дополнительно желательно
- import нескольких `diagram` страниц, если они есть;
- preview import report до commit в document;
- fallback node для unknown shapes.

---

## 7.13. Export Draw.io v2

### Обязательно
- export current document to valid `.drawio`;
- correct `mxfile`, `diagram`, `mxGraphModel`, `root`;
- deterministic order of cells;
- stable IDs or documented ID regeneration;
- serialization of supported subset;
- valid parent references;
- styles serialized in predictable order;
- text serialized as XML-safe HTML.

### Дополнительно желательно
- export selected screen;
- export selected lane;
- export diagnostic report;
- export canonicalized XML for stable diff.

---

## 7.14. JSON contract v2

Внутренняя модель по-прежнему должна быть JSON-first.

Нельзя делать raw draw.io XML primary editing model.

Правильная схема:

```text
drawio XML <-> parser/serializer <-> internal JSON model <-> editor
```

### Обязательные свойства любого node
- id
- type
- name?
- parentId?
- x
- y
- width
- height
- visible
- locked
- fillColor?
- strokeColor?
- strokeWidth?
- borderRadius?
- opacity?
- tokenRefs?
- metadata?

### Обязательные свойства document
- version
- board
- nodes
- edges
- tokens
- templates
- settings
- diagnostics?

---

## 7.15. Autosave и файловые операции

MVP2 должен поддерживать:

- new document;
- save JSON;
- load JSON;
- autosave local draft;
- restore from autosave;
- import `.drawio`;
- export `.drawio`;
- export JSON.

Дополнительно желательно:
- recent files metadata;
- dirty state indicator.

---

## 7.16. Debug / XML / AI panel

MVP2 должен упростить отладку.

Нужно:
- raw JSON preview selected node / document;
- raw XML preview export;
- import warnings viewer;
- validation results viewer;
- mapping debug for selected node:
  - internal node
  - export XML snippet
  - token resolution

Дополнительно желательно:
- “copy prompt-friendly JSON”;
- “copy component spec”.

---

## 8. Каталог элементов MVP2

Ниже список элементов, которые должны быть поддержаны на втором этапе.

---

## 8.1. Элементы, обязательные из MVP1

1. FlowLane  
2. Screen  
3. ScreenTitle / ScreenSubtitle  
4. HeaderStrip  
5. Field  
6. SectionCard  
7. CheckboxRow  
8. Button  
9. SegmentedControl  
10. Badge / Chip  
11. Banner / InfoBanner / WarningBanner  
12. InfoRow / PriceRow  
13. ProductRow  
14. Edge / Arrow  
15. CommentCloud  
16. FileTile / ResultTile / PDFTile  
17. Placeholder / Skeleton block

---

## 8.2. Новые элементы MVP2

### Input
- label
- value / placeholder
- state: default / focused / error / disabled
- leading/trailing icon optional

### Textarea
- label
- text
- rows
- helper text
- state

### RadioRow
- selected
- label
- optional description

### SwitchRow
- checked
- label
- optional description

### Divider
- direction
- thickness
- color

### IconPlaceholder
- size
- shape
- color

### ImagePlaceholder
- aspect ratio
- radius
- label optional

### List
- list style
- spacing
- itemCount

### ListItem
- title
- subtitle optional
- leading/trailing optional

### TopNav / AppHeader
- title
- leading action
- trailing actions

### TabBar
- items[]
- activeIndex

### EmptyState
- title
- description
- optional action

### Modal
- title
- body
- actions[]
- overlay

### BottomSheet
- title
- content block
- actions

### Toast
- text
- variant
- duration? (display prop only)

### SkeletonGroup
- lines / blocks
- width pattern

---

## 8.3. Общие правила для элементов
Для каждого элемента должны быть определены:
- purpose;
- node type;
- required props;
- optional props;
- default style token;
- nesting rules;
- export mapping;
- supported inspector controls.

---

## 9. Визуальный стандарт MVP2

MVP2 должен опираться на эталонные токены из `drawio_observed_tokens_from_example.json`.

## 9.1. Цветовые токены

Использовать как системные defaults:

| Token | Hex | Назначение |
|---|---|---|
| screenStroke | `#1c2a30` | рамка экрана |
| surface | `#ffffff` | базовая поверхность |
| surfaceMuted | `#f7fafb` | вторичные поверхности |
| headerTint | `#eef5f4` | шапки/strip |
| neutralBorder | `#d7e1e3` | границы |
| interactiveFill | `#dcefeb` | активный сегмент |
| interactiveStroke | `#0f766e` | интерактив/успех |
| successFill | `#d5e8d4` | primary positive CTA |
| successStroke | `#82b366` | граница CTA |
| warningFill | `#ffe6cc` | warning banner |
| warningStroke | `#d79b00` | warning border |
| noteFill | `#fffaf0` | note cloud |
| noteStroke | `#c49102` | note cloud border |
| badgeFill | `#dae8fc` | badge / file tile |
| badgeStroke | `#6c8ebf` | badge border |
| placeholderFill | `#e3ebed` | skeleton / placeholder |

## 9.2. Типографика

| Token | Спецификация | Назначение |
|---|---|---|
| displayTitle | `14px / 700 / center / #1f2b2d` | title |
| sectionTitle | `10px / 700 / left / #66757a` | section title |
| fieldLabel | `9px / 700 / left / #66757a` | labels |
| body | `11px / 400 / left / #1f2b2d` | основной текст |
| bodyStrong | `11px / 700 / left / #1f2b2d` | акцент |
| cta | `11px / 700 / center / #1f2b2d` | кнопки |
| successText | `9–11px / 400–700 / #0f766e` | bonuses/success |
| warningText | `11px / 400 / #6f4b18` | warning subtitle |

## 9.3. Скругления

| Token | arcSize | Роль |
|---|---:|---|
| r-xs | 6 | checkbox / skeleton |
| r-sm | 8 | small cards |
| r-md | 9 | badge |
| r-lg | 10 | field / card |
| r-xl | 12 | segment item |
| r-2xl | 14 | screen / main CTA |
| r-3xl | 16 | banner / special container |

## 9.4. Размеры и сетка
- gridSize = `10`
- default font family = `Helvetica, Arial, sans-serif`
- line-height baseline = `1.2`

---

## 10. Модель данных v2

## 10.1. Главный принцип
Модель должна оставаться JSON-first, typed, validation-friendly и AI-friendly.

## 10.2. Новое по сравнению с MVP1
В модели v2 нужно явно поддержать:

- token references;
- reusable preset metadata;
- validation diagnostics;
- import warnings;
- explicit component definitions for composite nodes;
- stable serialization order;
- richer clipboard metadata.

## 10.3. Рекомендуемые сущности
- `DocumentModel`
- `BoardModel`
- `LaneNode`
- `ScreenNode`
- `PrimitiveNode`
- `CompositeNode`
- `EdgeNode`
- `DesignTokenSet`
- `TemplateDefinition`
- `DiagnosticEntry`

## 10.4. Координатные системы
Нужно сохранять:
- board coords
- local coords relative to parent
- helper functions for conversion:
  - boardToLocal
  - localToBoard
  - convertBetweenParents

---

## 11. Draw.io mapping v2

## 11.1. Поддерживаемые style-keys
Нужно стабильно поддержать минимум наблюдаемые ключи:

- align
- arcSize
- collapsible
- connectable
- container
- dropTarget
- edgeStyle
- endArrow
- endFill
- entryDx
- entryDy
- entryX
- entryY
- exitDx
- exitDy
- exitX
- exitY
- fillColor
- fontStyle
- horizontal
- html
- jettySize
- orthogonalLoop
- rounded
- shape
- startArrow
- startSize
- strokeColor
- strokeWidth
- swimlane
- text
- verticalAlign
- whiteSpace

## 11.2. Правило unsupported
Если shape/style не поддержан:
- нельзя silently discard;
- нужно создать fallback node или warning entry;
- пользователь должен увидеть, что именно не было распознано полностью.

## 11.3. Round-trip goal
На поддерживаемом subset MVP2 должен быть лучше MVP1 по fidelity.

Целевые метрики:
- `supported_node_preservation_rate >= 0.99`
- `supported_style_key_preservation_rate >= 0.97`
- `fatal_roundtrip_breakages_count = 0`

---

## 12. Алгоритмы поведения MVP2

## 12.1. Add node
1. Выбран target parent.
2. Проверить правила вложенности.
3. Создать node с default token set.
4. Поместить в локальные координаты parent.
5. Применить clamp при необходимости.
6. Добавить history transaction.

## 12.2. Drag inside parent
1. Посчитать new local geometry.
2. Применить snap/guides.
3. Если parent bounded — clamp.
4. Commit as single interaction transaction.

## 12.3. Reparent
1. Определить target parent.
2. Проверить валидность вложенности.
3. Пересчитать координаты.
4. Проверить bounds.
5. Обновить tree.
6. Обновить history.

## 12.4. Resize
1. Обновить geometry.
2. Не допускать отрицательных размеров.
3. Если composite имеет minimum structure size — соблюдать min size.
4. При необходимости обновлять child layout rules.

## 12.5. Multi-select transform
1. Построить bounding box selection.
2. Применять общую трансформацию.
3. Сохранять локальные позиции в parent space.

## 12.6. Align/distribute
Нужно поддержать:
- align left/right/top/bottom/center/middle
- distribute horizontal/vertical

Работает только для selection, которая находится в одном parent или поддерживает корректный conversion.

## 12.7. Clipboard
- copy selection to internal clipboard
- paste with offset
- regenerate IDs deterministically
- preserve relative layout

## 12.8. Edge routing
- orthogonal edges by default
- source/target anchors optional
- if endpoints invalid -> validation warning/fatal

## 12.9. Token resolution
1. Node получает token refs.
2. Token values подмешиваются в effective style.
3. Local overrides имеют приоритет.
4. При export сериализуется effective style.

---

## 13. Документация и обязательные артефакты MVP2

Codex обязан создать/обновить документы:

```text
docs/audit/mvp1_requirement_traceability_matrix.md
docs/audit/mvp1_manual_test_protocol.md
docs/audit/mvp1_automated_test_report.md
docs/audit/mvp1_drawio_roundtrip_report.md
docs/audit/mvp1_gap_list.md
docs/audit/mvp1_final_acceptance_report.md

docs/mvp2/architecture.md
docs/mvp2/element-catalog-v2.md
docs/mvp2/design-tokens.md
docs/mvp2/xml-mapping-v2.md
docs/mvp2/manual-qa-v2.md
docs/mvp2/release-notes.md
docs/mvp2/final-acceptance-report.md
```

---

## 14. Тестирование и QA для MVP2

## 14.1. Unit tests
Покрыть:
- style parsing/serialization
- geometry conversion
- bounds clamp
- reparent conversion
- token resolution
- import/export for primitives
- import/export for composite nodes
- validation engine
- deterministic IDs

## 14.2. Integration tests
Покрыть:
- create screen + add elements
- tree + inspector sync
- clipboard + duplicate
- save/load JSON
- import/export drawio
- template insertion

## 14.3. E2E tests
Playwright сценарии минимум:
1. создать новый screen
2. добавить 5 разных элементов
3. изменить свойства
4. multi-select and align
5. сохранить JSON
6. экспортировать drawio
7. импортировать обратно
8. проверить, что структура осталась валидной

## 14.4. Visual regression
Нужно baseline на:
- screen
- field
- checkbox row
- button
- segmented control
- banner
- product row
- modal / bottom sheet
- file tile

## 14.5. Performance tests
Цели:
- 500 nodes — плавная работа;
- 1000 nodes — приемлемая работа без критических лагов;
- import/export эталонного файла < 1 сек на обычной машине (ориентир).

---

## 15. Acceptance criteria MVP2

Проект считается принятым как MVP2, если выполнено всё ниже.

### 15.1. Входной gate
- аудит MVP1 выполнен;
- существует final acceptance report по MVP1;
- все Blocker из MVP1 закрыты.

### 15.2. Обязательный функционал
1. Редактор запускается и стабильно работает.
2. Есть board с pan/zoom/grid/snap.
3. Есть screen, lane и containment.
4. Есть multi-select.
5. Есть align/distribute.
6. Есть inspector v2.
7. Есть layers/tree с lock/hide/order.
8. Есть save/load JSON.
9. Есть import/export `.drawio`.
10. Есть validation summary.
11. Есть debug/json/xml panel.
12. Есть минимум 3 screen templates и 8 component presets.
13. Есть новые mobile-элементы MVP2.
14. Round-trip fidelity улучшен относительно MVP1 и соответствует целевым метрикам.
15. Есть docs и tests.

### 15.3. Желательно
- minimap
- export selected screen
- snippet save
- import report preview
- visual regression setup

---

## 16. Пошаговый план реализации MVP2

### Этап 0. Аудит MVP1
- выполнить аудит по протоколу;
- построить matrix и gap list;
- вынести решение о состоянии MVP1.

### Этап 1. Закрытие blockers/high gaps
- исправить критичные проблемы модели;
- исправить import/export blockers;
- исправить containment/history/validation blockers.

### Этап 2. UX hardening
- multi-select;
- align/distribute;
- better inspector;
- better layers/tree;
- better clipboard and keyboard.

### Этап 3. Component expansion
- добавить новые primitives/composites;
- добавить presets/templates;
- нормализовать tokens.

### Этап 4. Import/export v2
- улучшить mapping;
- fallback/reporting;
- better round-trip metrics.

### Этап 5. QA and release
- unit/integration/e2e;
- visual baseline;
- manual QA docs;
- final acceptance report.

---

## 17. Решения по умолчанию

Если что-то неясно, Codex должен придерживаться следующих правил:

1. Не останавливать работу из-за мелкой неопределенности.
2. Сначала фиксировать реальное состояние продукта, потом расширять.
3. Не делать клон draw.io.
4. Предпочитать простую и расширяемую архитектуру.
5. Не редактировать raw XML как primary model.
6. Все unsupported случаи документировать, а не скрывать.
7. Все важные решения фиксировать в docs.
8. Если выбор между “быстро, но хрупко” и “чуть дольше, но устойчиво” — выбирать устойчиво.

---

## 18. Итоговая короткая формулировка задачи

Codex должен:

1. Прочитать ТЗ MVP1, протокол аудита MVP1 и это ТЗ MVP2.
2. Выполнить формальный аудит текущей реализации MVP1.
3. Зафиксировать gaps.
4. Закрыть все Blocker и High gaps.
5. Развить редактор до состояния MVP2:
   - удобный board,
   - нормальный inspector,
   - layers/tree,
   - расширенный набор компонентов,
   - лучший import/export,
   - tests/docs/reports.
6. Подготовить финальный acceptance report по MVP2.

Главная идея:

> MVP2 = не “новая демка”, а формально принятый, более зрелый и удобный редактор.
