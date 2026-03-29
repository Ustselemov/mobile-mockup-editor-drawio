# Техническое задание для Codex AI
## Проект: Universal Mobile Mockup Editor + DSL
### Статус: ТЗ v4.0 / MVP4 (UX-first / Visual-first redesign)
### Назначение: провести UX-аудит текущего интерфейса редактора и реализовать новую визуально-интуитивную версию интерфейса, ориентированную на мышь, визуальные элементы, палитру компонентов и прямое манипулирование объектами

---

## 0. Суть этой версии

Предыдущие версии ТЗ были направлены на:
- базовую архитектуру;
- draw.io import/export;
- JSON model;
- DSL;
- универсальность под разные классы мобильных приложений.

**Эта версия — следующий этап.**

Главная цель MVP4:

> превратить редактор из «технически способного инструмента» в **наглядный, красивый, интуитивный визуальный продукт**, которым удобно пользоваться почти без чтения текста.

### Основной фокус MVP4
Не добавление максимального числа новых сущностей, а:
- **UX-аудит текущего интерфейса**;
- **редизайн взаимодействия**;
- **visual-first UI**;
- **mouse-first control model**;
- **сильная палитра элементов** вместо ориентации на примеры экранов;
- **уменьшение текстовой нагрузки**;
- **повышение discoverability**;
- **повышение скорости ручной сборки экранов**.

---

## 1. Как назвать эту версию

### Рекомендуемое наименование
- **MVP4**
- **v4.0**
- **UX-first / Visual-first redesign**

### Почему именно MVP4
Логика версий:
- MVP1 — базовый рабочий редактор
- MVP2 — проверка, аудит и стабилизация
- MVP3 — универсализация, компонентная модель, DSL, layout engine
- **MVP4 — UX-переосмысление, визуальная зрелость, удобство реального использования**

То есть MVP4 — это:

> не «ещё одна пачка фич», а **этап продуктовой упаковки и usability-перехода**

---

## 2. Цель продукта в рамках MVP4

### 2.1. Главная цель
Сделать интерфейс редактора таким, чтобы пользователь:
- быстро понимал, **что где находится**;
- видел доступные элементы **визуально**, а не через длинные текстовые списки;
- мог почти всё делать **мышью**, не погружаясь в документацию;
- воспринимал продукт как **простой, красивый, управляемый визуальный конструктор**, а не как полутехнический редактор.

### 2.2. Практическая цель
Пользователь должен быть способен:
- открыть редактор;
- создать экран;
- перетащить 5–10 элементов;
- собрать типовой mobile wireframe;
- отредактировать свойства;
- не тратить время на чтение длинных подписей и разгадывание UI.

### 2.3. Ключевая формула этой версии

```text
less reading + more seeing + more direct manipulation + better visual affordance
```

---

## 3. Главная проблема текущего состояния

Эта версия исходит из следующего продуктового наблюдения:

### 3.1. Что сейчас ощущается слабым
- интерфейс может быть слишком «текстовый»;
- элементы и действия могут быть плохо различимы визуально;
- ориентация на примеры экранов выглядит как вторичный и не очень полезный сценарий;
- пользователю важнее **палитра строительных блоков**, а не слабые демо-экраны;
- визуальный язык редактора может быть недостаточно чистым и очевидным;
- действия могут быть спрятаны в текст, а не показаны иконками, зонами, ручками, контекстными панелями;
- может не хватать «ощущения управления объектами руками».

### 3.2. Продуктовый вывод
Нужно перейти от:

> «редактор, который умеет»

к:

> «редактор, в котором сразу понятно, как действовать»

---

## 4. Что НЕ является задачей MVP4

В этой версии **не нужно**:
- превращать продукт в Figma;
- бесконечно расширять каталог доменных шаблонов;
- усложнять DSL ради редких кейсов;
- строить мощную систему sample screens как главный UX-сценарий;
- делать продукт текстоцентричным;
- плодить панели, вкладки и параметры без явной UX-пользы.

### Важный принцип
В MVP4 приоритет:
1. визуальная ясность;
2. простота взаимодействия;
3. discoverability;
4. прямое манипулирование;
5. только потом — дополнительные функции.

---

