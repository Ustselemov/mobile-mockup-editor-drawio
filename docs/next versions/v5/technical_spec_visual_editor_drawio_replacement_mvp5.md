# Техническое задание
## Проект: Universal Visual Editor / Draw.io Replacement
## Версия: v5.0 / MVP5
## Статус: Новое целевое ТЗ

---

## 1. Суть

Нужно развить текущий проект из редактора mobile mockups в **универсальный визуальный редактор**, который может заменить Draw.io для широкого класса задач.

Редактор должен поддерживать не только мобильные макеты, но и:
- мобильные экраны;
- desktop / web wireframes;
- обычные блок-схемы;
- системные и архитектурные диаграммы;
- user flows / CJM / journey maps;
- sitemap / IA / tree diagrams;
- org chart / hierarchy diagrams;
- ERD-lite / data-table diagrams;
- mind map / concept map;
- простые whiteboard-сценарии с карточками, заметками, стрелками и группировкой.

Проект не должен становиться бесконтрольным клоном «всего на свете». Нужна **универсальная основа**, покрывающая 70–80% практических сценариев визуального моделирования, wireframing и diagramming.

---

## 2. Цель продукта

Создать браузерный редактор с визуально понятным интерфейсом, который:
- работает как универсальная доска / canvas;
- позволяет собирать макеты экранов и диаграммы мышью;
- максимально визуален и интуитивен;
- не заставляет пользователя читать много текста для базовых действий;
- использует библиотеки элементов, иконки, пресеты, мини-превью и визуальные подсказки;
- хранит внутреннюю модель сцены в JSON;
- умеет импортировать и экспортировать `.drawio` как controlled subset;
- может стать базой для будущего DSL / AI generation / template engine.

---

## 3. Новая продуктовая рамка

### 3.1 Что это теперь
Это уже не только mobile mockup editor.

Это **Universal Visual Editor** с несколькими сценариями использования:
1. **Wireframe mode** — mobile / desktop / responsive screens.
2. **Flowchart mode** — блок-схемы, процессы, decision trees.
3. **Architecture mode** — boxes & connectors, system components, integration maps.
4. **Journey mode** — клиентские пути, service blueprint lite, swimlanes.
5. **Data mode** — таблицы, сущности, связи, ERD-lite.
6. **Whiteboard mode** — свободная доска, карточки, стикеры, стрелки, группировки.
7. **Mind/Tree mode** — mind map, org chart, sitemap, иерархии.

### 3.2 Что не является целью этой версии
В MVP5 не требуется:
- полноценно клонировать Figma;
- делать pixel-perfect visual design editor;
- реализовывать весь BPMN/UML/C4/ERD стандарт полностью;
- real-time collaboration;
- enterprise permissions / multi-user access control;
- advanced prototyping / animation flows.

Нужно сделать **сильное универсальное ядро**, а не бесконечный scope.

---

## 4. Основные пользовательские задачи

Пользователь должен иметь возможность:
- открыть пустую доску и начать собирать схему;
- создать artboard / frame и делать внутри него mobile или desktop экран;
- быстро добавить стандартные блоки, карточки, кнопки, поля, таблицы, стрелки;
- переключаться между режимами и наборами элементов;
- строить flowchart без ручного мучения со стрелками;
- собирать customer journey с lane / steps / notes;
- рисовать архитектурную диаграмму компонентов и связей;
- строить sitemap или mind map из узлов и веток;
- сохранять проект;
- импортировать `.drawio`;
- экспортировать `.drawio`, SVG, PNG, JSON.

---

## 5. Типы артефактов, которые редактор должен поддерживать

### 5.1 Wireframes / UI mockups
- mobile screens;
- desktop screens;
- tablet / responsive layouts;
- app flows из нескольких экранов.

### 5.2 Diagramming
- flowchart;
- swimlane flow;
- process map;
- decision tree;
- architecture diagram;
- integration diagram;
- dependency map;
- sequence-lite / interaction chain (облегчённый вариант);
- tree / org chart / sitemap;
- mind map.

### 5.3 Structured planning boards
- CJM;
- roadmap board;
- whiteboard с sticky notes и связями;
- matrix board (2x2, scorecards, prioritization maps);
- entity / table diagrams.

---

## 6. Концепция интерфейса

### 6.1 Главный принцип
Интерфейс должен быть **visual-first, mouse-first, icon-first**.

Пользователь должен понимать, что можно сделать, **по визуальному виду интерфейса**, а не по чтению длинных текстовых подсказок.

