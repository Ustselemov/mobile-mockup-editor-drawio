# Техническое задание для Codex AI
## Проект: Universal Mobile Mockup Editor + DSL + Draw.io export/import
### Статус: рабочее ТЗ v3.0 (универсальная версия)
### Назначение: создать универсальный браузерный редактор wireframe/mockup-экранов мобильных приложений, пригодный для ручной сборки, генерации по DSL и экспорта в Draw.io XML

---

## 0. Суть проекта

Нужно создать **универсальный редактор мобильных макетов** в браузере, который:

- работает на **бесконечной доске** (board / canvas);
- позволяет создавать **экраны мобильных приложений** как отдельные parent-контейнеры;
- позволяет вручную добавлять, двигать, редактировать и группировать UI-элементы;
- поддерживает **auto-layout контейнеры** и **ручной absolute layout**;
- поддерживает **универсальный DSL**, из которого можно генерировать экраны и варианты экранов;
- умеет импортировать поддерживаемый поднабор `.drawio` XML и экспортировать обратно;
- не завязан на одну предметную область;
- покрывает большую часть типовых экранов для популярных классов мобильных приложений.

### Ключевая формула продукта

```text
visual editor + reusable components + layout engine + DSL + variants + draw.io compatibility
```

### Правильное позиционирование
Это **не клон Figma** и **не клон diagrams.net**.

Это:
- controlled-subset editor;
- mobile-wireframe-first editor;
- AI-friendly editor;
- draw.io-compatible export target;
- конструктор + генератор макетов.

---

## 1. План документа

В рамках этого ТЗ должны быть покрыты:

1. Цели продукта  
2. Границы и non-goals  
3. Термины и сущности  
4. Целевая универсальность и покрываемые классы приложений  
5. Общий UX продукта  
6. Состав экранов интерфейса редактора  
7. Основные сценарии использования  
8. Модель данных  
9. Каталог примитивов  
10. Каталог компонент  
11. Layout engine  
12. DSL v1  
13. Variants / batch generation  
14. Draw.io import/export  
15. Визуальные дефолты и design tokens  
16. Архитектура и стек  
17. Структура проекта  
18. Алгоритмы поведения  
19. Проверки, ограничения, валидация  
20. Тестирование  
21. Артефакты и документация  
22. Acceptance criteria  
23. Пошаговый план реализации

---

## 2. Цель продукта

### 2.1. Главная цель
Сделать **универсальный mobile mockup editor**, в котором можно:

- вручную быстро собирать экраны;
- описывать экраны текстом;
- автоматически генерировать экраны из DSL;
- массово порождать варианты экранов;
- экспортировать итог в `.drawio`.

### 2.2. Бизнес-смысл
Продукт должен сдвигать пользователя от режима:

> “я долго рисую экран руками”

к режиму:

> “я собираю экран из компонентов или описываю его текстом, а система строит макет”

### 2.3. Технический смысл
Продукт должен быть:
- управляемым;
- расширяемым;
- предсказуемым;
- удобным для Codex/AI;
- пригодным для развития в сторону шаблонов, ассистентов и генерации.

---

## 3. Что НЕ является целью

В этот проект не входит:

- полноценная замена Figma;
- pixel-perfect high-fidelity visual design tool;
- поддержка всех фигур и режимов diagrams.net;
- поддержка свободного vector editing уровня illustrator;
- полноценная типографическая дизайн-система с auto constraints уровня Figma;
- runtime-интеграция с реальными backend/API;
- production code generation “из коробки” для целого мобильного приложения;
- поддержка любых произвольных UI без ограничений.

### Правильная формулировка scope
Нужно покрыть **70–80% типовых mobile wireframe / mockup задач**, а не 100% бесконечного пространства UI.

---

## 4. Термины и сущности

### 4.1. Board
Бесконечная доска, на которой располагаются все объекты верхнего уровня:
- screens
- groups
- flows
- comments
- arrows
- templates preview blocks

### 4.2. Screen
Контейнер экрана мобильного приложения.
Это главный parent для UI-элементов, которые должны жить внутри экрана.

### 4.3. Container
Любой вложенный блок, который может содержать children.
Поддерживает layout:
- absolute
- vstack
- hstack
- grid

### 4.4. Primitive
Низкоуровневый базовый элемент:
- rect
- text
- line
- image placeholder
- icon placeholder
- divider
- arrow

### 4.5. Component
Собранный reusable UI-блок:
- header
- input
- button
- list item
- product card
- chat bubble
- payment selector
- tab bar
- modal
- bottom sheet

### 4.6. Template
Готовая структура экрана или секции для типовой задачи.