## 5. Обязательный этап: UX-аудит текущего интерфейса

Перед редизайном Codex **обязан** провести UX-аудит текущего состояния проекта.

### 5.1. Что нужно сделать
Создать папку:

```text
docs/ux-audit/
```

И подготовить минимум следующие файлы:

1. `01-current-ui-inventory.md`
2. `02-pain-points.md`
3. `03-ux-review.md`
4. `04-redesign-principles.md`
5. `05-information-architecture.md`
6. `06-wireframes-of-editor-ui.md`
7. `07-before-after-plan.md`

### 5.2. Что должно быть в аудите
#### А. Inventory
Полный список текущих UI-областей:
- top bar
- left panel
- board/canvas
- right inspector
- layers
- bottom controls
- dialogs
- palette
- template area
- example screens area

#### B. Оценка по критериям
Для каждой области оценить:
- понятность;
- визуальную иерархию;
- читаемость;
- кликабельность;
- discoverability;
- избыточность текста;
- качество иконографии;
- количество действий мышью;
- density / clutter;
- полезность для основной задачи.

#### C. Проблемы
Обязательно выделить:
- Blocker UX issues
- High UX issues
- Medium UX issues
- Cosmetic issues

#### D. Решения
Для каждой проблемы должно быть:
- краткое описание;
- чем мешает;
- proposed redesign;
- affected screens/areas.

### 5.3. Главный вывод, который должен быть зафиксирован
В аудите должно быть явно зафиксировано решение:

> **Демо-экраны и слабые sample screens не должны быть главным способом входа в продукт.**

Вместо этого продукт должен опираться на:
- **element palette**;
- **component library**;
- **patterns**;
- **quick insert**;
- **visual thumbnails**;
- **screen presets**.

---

## 6. Продуктовые принципы новой версии интерфейса

### 6.1. Visual-first
Всё, что можно показать визуально, должно быть показано визуально:
- иконкой;
- мини-превью;
- превью-компонентом;
- контекстной панелью;
- ручками выделения;
- цветовым индикатором;
- визуальным состоянием.

### 6.2. Mouse-first
Большинство действий должно быть удобно делать мышью:
- создание;
- перетаскивание;
- вставка;
- изменение размера;
- копирование;
- выравнивание;
- переупорядочивание;
- смена parent;
- настройка свойств через мышь.

### 6.3. Direct manipulation
Объект должен ощущаться как объект:
- выделяется рамкой;
- имеет ручки;
- имеет быстрые действия рядом;
- тащится напрямую;
- живёт в screen-parent;
- показывает границы и контекст.

### 6.4. Progressive disclosure
Не показывать весь контроль сразу.
Показывать:
- базовые действия сразу;
- дополнительные — по выделению;
- редкие настройки — в advanced.

### 6.5. Component-first
Основной сценарий — не «смотреть примеры экранов», а:
- брать элемент;
- брать компонент;
- вставлять;
- собирать экран.

### 6.6. Pattern-first
Поверх отдельных компонентов должны быть:
- готовые паттерны;
- блоки секций;
- типовые mobile-комбинации.

---

## 7. Новая структура интерфейса редактора

Нужно переработать редактор так, чтобы его основная структура была следующей.

### 7.1. Верхняя панель (Top bar)
Назначение:
- навигация по проекту;
- global actions;
- текущий режим;
- zoom;
- export/import;
- undo/redo;
- save status.

#### Обязательные элементы top bar
- логотип / название проекта
- project name
- save status indicator
- undo
- redo
- zoom in
- zoom out
- fit to screen / fit selection
- import
- export
- settings
- help

#### UX требования
- минимум текста
- максимум иконок
- tooltip по hover
- единый визуальный стиль
- не перегружать top bar вторичными действиями

---

### 7.2. Левая панель — главный инструментальный блок
Левая панель должна стать **главной точкой входа** в элементы редактора.

#### Структура левой панели
В левой панели должны быть вкладки/режимы:
1. **Elements**
2. **Patterns**
3. **Components**
4. **Screens**
5. **Recent**
6. **Favorites**