### 6.2 Ключевые UX-принципы
- минимизировать текст, где можно использовать иконку, визуальный паттерн или превью;
- каждое действие должно быть видно на доске;
- библиотека элементов должна быть визуальной, а не текстовым списком;
- sidebar-ы должны показывать мини-примеры, а не только названия;
- sample screens не должны быть ядром UX;
- фокус должен быть на **наборе элементов, шаблонов, паттернов и режимов**;
- все базовые операции должны быть доступны мышью;
- хоткеи — дополнение, а не единственный путь;
- выделение, resize, connect, reparent, grouping должны быть очевидны без инструкции.

### 6.3 Основной layout интерфейса
Редактор должен иметь:
- **верхнюю панель**: режим, файл, zoom, history, export, quick actions;
- **левую панель**: library / palette / templates / assets / search;
- **центральную область**: board / canvas;
- **правую панель**: inspector / style / layout / properties / data;
- **нижнюю область или overlay**: hints / status / quick toolbar / contextual actions;
- **mini-map** для навигации по большой доске.

### 6.4 Визуальные режимы в интерфейсе
Слева или сверху пользователь должен переключаться между режимами:
- Wireframe
- Flowchart
- Architecture
- Journey
- Data
- Whiteboard
- Mind/Tree

Переключение режима должно:
- менять palette;
- менять templates;
- менять contextual defaults;
- не ломать общую модель документа.

---

## 7. Canvas / Board / Artboard model

### 7.1 Infinite Board
Нужна бесконечная доска:
- pan мышью;
- zoom колесом;
- fit view;
- focus selected;
- mini-map;
- grid on/off;
- guides on/off.

### 7.2 Artboards / Frames
Пользователь должен уметь создавать отдельные визуальные контейнеры:
- mobile frame;
- desktop frame;
- tablet frame;
- generic frame;
- swimlane board;
- table area;
- free group / container.

Artboard/frame нужен как визуальный и логический контейнер.

### 7.3 Parent-child model
Внутри frame / container элементы должны иметь parent-child иерархию.

Требования:
- дочерние элементы движутся вместе с parent;
- координаты детей относительны parent;
- элементы можно reparent-ить drag & drop;
- ограничения на выход за bounds должны быть настраиваемыми.

### 7.4 Режимы позиционирования
Нужно поддержать:
- `absolute` — свободное позиционирование;
- `vstack` — вертикальный stack layout;
- `hstack` — горизонтальный stack layout;
- `grid` — сетка;
- `swimlane` — lane/columns;
- `tree` — древовидное авторазмещение;
- `graph` — node/edge layout c ручной донастройкой.

---

## 8. Каталог примитивов

### 8.1 Базовые примитивы
- Rectangle
- Rounded Rectangle
- Circle / Ellipse
- Diamond
- Line
- Arrow / Connector
- Polyline
- Text
- Icon placeholder
- Image placeholder
- Divider
- Sticky note
- Label
- Badge / Chip

### 8.2 Контейнеры
- Group
- Container
- Frame
- Screen
- Section
- Card
- Lane
- Column
- Grid container
- Table
- Table row
- Entity box

### 8.3 Wireframe components
- Header / Top bar
- Bottom tab bar
- Sidebar
- Search bar
- Input
- Textarea
- Checkbox
- Radio
- Switch
- Button
- Icon button
- Segmented control
- Dropdown
- List
- List item
- Product card
- Price row
- Form section
- Modal
- Bottom sheet
- Toast
- Empty state
- Stats card
- Chart placeholder

### 8.4 Flowchart / process components
- Start / End
- Process
- Decision
- Input/Output
- Manual step
- Data store
- Subprocess
- Annotation
- Connector label
- Swimlane block

### 8.5 Architecture / systems components
- Service box
- Database cylinder
- Queue/topic
- API block
- External system
- Boundary
- Cloud / infra block
- Cluster / domain boundary
- Port / anchor points

### 8.6 Data / ERD-lite components
- Table
- Column rows
- Entity
- Relation connector
- Cardinality-lite labels

### 8.7 Tree / map components
- Tree node
- Mind node
- Root node
- Branch connector
- Org person card
- Sitemap node

### 8.8 Journey / whiteboard components
- Lane
- Step card
- Touchpoint card
- Emotion marker
- Pain point note
- Sticky note
- Cluster
- Marker / stamp

---

## 9. Connectors and graph behavior

### 9.1 Connectors
Редактор должен поддержать:
- straight connector;
- orthogonal connector;
- curved connector;
- polyline connector;
- arrowheads разных типов;
- labels на линиях;
- attach к shape anchors;
- свободную привязку к target point.