### 4.7. DSL
Текстовый язык описания экранов, компонентов, layout и вариантов.

### 4.8. Variant
Комбинаторный набор вариантов свойств, состояний или сценариев, на основе которого генерируются разные версии экранов.

### 4.9. Draw.io controlled subset
Поддерживаемый поднабор mxGraph / draw.io XML, с которым редактор гарантированно работает корректно.

---

## 5. Целевая универсальность: какие классы приложений покрывать

Редактор должен быть универсальным для как минимум следующих 10 классов мобильных приложений:

| № | Класс приложения | Обязательные типовые экраны/паттерны |
|---|---|---|
| 1 | E-commerce / Marketplace | каталог, карточка товара, корзина, checkout, профиль/заказы |
| 2 | Banking / Fintech | home dashboard, cards, transfer, payment, history |
| 3 | Food Delivery / Grocery | каталог, корзина, адрес, слот, трекинг |
| 4 | Healthcare / Clinic | запись, список услуг, checkout, результаты, профиль |
| 5 | Social / Messenger | feed, chat list, chat, profile, comments |
| 6 | Media / Streaming | home, search, detail page, player, library |
| 7 | Travel / Booking | search, results, item detail, booking, itinerary |
| 8 | Productivity / Task Manager | dashboard, list, task detail, calendar, settings |
| 9 | Education / Learning | catalog, course page, lesson, quiz, progress |
| 10 | On-demand Services / Booking | services list, provider card, scheduling, booking, status |

### 5.1. Вывод по универсальности
Это означает, что система должна опираться не на одну доменную схему, а на:

- **универсальные примитивы**;
- **типовые mobile-компоненты**;
- **layout engine**;
- **template packs** для разных доменов.

---

## 6. Продуктовая концепция

### 6.1. Три режима создания макета
Редактор должен поддерживать три способа работы:

#### A. Manual mode
Пользователь вручную:
- создаёт screen;
- перетаскивает компоненты;
- редактирует свойства;
- собирает экран мышью.

#### B. Assisted assembly mode
Пользователь:
- берёт шаблоны;
- вставляет секции;
- быстро меняет контент и параметры.

#### C. DSL generation mode
Пользователь:
- пишет текстовое описание;
- запускает parser/generator;
- получает один или множество экранов автоматически.

### 6.2. Четвёртый режим на будущее
Нужно оставить архитектурную возможность добавить:
- AI assistant / prompt-to-DSL / prompt-to-screen.

Но реальная LLM-интеграция не обязательна в этом MVP, если это не мешает срокам.

---

## 7. Общий UX продукта

## 7.1. Основная компоновка приложения

Редактор в браузере должен состоять из:

- **Top toolbar**
- **Left sidebar** — palette / templates / screens
- **Center canvas** — infinite board
- **Right sidebar** — inspector / properties
- **Bottom status bar** — zoom, coordinates, warnings, dirty state
- **Optional lower panel / tab** — DSL editor / JSON / logs / import report

### 7.2. Top toolbar
Должна содержать:
- New project
- Open JSON
- Save JSON
- Import `.drawio`
- Export `.drawio`
- Export selected screen
- Undo
- Redo
- Zoom controls
- Grid toggle
- Snap toggle
- Generate from DSL
- Validate
- Fit to screen
- Fit selection
- Preview variants
- Theme tokens selector

### 7.3. Left sidebar tabs
Минимум следующие вкладки:

1. **Palette**
2. **Templates**
3. **Components**
4. **Layers / Structure**
5. **Screens**
6. **Variants**
7. **Assets placeholders** (минимум icon/image placeholders)

### 7.4. Right sidebar tabs
Минимум следующие вкладки:

1. **Properties**
2. **Layout**
3. **Style**
4. **Text**
5. **Bindings / Variants**
6. **Diagnostics**

### 7.5. Center board
На доске должны поддерживаться:

- pan мышью;
- zoom колесом;
- marquee selection;
- multi-select;
- drag-and-drop из palette;
- drag to reparent;
- creation of arrows/connectors;
- movement of whole screens;
- navigation between multiple screens.

---

## 8. Основные сценарии использования

### 8.1. Сценарий 1 — ручная сборка
1. Пользователь открывает пустой проект.
2. Добавляет экран preset `iphone15`.
3. Перетаскивает:
   - header,
   - input,
   - button,
   - list.
4. Меняет текст, цвета, размер, радиусы.
5. Экспортирует в `.drawio`.

### 8.2. Сценарий 2 — шаблонный экран
1. Пользователь выбирает template pack `E-commerce`.
2. Вставляет `Product Page`.
3. Правит данные и компоненты.
4. Сохраняет шаблон как свой.

