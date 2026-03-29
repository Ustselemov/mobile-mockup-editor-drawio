Ты работаешь как senior product designer + senior frontend architect + senior frontend engineer.

В репозитории уже есть документы предыдущих этапов и новое ТЗ:
- `technical_spec_universal_mobile_mockup_editor_dsl.md`
- `technical_spec_universal_mobile_mockup_editor_mvp4_ux.md`
- другие ранние ТЗ и prompt-файлы могут лежать рядом как исторический контекст

Главный документ для этой итерации:
- `technical_spec_universal_mobile_mockup_editor_mvp4_ux.md`

Твоя задача — реализовать **MVP4 / UX-first / Visual-first redesign**.

## Главный приоритет
Не расширяй продукт хаотично.
Не гонись за количеством новых функций.
Главная цель — сделать **интерфейс редактора наглядным, красивым, интуитивным и mouse-first**.

То есть приоритет такой:
1. UX audit current interface
2. redesign information architecture
3. visual-first palette and editor shell
4. mouse-first interaction model
5. polish inspector, layers, board
6. только потом — вторичные улучшения

---

# ОБЯЗАТЕЛЬНО: порядок работы

## Этап 0 — сначала разберись, что уже есть
1. Изучи текущее состояние проекта и все релевантные документы.
2. Не пересказывай мне документы в ответе.
3. Сразу создай рабочий план в кодовой базе и в docs.

Создай папку:
```text
docs/ux-audit/
```

И начни с UX review текущего UI.

---

## Этап 1 — UX audit (обязательно до редизайна)
Создай минимум такие файлы:
- `docs/ux-audit/01-current-ui-inventory.md`
- `docs/ux-audit/02-pain-points.md`
- `docs/ux-audit/03-ux-review.md`
- `docs/ux-audit/04-redesign-principles.md`
- `docs/ux-audit/05-information-architecture.md`
- `docs/ux-audit/06-wireframes-of-editor-ui.md`
- `docs/ux-audit/07-before-after-plan.md`

В audit обязательно:
- inventory всех UI-областей
- список UX-проблем с severity
- явное решение снизить роль sample screens
- объяснение, почему palette/components/patterns важнее слабых демо-экранов

Не останавливайся на документах — это только обязательный первый этап.

---

## Этап 2 — redesign editor shell
Перестрой editor shell так, чтобы структура редактора была реально удобной:

### Должно появиться или быть сильно улучшено:
- top bar
- visual left palette
- clean board
- contextual right inspector
- layers panel
- minimap
- empty state

### Главное правило
Редактор должен ощущаться как:
- визуальный конструктор
- а не текстовый технарский интерфейс

---

## Этап 3 — redesign palette
Палитра элементов должна стать главным входом в продукт.

### Требования к palette
Убери/снизь приоритет текстовых списков.
Сделай:
- visual cards
- icons
- mini previews
- categories
- search
- favorites
- recent
- click-to-insert
- drag-to-insert

### Вкладки/категории
Сделай:
- Elements
- Components
- Patterns
- Screens
- Recent
- Favorites

### Важно
Каждый элемент должен иметь:
- иконку
- короткое название
- мини-превью
- hover state
- selected state

---

## Этап 4 — board and interaction polish
Улучши canvas/board:
- cleaner visual design
- better selection states
- better hover states
- better drag feedback
- resize handles
- visible screen boundaries
- improved drop targets
- minimap
- better grid/guides visibility
- polished empty state

### Empty state
Если board пустой, пользователь должен сразу видеть:
- create screen
- presets
- quick start visual options

Без длинного текста.

---

## Этап 5 — quick insert и contextual actions
Обязательно реализуй:

### Quick insert
По клику на screen/container или через floating plus:
- открыть визуальный quick insert menu
- показать иконки
- показать превью
- вставить элемент быстро

### Context toolbar
При выделении объекта показывай near-object toolbar:
- duplicate
- delete
- lock
- bring forward
- send backward
- quick style actions

---

## Этап 6 — redesign inspector
Inspector должен стать компактнее и нагляднее.

### Сделай grouped sections:
- Identity
- Layout
- Appearance
- Text
- Behavior
- Hierarchy
- Advanced

### Используй:
- color swatches
- sliders
- segmented controls
- icon alignment controls
- stepper number inputs
- grouped cards/sections

### Не делай
Не превращай inspector в вертикальный поток сырых text inputs.

---

## Этап 7 — redesign layers
Layers должны быть визуально читаемыми.

### Требуется
- type icons
- indentation
- hierarchy visualization
- hover actions
- lock/unlock
- show/hide
- rename
- drag-to-reparent

---

## Этап 8 — не поломай базовую функциональность
При UX redesign нельзя сломать базовые ядра системы:
- board
- screen-as-parent model
- selection model
- JSON model
- import/export
- DSL-related architecture (если уже есть)

Перед завершением проверь это.

---

## Этап 9 — demo and review
Подготовь живую demo-сцену.

### Demo должна показывать:
- создание screen
- сборку экрана через palette
- quick insert
- drag/resize
- inline text editing
- inspector editing
- layers interaction
- contextual toolbar
- export

### Важно
Demo не должна опираться на плохие sample screens как основу UX.
Покажи силу:
- component palette
- visual insert
- direct manipulation

---

# ОБЯЗАТЕЛЬНЫЕ РЕЗУЛЬТАТЫ

Ты должен выдать:
1. обновлённый интерфейс
2. UX audit docs
3. redesign docs
4. рабочую visual palette
5. quick insert
6. contextual mini-toolbar
7. улучшенный inspector
8. улучшенные layers
9. polished board
10. demo

---

# ТРЕБОВАНИЯ К КАЧЕСТВУ

## Нужно
- чистый и аккуратный UI
- хорошая визуальная иерархия
- современный frontend
- модульность
- reusable UI primitives
- понятный код
- без overengineering

## Нельзя
- городить хаос
- оставлять старый неудобный UI и просто “добавить поверх ещё панель”
- тащить много текста вместо визуального языка
- раздувать sample gallery вместо нормальной palette

---

# СТИЛЬ ПРИНЯТИЯ РЕШЕНИЙ

Если нужно выбрать между:
- добавлением ещё одной функции
- улучшением понятности интерфейса

всегда выбирай улучшение понятности интерфейса.

Если нужно выбрать между:
- текстом
- визуальным представлением

всегда стремись к визуальному представлению.

Если нужно выбрать между:
- клавиатуроцентричным сценарием
- удобным mouse-first сценарием

в этой версии приоритет — mouse-first.

---

# ФОРМАТ РАБОТЫ

Не отвечай теорией.
Не ограничивайся планом.
Не проси лишних подтверждений.

Делай поэтапно:
1. audit
2. redesign docs
3. actual implementation
4. demo
5. final review summary

Сразу приступай к UX audit и затем переходи к реализации MVP4.