### 7.2.1. Elements
Содержит низкоуровневые и стандартные элементы:
- screen
- container
- stack
- row
- grid
- text
- button
- input
- textarea
- checkbox
- radio
- switch
- divider
- image placeholder
- icon placeholder
- badge
- chip
- tab bar
- header
- list
- list item
- modal
- bottom sheet
- arrow
- comment

### 7.2.2. Components
Готовые собранные reusable UI-блоки:
- login header
- product card
- cart row
- payment method selector
- profile block
- chat bubble
- message composer
- stats card
- booking row
- progress block

### 7.2.3. Patterns
Наборы из нескольких блоков:
- checkout summary
- search + filters + results
- chat input area
- profile header + actions
- onboarding hero + CTA
- list section
- pricing section

### 7.2.4. Screens
Только **качественные screen presets**, а не мусорные демо-экраны.
Сюда входят:
- blank phone screen
- iPhone-like screen preset
- Android-like screen preset
- login screen preset
- catalog preset
- checkout preset
- chat preset
- dashboard preset

### 7.2.5. Recent
Недавно использованные элементы.

### 7.2.6. Favorites
Пользовательские избранные элементы/компоненты.

#### Главный UX принцип левой панели
Каждый элемент в левой панели должен отображаться не строкой текста, а как:
- иконка;
- название;
- визуальное мини-превью;
- hover preview;
- иногда мини-wireframe карточка.

### 7.2.7. Обязательные функции левой панели
- search
- category filter
- compact / comfortable mode
- pin favorite
- drag from panel to canvas
- click to insert into selected screen
- hover preview on board

---

### 7.3. Центральная область — board / canvas
Центральная зона должна быть визуально чистой.

#### Обязательные свойства board
- infinite canvas
- pan by mouse drag
- zoom by wheel and controls
- minimap
- visible grid (optional toggle)
- snap guides
- drop targets
- clear highlighting of screen boundaries
- visible selection states

#### UX требования
- board не должен быть визуально грязным;
- фон должен быть нейтральным;
- элементы должны контрастно читаться;
- screen objects должны визуально выделяться как основные контейнеры;
- пустая доска должна давать понятный next action.

### 7.3.1. Empty state board
Если на board нет ни одного screen, пользователь должен видеть большой визуальный empty state:
- большая кнопка/карточка “Create screen”;
- несколько screen preset cards;
- небольшой визуальный quick-start;
- не длинный текстовый онбординг.

---

### 7.4. Правая панель — Inspector
Inspector должен быть **контекстным** и **прогрессивно раскрывающимся**.

#### Базовые секции inspector
1. Identity
2. Layout
3. Appearance
4. Text
5. Behavior
6. Parent / hierarchy
7. Advanced

#### Что важно по UX
- не перегружать десятками полей сразу;
- группировать свойства;
- использовать иконки, свотчи, слайдеры, segmented controls;
- цвета — через swatches и picker, а не только через hex text;
- border radius — через number input + slider;
- spacing/padding — визуально;
- alignment — через иконки выравнивания.

### 7.4.1. Preferred controls
Нужно предпочитать:
- sliders
- segmented buttons
- swatches
- icon toggles
- stepper inputs
- mini-preview controls

Вместо:
- сырых текстовых полей везде подряд.

---

### 7.5. Layers / Structure panel
Структура должна быть визуально понятной.

#### Требования
- дерево экранов и детей;
- nested structure;
- drag and drop reparent;
- lock/unlock;
- show/hide;
- rename;
- type icon рядом с каждым узлом;
- явная индикация parent-child.

#### UX правило
Список слоёв не должен быть текстовой кашей.
Должны быть:
- иконки типов;
- отступы и вложенность;
- hover actions;
- статусные маркеры.

---

## 8. Отказ от слабых sample screens как основной UX-опоры

### 8.1. Проблема
Просто показывать набор неполноценных примеров экранов как главный сценарий входа — плохое решение.

### 8.2. Решение
Перенести sample screens в роль:
- optional gallery;
- template pack;
- examples section;
- inspiration only.

Но не делать их центром продукта.

### 8.3. Что должно быть вместо этого
В центре UX должны быть:
- библиотека элементов;
- библиотека компонентов;
- библиотека паттернов;
- quick insert;
- presets для screen;
- drag-and-drop assembly.

---

## 9. Обязательные UX-сценарии новой версии

