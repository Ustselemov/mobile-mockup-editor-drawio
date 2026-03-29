Ты работаешь как principal product architect + principal frontend engineer.

В рабочем каталоге уже есть предыдущие ТЗ и документы проекта. Новое целевое ТЗ для следующего этапа находится в файле:
- `technical_spec_visual_editor_drawio_replacement_mvp5.md`

Твоя задача — перевести проект в новую продуктовую рамку:

не mobile mockup editor,
а **Universal Visual Editor / Draw.io Replacement (controlled scope)**.

---

# 0. Главное правило

НЕ ДЕЛАЙ вид, что текущий проект уже универсальный, если это не так.

Сначала:
- проведи честный audit;
- определи, что уже реализовано;
- определи, что нужно переработать;
- только потом переходи к реализации.

Нельзя просто “добавить пару новых shape types” и объявить задачу выполненной.

---

# 1. Что нужно получить в итоге

Нужен браузерный редактор, который поддерживает:
- mobile wireframes;
- desktop/web wireframes;
- flowcharts;
- architecture diagrams;
- journey/swimlane boards;
- tree/mind/org diagrams;
- ERD-lite/data diagrams;
- whiteboard-style diagrams.

Это должен быть **универсальный board editor** с:
- frames / containers;
- palette / libraries;
- connectors;
- modes;
- inspector;
- minimap;
- draw.io import/export for supported subset.

---

# 2. Обязательный порядок работы

## Этап 1 — Audit текущего проекта

1. Прочитай новое ТЗ полностью.
2. Проанализируй текущий код и текущую архитектуру.
3. Составь честный gap report:
   - что уже соответствует новому ТЗ;
   - что частично соответствует;
   - что вообще отсутствует;
   - какие части ядра нужно refactor-ить.

Сохрани результат в:
- `docs/10-mvp5-gap-analysis.md`

Используй статусы:
- PASS
- PARTIAL
- FAIL

---

## Этап 2 — Product re-scope и universal model

Ты обязан перевести проект от mobile-first модели к universal visual model.

Нужно спроектировать и реализовать:
- pages;
- board;
- frames;
- generic nodes;
- connectors;
- containers;
- layout modes;
- templates;
- artifact modes.

Нельзя оставлять ядро, жёстко привязанное только к mobile screens.

Сохрани спецификацию в:
- `docs/11-universal-model.md`

---

## Этап 3 — UI/UX redesign

Нужно сделать visual-first redesign интерфейса.

Требования:
- палитра должна быть визуальной, не текстовой;
- элементы должны иметь иконки/мини-превью;
- sample screens не должны быть главным UX-механизмом;
- основной путь пользователя: board + palette + context actions + inspector;
- всё базовое должно быть доступно мышью.

Сделай и задокументируй:
- `docs/12-ui-ux-redesign.md`

---

## Этап 4 — Реализация artifact packs

Обязательно поддержать минимум следующие packs:

1. Mobile wireframe pack
2. Desktop/web wireframe pack
3. Flowchart pack
4. Architecture pack
5. Journey/swimlane pack
6. Tree/mind/org pack
7. Whiteboard pack
8. Data/ERD-lite pack

Для каждого pack:
- зафиксируй список элементов;
- реализуй palette items;
- добавь demo board.

Документация:
- `docs/13-artifact-packs.md`

---

## Этап 5 — Connectors и containers

Это критически важный слой. Реализуй:
- straight connectors;
- orthogonal connectors;
- labels on connectors;
- anchor points;
- reattach source/target;
- bend points;
- parent-child containers;
- frame bounds behavior;
- group/ungroup.

Если нужно — переработай selection / interaction model.

Документация:
- `docs/14-connectors-and-containers.md`

---

## Этап 6 — Import / Export

Нужно довести draw.io compatibility до controlled but honest state.

Реализуй:
- import supported subset of `.drawio`;
- export supported subset of `.drawio`;
- JSON save/load;
- SVG export;
- PNG export.

При unsupported draw.io shapes:
- не терять silently;
- использовать fallback representation;
- логировать warning/report.

Документация:
- `docs/15-drawio-compatibility.md`

---

## Этап 7 — QA и release package

Подготовь:
- тесты;
- acceptance checklist;
- known limitations;
- release notes;
- final report.

Обязательные файлы:
- `docs/16-qa-checklist.md`
- `docs/17-known-limitations.md`
- `docs/18-release-report.md`

---

# 3. UX-требования, которые нельзя игнорировать

1. Интерфейс должен быть визуально понятным.
2. Мышью должно делаться всё базовое.
3. Palette должна быть visual-first.
4. Board navigation должна быть удобной.
5. Нужно minimap.
6. Нужен context toolbar.
7. Нужен inspector.
8. Нужны modes.
9. Нельзя строить UX вокруг длинных текстовых списков.
10. Нельзя делать вид, что sample screens = универсальный UX.

---

# 4. Архитектурные требования

1. Не использовать `.drawio` XML как primary in-memory model.
2. Использовать internal JSON document model.
3. Разделить:
   - model
   - rendering
   - interaction
   - import/export
   - templates
4. Обеспечить масштабируемость под новые modes/packs.
5. Не делать overengineering.
6. Не клонировать весь Draw.io.

---

# 5. Что нужно реализовать в коде

Минимум нужно реально доставить:

## Board / Navigation
- infinite board
- pan / zoom
- minimap
- fit view
- grid / guides

## Frames / Containers
- mobile frame
- desktop frame
- generic frame
- swimlane container
- groups

## Nodes / Shapes
- rectangles
- rounded rectangles
- circle
- diamond
- text
- sticky note
- card
- table/entity box
- UI components

## Connectors
- straight
- orthogonal
- labels
- reattach

## Palette / Modes
- visual palette
- categorized packs
- recent/favorites
- mode switcher

## Inspector
- style
- text
- layout
- connector settings

## Files
- JSON save/load
- drawio import/export
- SVG/PNG export

---

# 6. Что нельзя делать

НЕ ДЕЛАЙ:
- fake-universal editor, который реально умеет только mobile screens;
- text-heavy interface вместо visual-first UX;
- бесконтрольный scope expansion до полного клона Draw.io/Figma;
- архитектуру, где невозможно добавлять новые modes;
- экспорт, который silently теряет supported elements.

---

# 7. Формат работы

Работай как сильный инженер:
- принимай решения;
- рефакторь, если нужно;
- не бойся переработать фундамент;
- не останавливайся на документации;
- создай рабочий код, demo boards, docs и release package.

---

# 8. Порядок вывода результата

В конце ты должен показать:
1. Что было найдено в gap analysis.
2. Что было переработано.
3. Что реализовано.
4. Какие ограничения остались.
5. Где лежат demo boards и docs.

---

# 9. Начинай

Начни с:
1. чтения нового ТЗ;
2. анализа текущего проекта;
3. создания `docs/10-mvp5-gap-analysis.md`;
4. затем переходи к refactor + implementation.

Не застревай в объяснениях. Двигайся по коду и артефактам.