### 8.3. Сценарий 3 — DSL
1. Пользователь открывает DSL panel.
2. Пишет описание экрана.
3. Нажимает `Generate`.
4. Получает screen на board.
5. Редактирует руками.
6. Повторно экспортирует DSL / JSON / draw.io.

### 8.4. Сценарий 4 — варианты
1. Пользователь определяет variants:
   - payment method
   - delivery type
   - auth state
2. Нажимает generate variants.
3. Получает множество экранов, расположенных на board в сетке.

### 8.5. Сценарий 5 — import existing draw.io
1. Пользователь импортирует `.drawio`.
2. Система строит internal JSON model.
3. Показывает import report:
   - imported
   - approximated
   - unsupported
4. Пользователь правит.
5. Экспортирует обратно.

---

## 9. Что должен уметь редактор

## 9.1. Board / navigation
Обязательно:
- infinite canvas;
- pan;
- zoom;
- minimap опционально, но желательно;
- snap to grid;
- screen grouping;
- board guides;
- align tools;
- viewport restore.

## 9.2. Screens
Screen должен уметь:
- задавать name;
- задавать preset;
- задавать width/height;
- orientation portrait/landscape;
- задавать background/stroke/radius;
- содержать children;
- удерживать children внутри;
- перемещаться по board как единое целое.

### 9.2.1. Screen presets
Минимальный набор:
- iPhone SE: 375x667
- iPhone 13/14/15: 390x844 или 393x852
- Android compact: 360x800
- Pixel-ish: 412x915
- Custom phone portrait
- Custom phone landscape

## 9.3. Containers and layout
Каждый container должен поддерживать:

- layoutMode:
  - absolute
  - vstack
  - hstack
  - grid
- padding
- gap
- alignItems
- justifyContent
- wrap (optional)
- autoHeight / fixedHeight
- clipChildren
- background
- border
- radius

## 9.4. Selection and editing
Обязательные действия:
- select
- multi-select
- group
- ungroup
- duplicate
- copy/paste
- delete
- lock/unlock
- hide/show
- bring forward/backward
- distribute
- align edges
- resize via handles
- nudge via keyboard
- rename in layers tree

## 9.5. Reparenting
При drag элемента:
- определять candidate parent;
- визуально подсвечивать;
- drop внутрь;
- обновлять local coordinates;
- запрещать invalid parent;
- при необходимости clamp в bounds нового parent.

---

## 10. Каталог примитивов v1

Ниже приведён минимальный обязательный уровень для универсальности.

### 10.1. Screen
Назначение: корневой контейнер мобильного экрана.

Свойства:
- id
- name
- preset
- width
- height
- x
- y
- fillColor
- strokeColor
- strokeWidth
- borderRadius
- padding
- children
- lockedBounds
- metadata

### 10.2. Group
Группа без собственных визуальных дефолтов.

Свойства:
- id
- name
- x
- y
- width
- height
- children
- layoutMode
- clipChildren

### 10.3. Rect / Surface
Базовый прямоугольник / контейнер.

Свойства:
- x, y, width, height
- fillColor
- strokeColor
- strokeWidth
- borderRadius
- shadow (optional)
- opacity

### 10.4. Text
Свойства:
- text
- richText / html
- fontFamily
- fontSize
- fontWeight
- lineHeight
- color
- align
- verticalAlign
- wrap
- maxLines (optional)
- overflow (clip/ellipsis/visible)

### 10.5. Divider
Свойства:
- direction
- color
- thickness
- insetStart
- insetEnd

### 10.6. ImagePlaceholder
Свойства:
- width
- height
- radius
- label
- fit
- aspectRatio
- fillColor
- strokeColor

### 10.7. IconPlaceholder
Свойства:
- size
- label
- strokeColor
- fillColor

### 10.8. Arrow / Connector
Свойства:
- sourceId or sourcePoint
- targetId or targetPoint
- routing: straight | orthogonal
- startArrow
- endArrow
- strokeColor
- strokeWidth
- label (optional)

### 10.9. Badge / Chip
Свойства:
- text
- fillColor
- strokeColor
- textColor
- size
- radius
- iconLeading?
- iconTrailing?

### 10.10. Spacer
Свойства:
- width
- height

---

## 11. Каталог универсальных компонентов v1

### 11.1. Navigation components
1. Header / TopBar  
2. BackHeader  
3. SearchBar  
4. SegmentedControl  
5. Tabs  
6. BottomTabBar  
7. PaginationDots  
8. FilterBar  
9. Breadcrumb-like mobile title row  