### 9.1. Сценарий 1 — быстрый старт
Пользователь открывает продукт и без документации способен:
1. создать screen;
2. перетащить header;
3. перетащить text;
4. перетащить button;
5. отредактировать текст;
6. изменить размер screen;
7. экспортировать.

### 9.2. Сценарий 2 — сборка экрана мышью
Пользователь собирает screen полностью через mouse-first interaction:
- insert component
- move
- resize
- duplicate
- align
- reorder
- edit basic properties

### 9.3. Сценарий 3 — работа через quick insert
Пользователь кликает по screen / container и получает контекстное меню вставки:
- text
- button
- input
- list item
- image
- container

### 9.4. Сценарий 4 — замена примеров на библиотеку
Пользователь не ищет “какой-то готовый плохой экран”, а берёт:
- patterns;
- sections;
- components;
- presets.

---

## 10. Компонентная библиотека v1 для UX-first режима

Нужно оформить и визуально представить каталог компонентов.

### 10.1. Базовые примитивы
- Screen
- Container
- VStack
- HStack
- Grid
- Text
- Icon
- Image Placeholder
- Divider
- Arrow
- Comment Bubble

### 10.2. Базовые mobile UI components
- Header
- Title Block
- Subtitle Block
- Button (primary, secondary, ghost)
- Input
- Textarea
- Checkbox
- Radio Group
- Switch
- Segmented Control
- Chip
- Badge
- Card
- List
- List Item
- Search Bar
- Filter Bar
- Tab Bar
- Bottom Sheet
- Modal
- Toast
- Empty State

### 10.3. Compound components
- Product Card
- Cart Row
- Payment Selector
- Order Summary
- Profile Header
- Profile Actions
- Chat Bubble
- Chat Composer
- Feed Card
- Stats Widget
- Booking Card
- Calendar Slot Row
- Lesson Card
- Progress Section

### 10.4. Для каждого элемента обязательно
Нужно иметь:
- визуальную карточку в palette;
- понятную иконку;
- короткое название;
- default preview;
- default properties;
- поддерживаемые states;
- mouse insertion path;
- inspector sections.

---

## 11. Visual language / дизайн-система интерфейса самого редактора

### 11.1. Общие требования
Интерфейс редактора должен быть:
- светлым или нейтральным;
- аккуратным;
- современным;
- не перегруженным;
- с мягкими тенями и скруглениями;
- с хорошим контрастом;
- без визуального шума.

### 11.2. Обязательные визуальные принципы
- чёткая иерархия размеров
- 2–3 уровня акцентности, не 10
- минималистичная иконография
- единый стиль контролов
- много воздуха
- понятные hover / active / selected states
- очень читаемые drop targets
- понятные screen boundaries

### 11.3. Базовый wireframe style для генерируемых экранов
Как дефолтный стиль использовать наблюдаемые токены из исходного `.drawio` как baseline:
- светлый neutral background
- cards: белый фон
- secondary containers: #f7fafb
- soft tinted blocks: #eef5f4
- border: #d7d0bc
- accent success-ish: #d5e8d4 / #82b366
- accent teal-ish labels: #0f766e
- radius baseline: 8
- small radius: 4
- grid baseline: 10

### 11.4. Визуальный язык palette cards
Карточки элементов в левой панели должны иметь:
- мини-wireframe preview;
- иконку;
- короткое название;
- hover shadow;
- selected state;
- drag cursor;
- preferred insertion badge (optional).

---

## 12. Новые взаимодействия, которые должны появиться

### 12.1. Quick insert
По клику на свободной области внутри screen или через floating + button должен открываться quick insert menu.

#### Формат quick insert
- иконки;
- категории;
- недавние элементы;
- visual previews;
- мгновенная вставка.

### 12.2. Contextual object toolbar
По выделению объекта рядом с ним должна появляться компактная toolbar:
- duplicate
- delete
- lock
- bring forward
- send backward
- convert to component (если поддерживается)
- quick style preset

### 12.3. Hover affordances
На hover должны быть видны:
- outline
- insertion hint
- drag handle
- parent highlight

### 12.4. Inline editing
Текст редактируется прямо на canvas по double click.

### 12.5. Resize handles
Resize должен быть визуально чистым и очевидным.