### 9.2 Anchor model
У shapes должны быть:
- anchor points по сторонам;
- corner anchors;
- optional custom ports;
- snapping connectors к портам.

### 9.3 Connector UX
Пользователь мышью должен легко:
- начать соединение;
- увидеть preview линии;
- выбрать стиль линии;
- изменить маршрут;
- добавить label;
- перекинуть source/target.

### 9.4 Auto-routing
Нужно базовое auto-routing поведение:
- orthogonal reroute при движении блоков;
- сохранение ручных bend points;
- неидеально, но предсказуемо.

---

## 10. UI Modes и библиотека элементов

### 10.1 Library / Palette UX
Палитра должна показывать элементы не только текстом, но как:
- мини-иконки;
- мини-превью;
- шаблонные карточки;
- секции по категориям.

### 10.2 Обязательные разделы палитры
- Recent
- Favorites
- Basic Shapes
- Frames
- UI Components
- Flowchart
- Architecture
- Data
- Journey
- Tree / Mind
- Whiteboard
- Templates

### 10.3 Quick insert
Нужен механизм быстрого добавления:
- drag из палитры;
- double click по элементу;
- quick insert menu около выделенного блока;
- slash-style or plus-style command menu — опционально, но мышь в приоритете.

---

## 11. Visual design defaults

Нужно сохранить wireframe-friendly baseline из предыдущего примера.

### 11.1 Базовые токены по умолчанию
Использовать как дефолтный neutral/wireframe style:
- gridSize: `10`
- canvas pageWidth: `827`
- canvas pageHeight: `1169`
- base fill white: `#ffffff`
- alt neutral fill: `#f7fafb`
- header fill: `#eef5f4`
- outline / border: `#d7d0bc`
- active soft fill: `#dcefeb`
- active border: `#8fa9a2`
- primary accent text: `#0f766e`
- success action fill: `#d5e8d4`
- success border: `#82b366`
- cloud fill: `#fffaf0`
- cloud border: `#c49102`
- body text: `#1f2b2d`
- secondary text: `#66757a`
- base radius / arcSize: `8`
- small radius: `4`

### 11.2 Typography defaults
- font family: `Helvetica, Arial, sans-serif`
- title size: `12px`
- body size: `11px`
- label size: `9–10px`

### 11.3 Theme system
Требуется theme/tokens система:
- Default wireframe
- Dark-neutral
- Soft-color
- Presentation

Но MVP5 должен точно иметь хотя бы Default wireframe.

---

## 12. Управление мышью и интерактивность

### 12.1 Обязательные mouse-first операции
- drag object;
- resize object;
- rotate — опционально;
- connect objects;
- reparent into container;
- create frame by drag;
- marquee select;
- pan board;
- zoom;
- duplicate by mouse action/context menu;
- group/ungroup;
- align/distribute;
- layer reorder.

### 12.2 Context toolbar
При выделении объекта должна появляться contextual mini-toolbar с иконками:
- duplicate
- delete
- bring forward/backward
- color
- radius
- connect
- quick add related element

### 12.3 Inspector
Правая панель должна содержать вкладки:
- Style
- Layout
- Data
- Text
- Connectors
- Constraints

---

## 13. Редактирование и свойства

### 13.1 Общие свойства узлов
- id
- name
- type
- parentId
- x
- y
- width
- height
- rotation (optional)
- opacity
- visible
- locked
- zIndex
- tags[]
- metadata

### 13.2 Style properties
- fillColor
- strokeColor
- strokeWidth
- borderRadius
- shadow
- dashStyle
- padding
- spacing

### 13.3 Text properties
- text
- richText / html-lite
- fontFamily
- fontSize
- fontWeight
- textColor
- align
- verticalAlign
- lineHeight
- wrap

### 13.4 Connector properties
- sourceId
- targetId
- sourcePoint
- targetPoint
- sourcePort
- targetPort
- routingStyle
- arrowStart
- arrowEnd
- label
- bendPoints

### 13.5 Container / layout properties
- layoutMode
- gap
- padding
- justifyContent
- alignItems
- columns
- rowHeight
- laneDirection
- laneHeaderSize
- childBoundsPolicy

---

## 14. Document model

### 14.1 Внутренняя модель
Нельзя делать raw `.drawio` XML основным in-memory representation.

Нужна схема:

`JSON Document Model <-> parser/serializer <-> draw.io XML`

### 14.2 Структура документа
Документ должен включать:
- document metadata;
- pages;
- board settings;
- nodes;
- connectors;
- assets;
- themes;
- templates;
- history snapshot model.