### 11.2. Form components
1. Input  
2. TextArea  
3. Select / Dropdown  
4. DateInput  
5. TimeInput  
6. OTPInput  
7. Checkbox  
8. Radio  
9. Switch  
10. Slider  
11. Stepper  
12. Helper/Error text  

### 11.3. Content components
1. Card  
2. InfoRow  
3. PriceRow  
4. StatRow  
5. List  
6. ListItem  
7. MediaCard  
8. ProductCard  
9. ChatBubble  
10. CommentBlock  
11. ProfileRow  
12. AvatarBlock  
13. ProgressBlock  
14. EmptyState  
15. SkeletonBlock  

### 11.4. Commerce / booking components
1. CartItem  
2. QuantityStepper  
3. OrderSummary  
4. PaymentMethodSelector  
5. AddressCard  
6. DeliverySlotPicker  
7. BookingSlot  
8. TicketCard  
9. FareRow / RateRow  

### 11.5. Social / media components
1. FeedPostCard  
2. StoryTray placeholder  
3. ChatListItem  
4. MessageComposer  
5. PlayerCard  
6. PlaylistRow  
7. ReactionRow  

### 11.6. System components
1. Button  
2. CTAButton  
3. IconButton  
4. Banner  
5. Toast  
6. Snackbar  
7. Modal  
8. BottomSheet  
9. Dialog  
10. Tooltip  
11. LoadingOverlay  

### 11.7. Container/layout components
1. Section  
2. Stack  
3. Grid  
4. Row  
5. Column  
6. SheetContainer  

---

## 12. Свойства элементов: общая модель

Для всех node-элементов должна существовать общая базовая схема:

```ts
type BaseNode = {
  id: string;
  type: string;
  name?: string;
  parentId: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  locked: boolean;
  rotation?: number;
  opacity?: number;
  zIndex: number;
  metadata?: Record<string, unknown>;
};
```

### 12.1. Общие стиль-свойства
- fillColor
- strokeColor
- strokeWidth
- borderRadius
- borderStyle
- padding
- gap
- shadow
- overflow
- clipChildren

### 12.2. Общие текстовые свойства
- text
- richText
- fontFamily
- fontSize
- fontWeight
- lineHeight
- textColor
- textAlign
- verticalAlign
- wrap
- whiteSpaceMode

### 12.3. Общие layout-свойства
- layoutMode
- direction
- alignItems
- justifyContent
- spacing
- gridColumns
- gridRows
- minWidth
- minHeight
- maxWidth
- maxHeight
- autoWidth
- autoHeight

### 12.4. Variant/binding свойства
- bindingKey
- bindingValue
- visibleIf
- enabledIf
- variantSource
- slotName

---

## 13. Layout engine — обязательная часть универсальности

### 13.1. Почему нужен layout engine
Если опираться только на абсолютные координаты, продукт останется узким.
Для универсальности нужны:
- stack layout;
- row layout;
- grid layout;
- alignment;
- spacing;
- responsive-like reflow внутри экрана.

### 13.2. Поддерживаемые режимы layout
#### Absolute
Все children имеют явные `x/y`.

#### VStack
Children укладываются сверху вниз:
- учитывается gap;
- padding контейнера;
- optional autoHeight.

#### HStack
Children укладываются слева направо:
- gap;
- vertical alignment;
- optional wrap.

#### Grid
Children раскладываются по колонкам/ячейкам.

### 13.3. Layout rules
- Layout engine пересчитывает child bounds при изменении container props.
- Child local coordinates внутри auto-layout контейнера нельзя свободно задавать мышью без переключения в absolute.
- Container может быть переключён между absolute и stack/grid с сохранением children.

### 13.4. Required behavior
- nested layouts;
- reflow on resize;
- reflow on add/remove child;
- clamp when child bigger than parent;
- warnings on invalid config.

---

## 14. DSL v1 — требования

## 14.1. Зачем DSL нужен
DSL нужен, чтобы:
- описывать экран не мышью, а текстом;
- быстро порождать варианты;
- хранить screen definitions как читаемый code-like artifact;
- использовать его как промежуточный формат для AI и шаблонов.

## 14.2. Требования к DSL
DSL должен быть:
- человекочитаемым;
- простым;
- строгим;
- расширяемым;
- однозначно парсимым;
- пригодным для round-trip в internal JSON.

## 14.3. Формат DSL
Рекомендуемый формат: **indentation-based declarative DSL**.

Правила:
- комментарии начинаются с `#`
- уровень вложенности задаётся пробелами
- строка описывает node или directive
- свойства задаются через `key:value`
- строки в кавычках
- массивы в `[]`
- ссылки на variants через `$varName`