### 12.6. Parent boundaries
Если объект живёт внутри screen, границы должны ощущаться.
При попытке выйти за пределы:
- clamp / constraint;
- либо явный reparent gesture.

---

## 13. Обязательный redesign information architecture

Нужно переработать IA редактора.

### 13.1. Приоритеты интерфейса
1. create/insert
2. manipulate
3. inspect/edit
4. organize
5. export

### 13.2. Что должно быть вторичным
- тяжёлые sample galleries;
- длинные текстовые help-блоки;
- второстепенные редкие настройки;
- редкие экспериментальные режимы.

### 13.3. Правило размещения функций
- частые действия — near object / top bar / obvious left panel
- свойства объекта — right inspector
- структура — layers pane
- templates/examples — secondary level

---

## 14. Обязательные UX-метрики и критерии успеха

Codex должен ориентироваться на следующие проверяемые цели.

### 14.1. Time-to-first-screen
Новый пользователь должен уметь создать первый screen за **≤ 30 секунд**.

### 14.2. Time-to-basic-wireframe
Новый пользователь должен уметь собрать экран из 5–8 блоков за **≤ 2 минуты** без чтения длинной документации.

### 14.3. Discoverability
Основные действия должны быть доступны без поиска по документации:
- create screen
- add element
- move
- resize
- edit text
- delete
- duplicate
- export

### 14.4. Reading load
Нужно минимизировать длинные текстовые блоки.
Ставка — на:
- icon + tooltip
- preview + label
- contextual actions

### 14.5. Palette usability
Пользователь должен понимать, что именно он вставит, **до вставки**.
Это значит:
- preview required
- icon required
- label required
- hover preview desirable

---

## 15. Обязательные deliverables по UX redesign

Codex должен создать не только код, но и UX-артефакты.

### 15.1. Документы
В `docs/ux/` должны быть созданы:
- `ui-review.md`
- `pain-points.md`
- `redesign-goals.md`
- `editor-ia.md`
- `editor-layout.md`
- `interaction-model.md`
- `visual-guidelines.md`
- `palette-system.md`
- `component-gallery-spec.md`
- `quick-insert-spec.md`
- `before-after-summary.md`

### 15.2. Визуальные артефакты
Нужно подготовить:
- editor wireframes
- editor UI sketches
- before/after diagrams
- palette preview sheets
- inspector states
- layers panel states

Если удобно, можно хранить это как markdown + embedded images / simple diagrams / internal mockup JSON.

---

## 16. Что конкретно должно быть переделано в продукте

### 16.1. Palette redesign
Требуется:
- перейти от текстового списка к visual cards;
- добавить иконки;
- добавить previews;
- сделать categories;
- добавить Favorites / Recent;
- сделать click-to-insert и drag-to-insert.

### 16.2. Board polish
Требуется:
- очистить визуальный шум;
- улучшить selection states;
- улучшить drag feedback;
- улучшить resize feedback;
- добавить minimap;
- улучшить empty state.

### 16.3. Inspector redesign
Требуется:
- перейти на grouped controls;
- использовать swatches, sliders, segmented buttons;
- сократить сырые text-input-only настройки;
- улучшить hierarchy of controls.

### 16.4. Layers redesign
Требуется:
- добавить иконки типов;
- улучшить вложенность;
- показать состояния;
- добавить hover actions.

### 16.5. Quick insert
Обязательно реализовать.

### 16.6. Contextual mini-toolbar
Обязательно реализовать.

### 16.7. Better empty states
Обязательно реализовать.

### 16.8. Sample screens demotion
Обязательно снизить их роль и увести на вторичный уровень.

---

## 17. Технические требования к реализации UX redesign

### 17.1. Архитектурный принцип
Новый UX не должен ломать базовую архитектуру редактора.
Редизайн должен работать поверх уже существующих:
- JSON model;
- selection model;
- layout engine;
- import/export layer.

### 17.2. Что нельзя делать
Нельзя реализовывать UX редизайн как хаотический набор хаков.

Нужно:
- сохранять модульность;
- изолировать visual UI layer;
- ввести design tokens редактора;
- ввести reusable panel/card/control primitives.