### 14.3 Page model
Один документ может содержать несколько страниц / boards / tabs.

Требования:
- create page
- rename page
- duplicate page
- reorder pages
- delete page

---

## 15. Import / Export

### 15.1 Draw.io import
Нужно поддержать controlled subset draw.io:
- `mxfile`
- `diagram`
- `mxGraphModel`
- `mxCell`
- `mxGeometry`
- `vertex=1`
- `edge=1`
- `value`
- `style`

Импорт должен:
- восстанавливать shapes;
- восстанавливать connectors;
- восстанавливать parent-child;
- маппить supported shapes в универсальные node types;
- unsupported shapes сохранять как fallback node.

### 15.2 Draw.io export
Экспорт должен создавать валидный `.drawio` XML для supported subset.

### 15.3 Другие форматы экспорта
Обязательно:
- JSON
- SVG
- PNG

Опционально / future-ready:
- Mermaid export для простых flowchart / graph сценариев;
- Markdown embed snippets;
- HTML snapshot.

---

## 16. Template system

### 16.1 Что нужно
Шаблоны должны быть не набором бессмысленных demo screens, а:
- библиотекой reusable structures;
- стартовыми шаблонами под типовые сценарии;
- визуальными наборами элементов.

### 16.2 Обязательные template packs
- Mobile app pack
- Desktop/web wireframe pack
- Flowchart pack
- Architecture pack
- Journey pack
- Whiteboard pack
- Tree/Org pack
- Data/ERD-lite pack

### 16.3 Template UX
Каждый template должен иметь:
- мини-превью;
- понятное визуальное название;
- краткое назначение;
- возможность вставить целиком или по частям.

---

## 17. Smart helpers

Нужно добавить помощники, которые реально увеличивают удобство:
- snap lines;
- equal spacing hints;
- align suggestions;
- auto-grow container;
- auto-lane creation;
- quick duplicate with spacing;
- auto-connect next block;
- create sibling / child node from selected node;
- convert shape type without потери контента;
- swap theme tokens.

---

## 18. История, сохранение, clipboard

### 18.1 History
- undo
- redo
- grouped actions

### 18.2 Save / Load
- autosave local
- save/open JSON
- import drawio
- export drawio/svg/png

### 18.3 Clipboard
- copy/paste
- duplicate
- paste in place
- paste into selected parent

---

## 19. Поиск и навигация

Нужно поддержать:
- search elements on board;
- search pages;
- search palette items;
- highlight search results;
- jump to object;
- mini-map navigation.

---

## 20. Accessibility и usability

Хотя продукт mouse-first, нужно предусмотреть:
- readable contrast;
- obvious focus/selection state;
- minimum hit area for handles;
- keyboard shortcuts для power users;
- не делать интерфейс зависимым только от hover.

---

## 21. Архитектура реализации

### 21.1 Рекомендуемый стек
- React
- TypeScript
- Vite
- Zustand
- Zod
- dnd-kit
- SVG-based renderer или Konva
- fast-xml-parser / xmlbuilder2
- Vitest
- Playwright

### 21.2 Требование по выбору renderer
Нужно сознательно выбрать между SVG и Konva.

Критерии:
- quality of selection / resize handles;
- connectors;
- zoom / pan;
- nested coordinate systems;
- hit testing;
- maintainability.

### 21.3 Предпочтение
Если нет сильной причины иначе, рекомендуется **SVG-first renderer**, потому что:
- shapes, connectors и editor overlays прозрачнее для diagramming case;
- проще экспорт логики и дебаг;
- проще маппинг визуальных узлов к shape model.

Допускается Konva, если архитектурно обосновано лучше.

---

## 22. Структура проекта

Рекомендуемая структура:

- `src/app`
- `src/core/document`
- `src/core/model`
- `src/core/history`
- `src/core/layout`
- `src/core/connectors`
- `src/core/selection`
- `src/core/import-drawio`
- `src/core/export-drawio`
- `src/core/export-image`
- `src/features/board`
- `src/features/palette`
- `src/features/templates`
- `src/features/inspector`
- `src/features/layers`
- `src/features/minimap`
- `src/features/search`
- `src/features/modes`
- `src/features/quick-actions`
- `src/ui/components`
- `src/ui/icons`
- `src/ui/tokens`
- `src/types`
- `docs`

---

## 23. Алгоритмы / правила проверки качества

### 23.1 Rule: visual clarity
Пользователь должен понимать базовые действия без чтения документации.