### 14.4. Базовые директивы
Обязательные директивы:
- `project`
- `tokens`
- `screen`
- `section`
- `component`
- `variant`
- `generate`
- `connect`
- `group`

### 14.5. Синтаксис узла
Общий шаблон:

```txt
<type> <optionalName> key:value key:value
```

Пример:

```txt
button primary text:"Pay now" width:240 height:44
```

### 14.6. Базовый пример DSL

```txt
project "Checkout Demo"
tokens default-wireframe

screen Checkout preset:iphone15 x:100 y:80
  header title:"Checkout"
  section Delivery layout:vstack gap:8
    input label:"Region" value:"Current region"
    input label:"Address" value:"Example street"
  section Products layout:vstack gap:8
    productRow title:"Vitamin D" subtitle:"2 days" price:"2390 ₽" badge:"+42"
    productRow title:"Ferritin" subtitle:"2 days" price:"2140 ₽" badge:"+58"
  paymentSelector items:["SBP","Card","Cash"] selected:"Card"
  summaryCard total:"5420 ₽" bonus:"+118"
  button primary text:"Proceed to payment"
```

### 14.7. Variant syntax
Пример:

```txt
variant paymentMethod = ["SBP", "Card", "Cash"]
variant deliveryMode = ["Pickup", "Courier"]
variant authState = ["Guest", "Authorized"]
```

### 14.8. Conditional visibility
Пример:

```txt
input label:"Address" visibleIf:'$deliveryMode == "Courier"'
```

### 14.9. Generate directive
Пример:

```txt
generate screen:Checkout by:[paymentMethod, deliveryMode, authState]
```

Это создаёт cross-product вариантов.

### 14.10. Guardrails для batch generation
Система обязана:
- считать итоговое число комбинаций заранее;
- показывать estimate;
- предупреждать, если комбинаций слишком много;
- иметь ограничитель по умолчанию, например 200 экранов за одно действие;
- уметь сгенерировать preview subset.

### 14.11. DSL editor UI
Нужен отдельный panel/tab:
- textarea/code editor;
- syntax highlighting (минимум базовое);
- parse errors with line numbers;
- validate button;
- generate button;
- sync with selected screen (минимум partial).

### 14.12. DSL → JSON → Draw.io pipeline
Обязательная архитектура:

```text
DSL
-> parser
-> AST
-> normalized JSON scene model
-> editor renderer
-> draw.io serializer
```

---

## 15. Что значит “100 экранов / 100 вариантов”

Система должна поддерживать автоматическую генерацию множества экранов из комбинаций variants.

### 15.1. Пример
Если есть:
- 5 способов оплаты
- 4 типа доставки
- 5 auth состояний

Тогда:
- всего `5 x 4 x 5 = 100` комбинаций
- система может автоматически создать 100 screen instances

### 15.2. Требование к UX
Перед генерацией система обязана показать:
- сколько комбинаций получится;
- сколько board space потребуется;
- как будут разложены экраны;
- возможность выбрать:
  - generate all
  - generate sample 10
  - generate first N
  - generate by selected values only

### 15.3. Раскладка generated screens
Минимум:
- grid arrangement on board;
- configurable spacing;
- screen label with variant summary;
- group wrapper around batch.

---

## 16. Визуальные дефолты и design tokens

Как базовый wireframe style нужно использовать наблюдённые токены из предоставленного `.drawio` файла.

### 16.1. Базовые токены
- fontFamily: `Helvetica, Arial, sans-serif`
- lineHeight: `1.2`
- gridSize: `10`

### 16.2. Цветовые токены
- `screenStroke = #1c2a30`
- `neutralBorder = #d7e1e3`
- `surface = #ffffff`
- `surfaceMuted = #f7fafb`
- `headerTint = #eef5f4`
- `interactiveFill = #dcefeb`
- `interactiveStroke = #0f766e`
- `successFill = #d5e8d4`
- `successStroke = #82b366`
- `badgeFill = #dae8fc`
- `badgeStroke = #6c8ebf`
- `warningFill = #ffe6cc`
- `warningStroke = #d79b00`
- `noteFill = #fffaf0`
- `noteStroke = #c49102`

### 16.3. Typography tokens
- `displayTitle = 14px / 700 / center / #1f2b2d`
- `sectionTitle = 10px / 700 / left / #66757a`
- `fieldLabel = 9px / 700 / left / #66757a`
- `body = 11px / 400 / left / #1f2b2d`
- `bodyStrong = 11px / 700 / left / #1f2b2d`
- `cta = 11px / 700 / center / #1f2b2d`
- `successText = 9–11px / #0f766e`
- `warningText = 11px / #6f4b18`