### 17.3. Предпочтительная структура
Нужно ввести или усилить такие модули:
- `src/features/editor-shell`
- `src/features/palette`
- `src/features/quick-insert`
- `src/features/context-toolbar`
- `src/features/inspector`
- `src/features/layers`
- `src/features/minimap`
- `src/ui/primitives`
- `src/ui/tokens`
- `src/ui/icons`
- `src/ui/patterns`

---

## 18. Детальные правила по управлению мышью

### 18.1. Primary mouse actions
Должны быть удобными:
- left click select
- drag move
- drag from palette to screen
- resize by handles
- double click edit text
- right click context menu (optional but desirable)
- wheel zoom
- middle/space drag pan (если реализуется)

### 18.2. Secondary mouse actions
Желательны:
- drag duplicate with modifier
- lasso selection
- hover preview
- hover parent highlight
- drag reorder in layers

### 18.3. Mouse-first приоритет
Все основные сценарии должны быть выполнимы мышью **без обязательного использования клавиатуры**.

---

## 19. Accessibility и usability

Хотя редактор visual-first, нужно сохранить разумную доступность.

### 19.1. Обязательно
- tooltips
- readable contrast
- focus states
- понятные hover states
- не слишком мелкие click targets
- панельная структура с логичными группами

### 19.2. Желательно
- keyboard navigation as bonus
- command palette later

Но это вторично относительно mouse-first UX.

---

## 20. Acceptance criteria для MVP4

MVP4 считается принятым, если выполнены все нижеперечисленные условия.

### 20.1. UX audit completed
Есть полный пакет UX-аудита и redsign docs.

### 20.2. Palette transformed
Палитра элементов визуальная, а не текстовая.

### 20.3. Mouse-first flow improved
Пользователь может собрать экран почти целиком мышью.

### 20.4. Quick insert works
Есть быстрый визуальный способ вставки элементов в screen.

### 20.5. Context toolbar works
Есть near-object quick actions.

### 20.6. Inspector redesigned
Inspector визуально лучше, компактнее и понятнее.

### 20.7. Layers redesigned
Структура читается визуально.

### 20.8. Sample screens demoted
Они не являются основным UX-сценарием.

### 20.9. Empty state improved
Пустая доска не выглядит мёртвой и непонятной.

### 20.10. Demo available
Есть живая demo-сборка, в которой видно новую UX-логику.

---

## 21. Обязательные demo-сценарии

Codex должен подготовить demo, в которой можно показать:

1. create blank screen
2. add elements from palette
3. use quick insert
4. drag and resize objects
5. edit text inline
6. change styles in inspector
7. reorder in layers
8. use contextual toolbar
9. export result

### Отдельное требование
Demo не должна быть основана на “каких-то случайных слабых sample screens”.
Она должна демонстрировать:
- силу палитры;
- силу компонентов;
- силу прямого конструирования.

---

## 22. План реализации

### Этап 0. UX audit
- inventory current UI
- pain points
- severity
- redesign goals

### Этап 1. New IA
- editor shell redesign
- panel structure
- action hierarchy

### Этап 2. Palette redesign
- cards
- icons
- previews
- categories
- recent/favorites

### Этап 3. Board polish
- visual cleanup
- empty state
- minimap
- better selection/hover/drag feedback

### Этап 4. Inspector redesign
- grouped sections
- better controls
- progressive disclosure

### Этап 5. Contextual interactions
- quick insert
- object mini-toolbar
- inline editing polish

### Этап 6. Layers redesign
- icons
- hierarchy
- hover actions

### Этап 7. Integration and QA
- verify old core still works
- run UX demo scenarios
- prepare final before/after review

---

## 23. Главный продуктовый вывод

MVP4 должен изменить саму природу восприятия продукта.

После этой версии пользователь должен ощущать редактор как:

> визуальный конструктор мобильных экранов,
> где видно, что можно вставить,
> видно, чем управлять,
> видно, как всё устроено,
> и почти всё делается мышью.

А не как:

> технический редактор с кучей панелей и текстовых настроек.

---

## 24. Финальное правило для Codex

Если между:
- «добавить ещё фичу»
и
- «сделать интерфейс понятнее и визуально сильнее»

нужно выбрать одно — в рамках MVP4 всегда выбирать второе.