Проверка:
- есть ли визуально очевидная palette;
- видно ли, как добавить элемент;
- видно ли, как соединить элементы;
- видно ли, как перемещаться по board.

### 23.2 Rule: mouse-first completeness
Все базовые действия должны выполняться мышью.

Проверка:
- создание;
- drag;
- resize;
- connect;
- reparent;
- align;
- group;
- export.

### 23.3 Rule: no fake universality
Нельзя заявлять универсальность, если реально поддержаны только mobile screens.

Проверка:
- есть ли flowchart pack;
- есть ли desktop/web frames;
- есть ли architecture shapes;
- есть ли whiteboard/journey/tree basic primitives.

### 23.4 Rule: controlled scope
Нельзя скатываться в бесконечный клон Draw.io.

Проверка:
- есть ли чёткий supported subset;
- есть ли fallback model;
- есть ли documented out-of-scope list.

### 23.5 Rule: round-trip safety
Supported subset draw.io не должен разрушаться при import/export.

Проверка:
- import known file;
- export back;
- compare node count;
- compare parent-child integrity;
- compare connector restoration.

---

## 24. Обязательные документы, которые должна создать реализация

Codex обязан создать и поддерживать:
- `docs/01-scope-and-supported-artifacts.md`
- `docs/02-ui-ia-and-modes.md`
- `docs/03-element-catalog.md`
- `docs/04-layout-and-connector-model.md`
- `docs/05-drawio-mapping.md`
- `docs/06-architecture.md`
- `docs/07-qa-and-acceptance.md`
- `docs/08-known-limitations.md`
- `docs/09-release-notes.md`

---

## 25. Этапы реализации

### Этап A — Audit и re-scope
- проанализировать текущий проект;
- понять, что из старого ядра можно сохранить;
- задокументировать gaps между current state и MVP5.

### Этап B — Universal model refactor
- refactor model from mobile-first to universal node system;
- pages, frames, shapes, connectors, templates.

### Этап C — Visual UI redesign
- palette redesign;
- modes;
- board navigation;
- inspector;
- minimap;
- context toolbar.

### Этап D — New artifact support
- desktop/web frames;
- flowchart pack;
- architecture pack;
- tree / journey / whiteboard packs.

### Этап E — Import/Export hardening
- drawio subset;
- image export;
- JSON save/load.

### Этап F — QA / polish
- tests;
- acceptance checklist;
- performance;
- demo docs.

---

## 26. Acceptance criteria

Релиз считается принятым только если выполнено всё ниже.

### 26.1 Board
- есть infinite board;
- есть pan/zoom;
- есть minimap;
- есть grid/guides.

### 26.2 Frames
- можно создать mobile frame;
- можно создать desktop frame;
- можно создать generic frame;
- дети корректно живут внутри parent.

### 26.3 Artifact coverage
- можно собрать простой mobile screen;
- можно собрать простой desktop screen;
- можно собрать flowchart из start/process/decision/end;
- можно собрать architecture diagram из service/db/api boxes;
- можно собрать mind/tree diagram;
- можно собрать journey/swimlane board;
- можно собрать whiteboard cluster из sticky notes.

### 26.4 Palette
- palette визуальная;
- есть preview items;
- есть categories;
- есть recent/favorites.

### 26.5 Connectors
- коннекторы создаются мышью;
- поддерживаются straight и orthogonal;
- labels работают;
- source/target можно менять.

### 26.6 Inspector
- style editing работает;
- text editing работает;
- layout editing работает;
- connector editing работает.

### 26.7 Import/export
- supported `.drawio` импортируется;
- supported `.drawio` экспортируется;
- JSON save/load работает;
- SVG/PNG export работает.

### 26.8 Visual UX
- базовые действия визуально очевидны;
- sample screens не являются главным путём взаимодействия;
- основной путь — palette + board + context actions.

### 26.9 Quality
- есть docs;
- есть tests;
- есть known limitations;
- есть final release report.

---

## 27. Риски

Главные риски:
- расползание scope до бесконечного “полного Draw.io”; 
- сохранение mobile-only архитектуры под видом универсальности;
- слабая connector model;
- плохой palette UX;
- псевдо-универсальность без реальных artifact packs.

### Способ борьбы с рисками
- держать controlled subset;
- документировать supported artifacts;
- refactor core model до universal;
- делать visual-first UX;
- проверять через реальные demo boards по разным категориям.

---

## 28. Главный принцип реализации

Нужно строить не “ещё один редактор экранов”, а:

> **универсальный визуальный редактор с сильным board ядром, библиотекой элементов, connectors, containers, modes и controlled draw.io compatibility**.