### 16.4. Radius tokens
- `r-xs = arcSize 6`
- `r-sm = arcSize 8`
- `r-md = arcSize 9`
- `r-lg = arcSize 10`
- `r-xl = arcSize 12`
- `r-2xl = arcSize 14`
- `r-3xl = arcSize 16`

### 16.5. Использование токенов
Редактор обязан поддерживать:
- theme defaults;
- token picker;
- raw override;
- reset to token defaults.

---

## 17. Draw.io import/export — требования

## 17.1. Общая стратегия
Raw draw.io XML **не должен быть primary in-memory model**.

Правильная схема:

```text
draw.io XML <-> parser/serializer <-> normalized JSON model <-> editor UI
```

## 17.2. Import
При import `.drawio`:
- XML должен парситься безопасно;
- строится internal JSON model;
- неизвестные элементы не теряются бесшумно;
- создаётся report:
  - imported exactly
  - approximated
  - unsupported
  - ignored intentionally

## 17.3. Export
При export `.drawio`:
- сохраняются geometry, hierarchy, styles, text value;
- для supported subset нужен стабильный deterministic serializer;
- ids должны быть стабильными, где возможно;
- export должен быть пригоден для открытия в diagrams.net.

## 17.4. Supported draw.io subset
Обязательная поддержка:
- `mxfile`
- `diagram`
- `mxGraphModel`
- `mxCell`
- `mxGeometry`
- `vertex="1"`
- `edge="1"`
- text nodes (`style=text;...`)
- rounded containers
- swimlane (для board sections/flows)
- shape=cloud
- orthogonal edges
- fillColor/strokeColor/strokeWidth/arcSize
- value with HTML
- parent-child structure

## 17.5. Fidelity requirements
Для supported subset должны сохраняться:
- text content
- approximate text styling
- x/y/width/height
- parent structure
- fill/stroke/radius
- connector routing basic form

---

## 18. Модель данных

## 18.1. Корневая схема
```ts
type ProjectModel = {
  id: string;
  name: string;
  version: string;
  designTokens: DesignTokens;
  boards: BoardModel[];
  screens: ScreenNode[];
  nodes: Record<string, AnyNode>;
  connectors: Record<string, ConnectorNode>;
  variants: VariantDefinition[];
  templates: TemplateDefinition[];
  dslDocuments: DSLDocument[];
  metadata: ProjectMetadata;
};
```

### 18.2. Почему нужен flat store + references
Нужно использовать:
- `nodes` как flat map;
- `childrenIds` внутри container nodes;
- это упростит selection, diff, undo/redo, serialization.

### 18.3. Обязательные node-типы
- ScreenNode
- ContainerNode
- TextNode
- InputNode
- ButtonNode
- CheckboxNode
- RadioNode
- SwitchNode
- ListNode
- ListItemNode
- CardNode
- ImageNode
- IconNode
- HeaderNode
- BottomTabBarNode
- ModalNode
- BottomSheetNode
- BadgeNode
- ProductRowNode
- ChatBubbleNode
- ConnectorNode
- CommentCloudNode

### 18.4. Metadata
Нужно поддержать:
- arbitrary metadata map;
- source origin (manual / imported / generated / templated);
- template id;
- variant labels;
- warnings.

---

## 19. Режимы работы с экранами

### 19.1. Manual screen
Обычный вручную собранный screen.

### 19.2. Template-based screen
Screen, созданный из шаблона, но редактируемый после вставки.

### 19.3. Generated screen
Screen, созданный из DSL/variants.
Нужно хранить:
- source DSL block
- variant combination
- generation timestamp
- dirtyAfterManualEdit flag

---

## 20. Template system

## 20.1. Template packs
Должны существовать packs:
- Core
- E-commerce
- Fintech
- Delivery
- Healthcare
- Social
- Media
- Travel
- Productivity
- Education
- Services

## 20.2. Минимальный объём шаблонов
Для MVP:
- минимум 2 полноценных шаблонных экрана на каждый из 10 классов приложений;
- минимум 5 reusable template sections на домен;
- плюс core library.

### Пример
Для E-commerce:
- catalog
- product page
- cart
- checkout section
- address section
- payment section
- order status block

---

## 21. Алгоритмы поведения

## 21.1. Parent assignment algorithm
При drop:
1. Найти deepest valid container under pointer.
2. Проверить allowed child types.
3. Если valid:
   - set parentId
   - convert global coords to local coords
4. Иначе:
   - attach to nearest screen or board
5. Clamp if needed.

## 21.2. Screen containment algorithm
Для nodes внутри screen:
- запрещать полное выпадение за пределы screen bounds;
- при drag ограничивать x/y;
- при resize child clamp to screen unless explicit overflow allowed.

## 21.3. Auto-layout reflow
При модификации container:
- пересчитать child positions;
- сохранить explicit order;
- применить gap/padding/alignment.

## 21.4. Variant expansion algorithm
1. Собрать выбранные variant dimensions.
2. Посчитать cartesian product.
3. Построить screen clones.
4. Применить bindings/visibleIf.
5. Разложить результат на board grid.
6. Назначить labels.

## 21.5. Import mapping algorithm
1. Parse XML.
2. Build mxCell map.
3. Determine node kinds by style and geometry.
4. Create JSON nodes.
5. Restore parent hierarchy.
6. Collect warnings for unsupported features.

## 21.6. Export mapping algorithm
1. Normalize JSON nodes.
2. Convert nodes to mxCell.
3. Serialize value/html/styles.
4. Emit root cells.
5. Generate deterministic order.
6. Validate output.

---

## 22. Проверки и валидация

### 22.1. Validation layers
Нужно 3 слоя проверки:

#### A. Model validation
- no orphan nodes
- valid parent references
- no cycles
- dimensions > 0

#### B. Layout validation
- child fits parent
- grid config valid
- no impossible constraints

#### C. Export validation
- supported node types only
- required geometry fields present
- no invalid XML characters
- no invalid connector references

### 22.2. User-facing diagnostics
UI должен показывать:
- warning badges;
- import warnings;
- DSL parse errors;
- export blockers;
- variant overflow warnings.

---

## 23. Performance and limits

### 23.1. Целевые ограничения для MVP
Должно комфортно работать минимум с:
- 1 board
- 100 screens
- 3000–5000 nodes total
- 200 generated variants in one batch

### 23.2. Что нужно для этого
- normalized store;
- memoized selectors;
- virtualization where needed (layers list);
- efficient canvas rendering strategy.

---

## 24. Архитектура и стек

## 24.1. Рекомендуемый стек
- React
- TypeScript
- Vite
- Zustand
- Zod
- dnd-kit
- SVG renderer **или** Konva renderer
- fast-xml-parser / xmlbuilder2
- Vitest
- Playwright

### 24.2. Выбор renderer
Codex обязан:
- сравнить SVG vs Konva;
- выбрать один;
- кратко зафиксировать why;
- использовать этот выбор в архитектуре.

**Предпочтение по умолчанию:** SVG-first, если это упрощает DOM inspection, handles, text rendering и export-friendly structure.

### 24.3. Необходимые модули
- editor-core
- selection
- transforms
- layout-engine
- component-renderers
- model-store
- drawio-parser
- drawio-serializer
- dsl-parser
- variant-generator
- templates
- diagnostics

---

## 25. Структура проекта

Рекомендуемая структура:

```text
src/
  app/
  pages/
  ui/
  features/
    board/
    editor/
    selection/
    palette/
    templates/
    screens/
    inspector/
    layers/
    dsl/
    variants/
    importDrawio/
    exportDrawio/
    validation/
    history/
  lib/
    model/
    geometry/
    layout/
    drawio/
    dsl/
    templates/
    designTokens/
    utils/
  tests/
  demo/
docs/
  analysis/
  architecture/
  dsl/
  components/
  qa/
```

Codex может улучшить структуру, но обязан сохранить:
- понятное разделение по модулям;
- независимость draw.io слоя;
- независимость DSL слоя;
- независимость model/layout.

---

## 26. Документация, которую Codex обязан создать

Обязательные документы:

- `docs/analysis/current-state-audit.md`
- `docs/architecture/mvp3-architecture.md`
- `docs/components/universal-component-catalog.md`
- `docs/dsl/dsl-v1-spec.md`
- `docs/dsl/dsl-examples-top10-app-types.md`
- `docs/drawio/drawio-mapping-spec.md`
- `docs/qa/acceptance-checklist.md`
- `docs/qa/manual-test-cases.md`
- `docs/qa/known-limitations.md`

---

## 27. Тестирование

## 27.1. Unit tests
Обязательно:
- geometry utils
- parent assignment
- clamp
- layout reflow
- DSL parser
- variant expansion
- draw.io parser
- draw.io serializer
- validation rules

## 27.2. Integration tests
Обязательно:
- manual add/edit/delete flow
- import `.drawio`
- export `.drawio`
- generated screen from DSL
- batch generation with variants

## 27.3. E2E tests
Минимум:
- create screen
- add components
- edit properties
- generate from DSL
- export and re-open

## 27.4. Round-trip tests
Для поддерживаемого subset:
- import -> export -> import must preserve structure within acceptable tolerance.

---

## 28. Acceptance criteria

Продукт считается принятым, если одновременно выполнено:

### 28.1. Editor core
- board работает;
- pan/zoom работают;
- screen creation работает;
- components добавляются и редактируются;
- parent-child сохраняется корректно.

### 28.2. Layout
- absolute/vstack/hstack/grid работают;
- reflow работает;
- nested containers работают.

### 28.3. DSL
- можно написать DSL и получить screen;
- parse errors показываются корректно;
- DSL examples для top-10 типов приложений существуют.

### 28.4. Variants
- можно задать variants;
- можно получить batch-generated screens;
- есть guardrails against explosion.

### 28.5. Draw.io compatibility
- import supported subset работает;
- export supported subset работает;
- diagrams.net открывает экспортированный файл.

### 28.6. Templates
- есть template packs для top-10 app types;
- можно вставлять шаблоны и редактировать их.

### 28.7. Quality
- tests green;
- docs созданы;
- known limitations зафиксированы честно.

---

## 29. Пошаговый план реализации

### Этап 1. Audit current repo
- прочитать существующий код;
- сравнить с предыдущими ТЗ;
- зафиксировать состояние.

### Этап 2. Harden core
- selection
- transforms
- hierarchy
- screen containment
- history
- validation

### Этап 3. Universal component model
- формализовать primitives/components;
- типы;
- renderers.

### Этап 4. Layout engine
- vstack/hstack/grid;
- nested containers;
- property panel support.

### Этап 5. DSL v1
- grammar;
- parser;
- AST;
- mapper to JSON;
- editor panel.

### Этап 6. Variant system
- definitions;
- expansion;
- generated screen grouping.

### Этап 7. Template packs
- top-10 domain packs;
- sample screens;
- docs.

### Этап 8. Draw.io hardening
- import/export stabilization;
- reports;
- tests.

### Этап 9. QA & docs
- unit/integration/e2e;
- manual test checklist;
- known limitations.

---

## 30. Решения по умолчанию, если ТЗ чего-то не уточняет

Если явного указания нет, Codex должен выбирать практичный вариант по следующим правилам:

1. Не клонировать весь draw.io.
2. Предпочитать простую расширяемую архитектуру.
3. Предпочитать типизированную JSON-модель.
4. Не использовать raw XML как primary state.
5. Не усложнять DSL сверх необходимости.
6. Делать работающий MVP, а не теоретический каркас.
7. Любое ограничение фиксировать в docs честно.

---

## 31. Минимальный набор DSL-примеров, который обязан существовать

Нужно подготовить примеры DSL минимум для следующих экранов:

1. `ecommerce-product-page.dsl`
2. `ecommerce-checkout.dsl`
3. `fintech-home.dsl`
4. `fintech-transfer.dsl`
5. `delivery-cart.dsl`
6. `healthcare-results.dsl`
7. `social-chat.dsl`
8. `media-player.dsl`
9. `travel-booking.dsl`
10. `productivity-task-detail.dsl`
11. `education-lesson.dsl`
12. `services-booking.dsl`

---

## 32. Пример ожидаемого уровня универсальности

Редактор должен позволить описать как минимум такие экраны:

### Пример A — E-commerce
```txt
screen ProductPage preset:iphone15
  header title:"Product"
  image hero width:358 height:220
  section Info layout:vstack gap:8
    text style:displayTitle value:"Sony XM5"
    priceRow left:"Price" right:"12 990 ₽"
    badge text:"4.8"
  section Actions layout:hstack gap:8
    button secondary text:"Add to cart"
    button primary text:"Buy now"
```

### Пример B — Banking
```txt
screen Wallet preset:iphone15
  header title:"Wallet"
  balanceCard title:"Balance" amount:"124 500 ₽"
  section Actions layout:hstack gap:8
    button secondary text:"Top up"
    button primary text:"Transfer"
  list Transactions
    listItem title:"Coffee" subtitle:"Today" trailing:"-390 ₽"
    listItem title:"Salary" subtitle:"Yesterday" trailing:"+120 000 ₽"
```

### Пример C — Chat
```txt
screen Chat preset:iphone15
  header title:"Alex"
  list Messages layout:vstack gap:8
    chatBubble side:left text:"Hi"
    chatBubble side:right text:"Hello"
  composer placeholder:"Message"
```

---

## 33. Итоговая целевая формулировка

Нужно получить не “ещё одну рисовалку”, а:

> **универсальный mobile wireframe editor с компонентами, layout engine, DSL, variants и draw.io-compatible import/export**

Это должно быть:
- удобно руками;
- удобно системой;
- удобно AI;
- пригодно для дальнейшего превращения в продукт.

