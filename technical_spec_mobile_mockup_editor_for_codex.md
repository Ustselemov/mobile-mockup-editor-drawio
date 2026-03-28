# Техническое задание для Codex AI  
## Проект: браузерный редактор мобильных макетов с импортом/экспортом Draw.io (`.drawio` / mxGraph XML)

**Статус документа:** рабочее ТЗ v1.0  
**Назначение:** передать Codex AI полный и практически исполнимый набор требований на проектирование и реализацию редактора.  
**Основа документа:** анализ предоставленного файла `one-click-flow-sketch.drawio` + требования пользователя.

---

## 0. План документа

В ТЗ должны быть покрыты следующие блоки:

1. Цель продукта и границы задачи  
2. Разбор входного формата Draw.io, который реально используется в имеющемся файле  
3. Каталог поддерживаемых элементов  
4. Каталог дополнительных типовых mobile-элементов, которых в примере нет, но которые нужно добавить  
5. Визуальный стандарт: цвета, шрифты, скругления, размеры, сетка  
6. UX редактора: доска, панорама, zoom, screen-as-parent, drag/resize/edit  
7. Модель данных и иерархия: board → lane → screen → element  
8. Импорт/экспорт Draw.io XML  
9. Архитектура проекта, стек, структура файлов  
10. Правила поведения элементов и алгоритмы  
11. Тестирование, QA, acceptance criteria  
12. Пошаговый план реализации для Codex AI

---

## 1. Цель продукта

Нужно создать **собственный браузерный редактор**, заточенный не под весь Draw.io, а под **узкий controlled subset** для проектирования экранов мобильного приложения и связанных flow-схем.

Ключевая идея:

- пользователь работает на **бесконечной доске**;
- на доске можно создавать **lane/сценарные области** и **экраны мобильного приложения**;
- каждый экран является **родителем** для всех вложенных элементов;
- дочерние элементы **нельзя свободно утащить за пределы экрана**, если не выполняется явный reparent;
- редактор хранит **внутреннюю JSON-модель**, удобную для AI/CodeX;
- редактор умеет импортировать из `.drawio` и экспортировать обратно в `.drawio`;
- редактор обязан быть пригоден для дальнейшей AI-генерации макетов.

Итоговый продукт — это не клон diagrams.net, а **специализированный mobile mockup editor с draw.io-совместимым экспортом**.

---

## 2. Почему нельзя делать клон всего Draw.io

### 2.1. Что реально есть в текущем файле
В предоставленном файле используется довольно узкий поднабор формата:

| Семейство | Кол-во | Роль | Базовый паттерн |
|---|---:|---|---|
| `swimlane` | 6 | верхнеуровневые сценарные дорожки | `swimlane; horizontal=0; startSize=34` |
| Screen frame | 9 | основные экраны/панели | `rounded=1; fillColor=#ffffff; strokeColor=#1c2a30; arcSize=14; container=1` |
| Section/card container | 41 containers total | карточки, секции, поля, summary blocks | `container=1; dropTarget=1; connectable=0` |
| Text node | 133 | весь текст рендерится HTML в `value` | `style='text;...'`, HTML в `value` |
| Edge/connector | 12 | ортогональные стрелки | `edgeStyle=orthogonalEdgeStyle; strokeWidth=5` |
| Cloud note | 1 | облако-комментарий с вложенными карточками | `shape=cloud; fillColor=#fffaf0` |

Фактически пользовательский сценарий состоит из:
- сценарных lane/дорожек;
- screen-фреймов;
- секций и карточек;
- текстов;
- чекбоксов;
- segmented controls;
- кнопок;
- информационных строк/бейджей;
- стрелок;
- одного note-cloud.

### 2.2. Вывод
Следовательно, проектировать нужно **не универсальный редактор диаграмм**, а **систему примитивов и компонентов**, которая:
- проста;
- контролируема;
- предсказуемо экспортируется;
- пригодна для AI-генерации.

---

## 3. Анализ предоставленного `.drawio` файла

### 3.1. Формальная структура файла
Базовая структура формата:

```xml
<mxfile>
  <diagram>
    <mxGraphModel>
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        ...
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

Обязательные фундаментальные элементы:
- `mxfile` — контейнер документа;
- `diagram` — страница/лист;
- `mxGraphModel` — модель холста;
- `root` — список ячеек;
- `mxCell id="0"` — корневой служебный узел;
- `mxCell id="1" parent="0"` — дефолтный слой.

### 3.2. Факт по анализу файла
В текущем файле обнаружено:
- `275` `mxCell`
- `261` visual vertex
- `133` текстовых узла
- `12` edge/connector
- `6` swimlane
- `1` cloud note
- `9` screen-like frame с чёрной внешней рамкой

### 3.3. Ключевые style-ключи, реально используемые в файле
`align`, `arcSize`, `collapsible`, `connectable`, `container`, `dropTarget`, `edgeStyle`, `endArrow`, `endFill`, `entryDx`, `entryDy`, `entryX`, `entryY`, `exitDx`, `exitDy`, `exitX`, `exitY`, `fillColor`, `fontStyle`, `horizontal`, `html`, `jettySize`, `orthogonalLoop`, `rounded`, `shape`, `startArrow`, `startSize`, `strokeColor`, `strokeWidth`, `swimlane`, `text`, `verticalAlign`, `whiteSpace`

Это и есть реальный поднабор, который нужно поддерживать в v1.

### 3.4. Наблюдаемые screen-frame контейнеры
| ID | Название | Размер | Родитель |
|---|---|---|---|
| `c17` | Оформление заказа | `392×1088` | `c2` |
| `ZD1CV1WOafDuuiwsY5MV-4` | Выбор МЦ | `332×536` | `c2` |
| `c97` | Корзина | `364×786` | `c92` |
| `c156` | — | `326×334` | `c145` |
| `c176` | Успешная оплата | `364×744` | `c145` |
| `c244` | Заказ ожидает оплаты / Оплата при посещении МЦ | `364×730` | `c212` |
| `c310` | Авторизация / Если пользователь не вошел | `332×404` | `c271` |
| `c329` | Заказ / результаты | `346×458` | `c271` |
| `c349` | Файл результата / Просмотр PDF | `292×424` | `c271` |

### 3.5. Вывод по входным данным
Редактор должен поддерживать:
- top-level board containers (lane/swimlane);
- screen frame;
- child-relative positioning;
- composite UI components;
- orthogonal connectors;
- HTML-based text value inside draw.io XML.

---

## 4. Продуктовые рамки

### 4.1. Что входит в scope v1
Обязательно:
- бесконечная доска;
- создание и перемещение screen;
- создание lane (опционально, но желательно уже в v1);
- palette элементов;
- property inspector;
- layers/tree;
- drag & drop;
- resize;
- containment within screen;
- import `.drawio`;
- export `.drawio`;
- JSON save/load;
- undo/redo;
- local autosave;
- deterministic IDs;
- debug/XML panel;
- templates based on current file patterns.

### 4.2. Что НЕ входит в scope v1
Не делать:
- collaboration / multi-user;
- cloud backend;
- комментарии/ревью как в Figma;
- полноценный редактор всех фигур diagrams.net;
- плагины;
- сложный auto-layout;
- animation/prototyping;
- runtime business logic inside screens.

### 4.3. Что желательно заложить архитектурно
Нужно предусмотреть расширение под:
- AI prompt → JSON scene;
- JSON scene → `.drawio`;
- reusable component library;
- import/export screen presets;
- prompt-driven generation через Codex.

---

## 5. UX и внешний вид редактора

## 5.1. Общий layout приложения

Редактор должен иметь следующую структуру:

1. **Top bar**
   - название проекта/файла;
   - кнопки New / Open / Save JSON / Import Draw.io / Export Draw.io;
   - undo / redo;
   - zoom controls;
   - fit screen / fit board;
   - переключатель grid / snap / guides.

2. **Left sidebar**
   - palette элементов;
   - библиотека компонентов;
   - screen presets;
   - быстрый поиск по элементам;
   - шаблоны экранов.

3. **Central board**
   - бесконечная панорамируемая доска;
   - zoom;
   - размещение lane и screen;
   - работа с selection box.

4. **Right sidebar**
   - inspector выбранного элемента;
   - geometry;
   - style;
   - text/content;
   - layout;
   - XML/debug.

5. **Bottom status bar** (желательно)
   - текущий zoom;
   - координаты курсора;
   - размер selected element;
   - warnings / validation state.

---

## 5.2. Поведение доски

### Обязательное:
- панорама доски:
  - middle mouse drag;
  - либо `Space + drag`;
  - trackpad pan;
- zoom:
  - `Ctrl/Cmd + wheel`;
  - trackpad pinch;
  - preset buttons: 50%, 100%, 150%, Fit, Fit Selection;
- множественные screen на одной доске;
- свободное размещение screen на доске;
- выделение рамкой (marquee selection);
- snap to grid;
- smart guides;
- board background neutral, ненавязчивый.

### Рекомендуемые default значения:
- `gridSize = 10`, потому что в исходном `.drawio` файле используется `gridSize="10"`;
- grid включён по умолчанию;
- snap включён по умолчанию;
- guides включены по умолчанию.

---

## 5.3. Поведение screen

Экран — главный контейнер для мобильного интерфейса.

### Экран обязан иметь:
- id;
- name/title;
- optional subtitle;
- x, y на доске;
- width, height;
- fillColor;
- strokeColor;
- borderRadius;
- children.

### Правила:
1. Все UI-элементы экрана позиционируются **относительно экрана**.
2. При перемещении экрана все его дети визуально и логически перемещаются вместе с ним.
3. Дети экрана не должны “отклеиваться”.
4. По умолчанию элемент нельзя перетащить за пределы экрана.
5. Если элемент перетаскивается на другой экран, происходит явный reparent.
6. Screen может быть resized, но:
   - нельзя обрезать детей без предупреждения;
   - при уменьшении экрана должен быть вариант:
     - либо block resize,
     - либо clip with warning,
     - либо auto-fit children.
   Для v1: **block resize below content bounds**.

### Визуально:
- экран должен иметь frame в стиле исходного файла:
  - `fillColor=#ffffff`
  - `strokeColor=#1c2a30`
  - `arcSize=14`
- title/subtitle могут отображаться над экраном как отдельные board-level text nodes или как часть screen decoration.

---

## 5.4. Работа с элементами

Поддержать:
- add from palette;
- drop into screen;
- drag inside screen;
- resize;
- duplicate;
- delete;
- copy/paste;
- multi-select;
- align/distribute;
- nudge by arrows;
- lock/unlock;
- hide/show;
- bring to front / send to back within parent.

### Горячие клавиши
Обязательные:
- `Delete/Backspace` — удалить;
- `Ctrl/Cmd + D` — дублировать;
- `Ctrl/Cmd + C / V` — copy/paste;
- `Ctrl/Cmd + Z / Shift+Ctrl/Cmd+Z` — undo/redo;
- `Arrow keys` — nudge 1 px;
- `Shift + Arrow` — nudge 10 px;
- `Space` — pan mode;
- `Esc` — снять выделение / выйти из текстового редактирования.

---

## 5.5. Редактирование текста

Текст должен быть удобным.

### Требования:
- double click по text-like node открывает inline text edit;
- для composite nodes редактируются соответствующие поля в inspector;
- текст хранится как plain text в JSON-модели;
- при экспорте в draw.io превращается в HTML в `value`;
- обязательно делать корректный HTML-escape;
- поддержать:
  - font size;
  - font weight;
  - color;
  - align;
  - line-height;
  - optional bold/normal.

---

## 5.6. Стрелки и связи

Редактор должен поддерживать orthogonal connectors.

### Возможности:
- соединение screen ↔ screen;
- screen ↔ button;
- button ↔ target point;
- free connector between arbitrary nodes;
- target can be:
  - target node;
  - target point;
  - polyline with waypoints.

### Требования:
- базовый стиль по умолчанию:
  - `edgeStyle=orthogonalEdgeStyle`
  - `strokeWidth=5`
  - `rounded=0`
- поддержать `endArrow=classic`;
- поддержать optional `startArrow=classic`;
- поддержать waypoints;
- поддержать entry/exit anchors (`entryX`, `entryY`, `exitX`, `exitY`) как advanced option;
- edges должны пересчитываться при перемещении source/target.

### Внутренняя модель:
edge должен быть отдельным типом данных, а не обычным child rectangle.

---

## 5.7. Слои и дерево структуры

Слева или справа должно быть tree view:

- Board
  - Lane (optional)
    - Screen
      - Section
      - Field
      - Button
      - CheckboxRow
      - etc.
  - Loose arrows
  - Loose notes

### Требования:
- drag&drop в дереве;
- смена parent через дерево;
- блокировка accidental invalid nesting;
- визуальная индикация hidden/locked;
- collapsed/expanded groups.

---

## 5.8. Debug / XML / AI panel

Это важное требование.

Для выбранного элемента должен быть режим:
- показать internal JSON;
- показать generated draw.io XML fragment;
- показать computed style;
- показать parent chain;
- показать absolute + relative coordinates.

Для всего документа:
- экспорт generated XML preview;
- validation report;
- unsupported import tokens list.

Это нужно, чтобы проект был удобен не только человеку, но и AI/Codex.

---

## 6. Каталог элементов из текущего файла

Ниже перечислены элементы, которые **обязательно** нужно поддержать, потому что они реально есть в предоставленном `.drawio`.

### 6.1. FlowLane
**Источник:** `swimlane`  
**Роль:** крупная сценарная область на доске.  
**Пример:** `c2`, `c92`, `c145`, `c212`, `c271`

**Основные свойства:**
- id
- title
- x, y
- width, height
- orientation (`vertical` по умолчанию)
- startSize = высота заголовка lane
- fill/background (можно оставить прозрачным или системным)
- children: screens, texts, arrows

**Экспорт:**
```xml
style="swimlane;horizontal=0;whiteSpace=wrap;html=1;startSize=34;"
```

---

### 6.2. Screen
**Источник:** screen-like container с внешней тёмной рамкой.  
**Примеры:** `c17`, `c97`, `c176`, `c244`, `c310`, `c329`

**Свойства:**
- id
- name
- subtitle?
- x, y
- width, height
- fillColor
- strokeColor
- arcSize
- clipChildren = true
- children[]

**Дефолт из файла:**
```xml
rounded=1;
fillColor=#ffffff;
strokeColor=#1c2a30;
arcSize=14;
container=1;
collapsible=0;
dropTarget=1;
connectable=0;
```

---

### 6.3. ScreenTitle / ScreenSubtitle
**Источник:** отдельные text nodes над экраном.  
**Примеры:** `c15`, `c174`, `c242`, `c243`, `c308`, `c309`, `c347`, `c348`

**Свойства:**
- text
- styleToken (`displayTitle`, `subtitle`)
- x, y
- width, height
- align

---

### 6.4. HeaderStrip
**Источник:** мягкая tinted-плашка заголовка внутри экрана.  
**Пример:** `c18`

**Свойства:**
- x, y, width, height
- fillColor `#eef5f4`
- strokeColor `#d7e1e3`
- arcSize `14`
- title text

---

### 6.5. Field
**Источник:** поле вида label + value.  
**Примеры:** `c21`, `c24`, `c73`, `c76`, `c101`, `c180`, `c197`, `c204`

**Семантика:** это composite component.

**Внутренний состав:**
- container rect
- label text
- value text

**Свойства:**
- label
- value
- placeholder?
- helperText?
- variant: `soft`, `plain`, `outlined`
- editable: boolean
- size: default / compact
- leadingIcon? (future)
- trailingIcon? (future)

**Базовый экспорт-паттерн:**
- outer container:
  - `fillColor=#f7fafb`
  - `strokeColor=#d7e1e3`
  - `arcSize=10`
- label:
  - `9px`, bold, muted
- value:
  - `11px`, regular, dark

---

### 6.6. SectionCard
**Источник:** большая карточка-секция.  
**Примеры:** `c27`, `c46`, `c53`, `c61`, `c66`, `c79`, `c131`

**Свойства:**
- title
- x, y, width, height
- background
- border
- radius
- children
- padding
- spacing

**Варианты:**
- `default`
- `soft`
- `summary`
- `warning`
- `highlight`

---

### 6.7. ProductRow
**Источник:** карточка позиции в корзине/составе заказа.  
**Примеры:** `c29`, `c34`, `c39`, `c104`, `c113`, `c122`

**Свойства:**
- title
- subtitle
- codeTag?
- bonusTag?
- qtyControl?
- price?
- deleteAction?
- variant: simple / cart / order-summary

**Важно:** в редакторе это должен быть **единый semantic component**, а не набор несвязанных текстов.

---

### 6.8. InfoRow / PriceRow
**Источник:** строки типа “Сумма покупки / 5 420 ₽”.  
**Пример:** блок `c66` и его тексты.

**Свойства:**
- leftText
- rightText
- leftStyleToken
- rightStyleToken
- rowHeight
- alignRightWidth

---

### 6.9. CheckboxRow
**Источник:** квадрат + подпись.  
**Примеры:** `c44 + c45`, `c59 + c60`, `c81 + c82`, `c83 + c84`, `c85 + c86`

**Свойства:**
- checked
- label
- size = 16 default
- labelWrap
- state: default / disabled / error
- checkmarkVisible (опционально для будущего)

**Базовый стиль box из файла:**
- `16x16`
- `fillColor=#ffffff`
- `strokeColor=#0f766e`
- `arcSize=6`

---

### 6.10. Button
**Примеры:** `c87`, `c88`, `c136`, `c170`, `c207`, `ZD1...-20`, `c267`

**Подтипы:**
- primary CTA
- secondary outline
- neutral action
- width = fill or fit-content

**Свойства:**
- text
- variant
- x, y, width, height
- fillColor
- strokeColor
- textColor
- borderRadius
- fontWeight
- disabled?

**Стандартные варианты:**
- `primarySuccess`: `#d5e8d4 / #82b366 / radius 14`
- `secondaryOutline`: `#ffffff / #d7e1e3 / radius 14`
- `accentOutline`: `#ffffff / #0f766e / radius 14`

---

### 6.11. SegmentedControl
**Примеры:** `c48+c49`, `c63+c64+c65`, `c195+c196`, `c262+c263`, `c313+c314`

**Свойства:**
- label? (опциональный заголовок секции)
- items[]
- activeIndex
- controlWidth
- itemHeight
- activeFill
- activeStroke
- inactiveFill
- inactiveStroke

**Стиль активного сегмента из файла:**
- `fillColor=#dcefeb`
- `strokeColor=#0f766e`
- `arcSize=12`

**Стиль неактивного сегмента из файла:**
- `fillColor=#ffffff`
- `strokeColor=#666666`
- `arcSize=12`

---

### 6.12. Badge / Pill / Tag
**Примеры:** `c109`, `c118`, `c127`, `c333`, `c337`, `c341`

**Свойства:**
- text
- variant: `info`, `success`, `code`, `status`
- size: sm/md
- fillColor
- strokeColor
- textColor
- radius

**Наблюдаемые варианты:**
- bonus badge: `#dae8fc / #6c8ebf / radius 9`
- status success: `#d5e8d4 / #82b366 / radius 9`
- code tag: `#f5f5f5 / #d7e1e3 / radius 9`

---

### 6.13. QuantityControl
**Пример:** `c111`, `c120`, `c129`

**Свойства:**
- value
- min/max?
- style
- interactionMode (static in MVP allowed)

---

### 6.14. NoticeBanner
**Примеры:** `c208`, `c245`

**Свойства:**
- title
- body
- variant: info / warning / success
- x, y, width, height
- fillColor
- strokeColor
- radius

**Важно:** из исходного файла присутствуют как минимум:
- info/highlight banner
- warning banner

---

### 6.15. PDFRow
**Примеры:** `c336`, `c340` + `c337`, `c341`

**Свойства:**
- title
- subtitle
- fileTypeBadge = PDF
- clickableStyle
- leadingIcon? (future)

---

### 6.16. PlaceholderDocument / SkeletonBlock
**Пример:** `c349` со множеством внутренних прямоугольников `c351–c361`

**Свойства:**
- width, height
- bar count
- bar widths[]
- gap
- fillColor `#e3ebed`
- borderColor `#d7e1e3`
- radius `6`

Это важно для mockup-сцены и low-fi режимов.

---

### 6.17. CloudNote
**Пример:** `c5`

**Свойства:**
- x, y, width, height
- title?
- fillColor `#fffaf0`
- strokeColor `#c49102`
- children: note rows
- connectable = optional false

---

### 6.18. NoteKeyValueRow
**Примеры:** `c6`, `c9`, `c12`

**Свойства:**
- key
- value
- neutral note style
- innerBorderColor `#d7d0bc`
- radius `8`

---

### 6.19. Text
**Источник:** все `style="text;..."`  
**Примеры:** практически весь интерфейс.

**Свойства:**
- text
- fontSize
- fontWeight
- color
- align
- verticalAlign
- lineHeight
- width, height
- htmlMode = true on export

**Важно:** внутренне хранить plain text + style object, а не raw HTML.

---

### 6.20. Rectangle / Box
Нужен как базовый low-level primitive:
- background rect
- generic container
- clickable block
- placeholder

---

### 6.21. ArrowConnector
**Примеры:** `e346`, `ZD1...-50`, `ZD1...-51`

**Свойства:**
- sourceId?
- targetId?
- sourcePoint?
- targetPoint?
- waypoints[]
- orthogonal = true
- startArrow?
- endArrow?
- strokeWidth
- strokeColor

---

## 7. Дополнительные типовые mobile-элементы, которых нет в файле, но они нужны

Ниже список элементов, которые нужно добавить, даже если их нет в текущем примере.

### 7.1. Input
- label
- value
- placeholder
- helperText
- errorText
- leading/trailing icon
- state: default/focus/error/disabled
- radius
- variant

### 7.2. Textarea
- multiline text
- minRows / maxRows
- autoHeight option

### 7.3. RadioGroup / RadioRow
- options
- selectedIndex
- vertical/horizontal layout

### 7.4. SwitchRow
- label
- description?
- checked

### 7.5. Divider
- horizontal or vertical
- thickness
- color
- margins

### 7.6. TopAppBar / NavBar
- title
- leftAction
- rightAction
- surface style

### 7.7. BottomTabBar
- items[]
- activeIndex
- icon placeholders
- label mode

### 7.8. BottomSheet
- header
- content slots
- actions
- height

### 7.9. Modal
- title
- body
- actions
- overlayOpacity

### 7.10. Toast / Snackbar
- message
- optional action
- style variant

### 7.11. EmptyState
- icon/image placeholder
- title
- body
- action button

### 7.12. ImagePlaceholder
- image source optional
- aspect ratio
- radius
- fit mode

### 7.13. IconPlaceholder
- glyphName or placeholder text
- size
- color

### 7.14. ChipSet
- list of chips
- selected states

### 7.15. Accordion
- sections[]
- expanded state

### 7.16. SearchBar
- placeholder
- value
- icon
- clear button

**Требование:** эти элементы должны быть заложены как extensible catalog, даже если не все будут реализованы в первом коммите.

---

## 8. Визуальный стандарт (брать за основу исходный файл)

## 8.1. Палитра
| Токен | HEX | Назначение | Пример в файле |
|---|---|---|---|
| `screenStroke` | `#1c2a30` | рамка экрана/главного контейнера | `c17` |
| `neutralBorder` | `#d7e1e3` | основная нейтральная граница карточек/полей | `c21` |
| `surface` | `#ffffff` | базовая поверхность | `c17` |
| `surfaceMuted` | `#f7fafb` | поля, вторичные карточки, soft background | `c21` |
| `headerTint` | `#eef5f4` | плашка заголовка | `c18` |
| `interactiveFill` | `#dcefeb` | активный сегмент/выделение | `c48` |
| `interactiveStroke` | `#0f766e` | акцентная граница/чекбокс/интерактив | `c44` |
| `successFill` | `#d5e8d4` | primary CTA success-style | `c88` |
| `successStroke` | `#82b366` | граница primary CTA | `c88` |
| `badgeFill` | `#dae8fc` | badge/PDF/bonus pill | `c109` |
| `badgeStroke` | `#6c8ebf` | граница badge/PDF | `c109` |
| `placeholderFill` | `#e3ebed` | скелетоны/placeholder bars | `c351` |
| `warningFill` | `#ffe6cc` | warning/info banner | `c245` |
| `warningStroke` | `#d79b00` | граница warning banner | `c245` |
| `noteFill` | `#fffaf0` | облако-комментарий | `c5` |
| `noteStroke` | `#c49102` | граница облака | `c5` |
| `noteCardBorder` | `#d7d0bc` | внутренние карточки в облаке | `c6` |

## 8.2. Типографика
**Базовый шрифт из файла:** `Helvetica, Arial, sans-serif`  
**Базовая line-height:** `1.2`

| Токен | Спецификация | Назначение | Примеры |
|---|---|---|---|
| `displayTitle` | 14px / 700 / center / #1f2b2d | название экрана или сценария | c15, c174 |
| `sectionTitle` | 10px / 700 / left / #66757a | заголовок секции | c28, c54, c62 |
| `fieldLabel` | 9px / 700 / left / #66757a | label поля | c22, c25, c74 |
| `body` | 11px / 400 / left / #1f2b2d | значение поля / основной текст | c23, c31 |
| `bodyStrong` | 11px / 700 / left / #1f2b2d | название позиции, акцентный текст | c30, c35 |
| `cta` | 11px / 700 / center / #1f2b2d | кнопка | c88, c48 |
| `mutedCenter` | 11px / 400 / center / #66757a | подписи в статусных чипах | c4 |
| `successText` | 9–11px / 400–700 / #0f766e | бонусы, интерактив, успех | c33, c56 |
| `dangerText` | 10px / 700 / #c2410c | удаление/опасное действие | c110 |
| `warningText` | 11px / 400 / #6f4b18 | warning subtitle | c247 |

## 8.3. Скругления
| Токен | arcSize в draw.io | Назначение | Примеры |
|---|---:|---|---|
| `r-xs` | `6` | checkbox, skeleton, small pill | c44, c351 |
| `r-sm` | `8` | внутренние note cards | c6 |
| `r-md` | `9` | badge/status | c109, c333 |
| `r-lg` | `10` | field/card small | c21 |
| `r-xl` | `12` | segmented options / chips | c48 |
| `r-2xl` | `14` | screen, main card, primary buttons | c17, c27, c88 |
| `r-3xl` | `16` | banner / wide special container | c208, c245 |

## 8.4. Базовые размеры и паттерны из файла
- checkbox box: `16×16`
- common field height: `42`
- segmented item height: `28`
- main CTA height: `34–36`
- section title padding top: обычно `8–12`
- standard inner horizontal padding: `10–14`
- screen widths в примере: `292`, `326`, `332`, `346`, `364`, `392`
- grid size: `10`

## 8.5. Рекомендованные screen presets
В приложении надо добавить:
- Custom
- 320×568
- 360×800
- 375×812
- 390×844
- 393×852
- 412×915
- “From current file” presets:
  - 392×1088
  - 364×786
  - 364×744
  - 364×730
  - 332×404
  - 346×458
  - 292×424

---

## 8.6. Репрезентативные XML-фрагменты из исходного файла

Эти фрагменты нужно использовать как **референс export-шаблонов**, а не как raw-copy/paste без понимания.

### Screen frame
```xml
<mxCell id="c17" parent="c2"
  style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#1c2a30;arcSize=14;container=1;collapsible=0;dropTarget=1;connectable=0;"
  value="" vertex="1">
  <mxGeometry x="416" y="47" width="392" height="1088" as="geometry" />
</mxCell>
```

### Field container
```xml
<mxCell id="c21" parent="c17"
  style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f7fafb;strokeColor=#d7e1e3;arcSize=10;container=1;collapsible=0;dropTarget=1;connectable=0;"
  value="" vertex="1">
  <mxGeometry x="14" y="88" width="171" height="42" as="geometry" />
</mxCell>
```

### Checkbox box
```xml
<mxCell id="c44" parent="c17"
  style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#0f766e;arcSize=6;"
  value="" vertex="1">
  <mxGeometry x="14" y="364" width="16" height="16" as="geometry" />
</mxCell>
```

### Active segmented option
```xml
<mxCell id="c48" parent="c46"
  style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dcefeb;strokeColor=#0f766e;arcSize=12;"
  value="&lt;div style=&quot;font-size:11px;font-family:Helvetica,Arial,sans-serif;color:#1f2b2d;text-align:center;line-height:1.2;font-weight:700;white-space:normal;&quot;&gt;В МЦ&lt;/div&gt;"
  vertex="1">
  <mxGeometry x="10" y="28" width="108" height="28" as="geometry" />
</mxCell>
```

### Primary CTA
```xml
<mxCell id="c88" parent="c17"
  style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;arcSize=14;"
  value="&lt;div style=&quot;font-size:11px;font-family:Helvetica,Arial,sans-serif;color:#1f2b2d;text-align:center;line-height:1.2;font-weight:700;white-space:normal;&quot;&gt;Перейти к оплате&lt;/div&gt;"
  vertex="1">
  <mxGeometry x="132" y="1012" width="246" height="34" as="geometry" />
</mxCell>
```

### Cloud note
```xml
<mxCell id="c5" parent="c2"
  style="shape=cloud;whiteSpace=wrap;html=1;fillColor=#fffaf0;strokeColor=#c49102;container=1;collapsible=0;dropTarget=1;connectable=0;"
  value="" vertex="1">
  <mxGeometry x="28" y="66" width="362" height="218" as="geometry" />
</mxCell>
```

### Orthogonal connector
```xml
<mxCell id="e346" edge="1" parent="c271"
  style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=5;strokeColor=#000000;endArrow=classic;endFill=1;">
  <mxGeometry relative="1" as="geometry">
    <mxPoint x="596" y="240" as="sourcePoint" />
    <mxPoint x="746" y="240" as="targetPoint" />
  </mxGeometry>
</mxCell>
```

### Swimlane
```xml
<mxCell id="c2" parent="1"
  style="swimlane;horizontal=0;whiteSpace=wrap;html=1;startSize=34;"
  value="1. Чекаут" vertex="1">
  <mxGeometry x="64" y="54" width="1256" height="1172" as="geometry" />
</mxCell>
```

---

## 9. Модель данных

## 9.1. Главный принцип
Редактор **не должен** держать raw draw.io XML как основную in-memory модель.

Правильный pipeline:

```text
.drawio XML <-> parser/serializer <-> internal JSON document model <-> editor UI
```

## 9.2. Document model
Пример корневой структуры:

```ts
type DocumentModel = {
  id: string;
  name: string;
  version: string;
  board: BoardModel;
  resources?: {
    colorTokens: Record<string, string>;
    textStyles: Record<string, TextStyle>;
    componentPresets: Record<string, ComponentPreset>;
  };
  meta?: {
    source?: "new" | "imported-drawio";
    originalFileName?: string;
    importedAt?: string;
    warnings?: string[];
  };
};
```

## 9.3. BoardModel
```ts
type BoardModel = {
  width?: number;      // optional, logical infinite board
  height?: number;
  zoom: number;
  panX: number;
  panY: number;
  gridSize: number;
  snapToGrid: boolean;
  guides: boolean;
  lanes: LaneNode[];
  looseNodes: Node[];
  edges: EdgeNode[];
};
```

## 9.4. Base node
```ts
type BaseNode = {
  id: string;
  type: NodeType;
  name?: string;
  parentId?: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;
  opacity?: number;
  metadata?: Record<string, unknown>;
};
```

## 9.5. Текстовые свойства
```ts
type TextStyle = {
  fontFamily: string;
  fontSize: number;
  fontWeight: 400 | 700;
  lineHeight: number;
  color: string;
  align: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
};
```

## 9.6. Node types
Минимальный union:
```ts
type Node =
  | LaneNode
  | ScreenNode
  | TextNode
  | BoxNode
  | SectionNode
  | FieldNode
  | CheckboxRowNode
  | ButtonNode
  | SegmentedControlNode
  | ProductRowNode
  | InfoRowNode
  | BadgeNode
  | BannerNode
  | CloudNoteNode
  | PlaceholderNode
  | InputNode
  | TextareaNode
  | RadioGroupNode
  | SwitchRowNode
  | DividerNode
  | ListNode
  | ListItemNode
  | ModalNode
  | BottomSheetNode
  | TabBarNode
  | ImageNode
  | IconNode;
```

## 9.7. ScreenNode
```ts
type ScreenNode = BaseNode & {
  type: "screen";
  title?: string;
  subtitle?: string;
  clipChildren: boolean;
  children: string[]; // ids
  preset?: string;
};
```

## 9.8. Composite nodes
Внутри редактора **semantic component = один node**, даже если экспортируется в несколько `mxCell`.

Например:
- `FieldNode` → container + 2 text cells
- `CheckboxRowNode` → checkbox square + label text
- `ProductRowNode` → container + title + subtitle + price/badge/qty etc

Это критично. Иначе редактор быстро превратится в хаос.

## 9.9. Edge model
```ts
type EdgeNode = {
  id: string;
  type: "edge";
  parentId?: string | null;
  sourceId?: string | null;
  targetId?: string | null;
  sourcePoint?: { x: number; y: number };
  targetPoint?: { x: number; y: number };
  waypoints?: { x: number; y: number }[];
  orthogonal: boolean;
  startArrow?: "none" | "classic";
  endArrow?: "none" | "classic";
  strokeColor: string;
  strokeWidth: number;
};
```

## 9.10. Координатные системы
- Board coordinates — абсолютные
- Lane coordinates — относительно board
- Screen coordinates — относительно board или lane
- Child coordinates — относительно screen/section/container
- Edge routing:
  - хранить в logical board coordinates;
  - при экспорте пересчитывать в parent space выбранного edge parent.

---

## 10. Правила вложенности

Разрешённые parent-child отношения:

- Board → Lane
- Board → Screen
- Board → CloudNote
- Board → Text
- Board → Edge
- Lane → Screen
- Lane → Text
- Lane → Edge
- Screen → Section / Header / Text / Button / Checkbox / Field / ProductRow / Placeholder / Banner / Badge / etc.
- Section → Text / Field / Button / Badge / Checkbox / ListItem / etc.
- Complex components не должны принимать произвольных детей, если это не предусмотрено.

### Жёсткие правила
1. Нельзя класть Screen внутрь Screen.
2. Нельзя класть Lane внутрь Screen.
3. Нельзя класть Edge как обычный child любого произвольного компонента; только Board/Lane/Screen при наличии валидного use-case.
4. Нельзя допускать orphan children.
5. При удалении родителя должна быть стратегия:
   - cascade delete (по умолчанию)
   - с предупреждением.

---

## 11. Импорт/экспорт Draw.io XML

## 11.1. Цель
Обеспечить:
- импорт существующего `.drawio`,
- нормализацию в JSON model,
- редактирование,
- экспорт обратно в `.drawio`,
- максимально стабильный round-trip для поддерживаемого subset.

## 11.2. Что нужно поддерживать при импорте
Обязательно:
- `mxfile`
- `diagram`
- `mxGraphModel`
- `root`
- `mxCell`
- `mxGeometry`
- `mxPoint`
- `Array as="points"`
- style string parsing
- `value` HTML decoding
- `vertex="1"`
- `edge="1"`
- `parent`, `source`, `target`

## 11.3. Маппинг style string → style object
Нужен двусторонний преобразователь:

```ts
parseStyle("rounded=1;fillColor=#fff;strokeColor=#000;")
=> {
  rounded: "1",
  fillColor: "#fff",
  strokeColor: "#000"
}
```

И обратно:
```ts
serializeStyle(styleObj) => "rounded=1;fillColor=#fff;strokeColor=#000;"
```

### Требования:
- сохранять порядок ключей детерминированно;
- уметь хранить unknown tokens;
- unknown tokens не терять, а складывать в `metadata.unmappedStyle`.

## 11.4. Маппинг text
Внутри JSON текст должен храниться как:

```ts
{
  text: "Перейти к оплате",
  textStyle: {
    fontFamily: "Helvetica, Arial, sans-serif",
    fontSize: 11,
    fontWeight: 700,
    color: "#1f2b2d",
    align: "center",
    lineHeight: 1.2
  }
}
```

При экспорте:
```xml
value="&lt;div style=&quot;font-size:11px;font-family:Helvetica,Arial,sans-serif;color:#1f2b2d;text-align:center;line-height:1.2;font-weight:700;white-space:normal;&quot;&gt;Перейти к оплате&lt;/div&gt;"
```

## 11.5. Маппинг geometry
- `x`, `y`, `width`, `height` → geometry
- edge:
  - `relative="1"`
  - `sourcePoint`
  - `targetPoint`
  - `points[]`

## 11.6. Правила сериализации
1. Всегда создавать `mxCell id="0"` и `mxCell id="1" parent="0"`.
2. Затем сериализовать top-level lane/screen/text/note/edge.
3. Затем children DFS-обходом.
4. Для composite nodes экспортировать детерминированный набор `mxCell`.
5. Экспорт делать **pretty-printed XML**, пригодный для git diff.

## 11.7. Unsupported import behavior
Если импортируется элемент вне поддерживаемого subset:
- создать `UnsupportedNode`;
- сохранить original XML fragment;
- показать warning;
- не терять данные молча.

## 11.8. Валидация перед export
Перед export обязательно проверить:
- все parentId существуют;
- нет циклов в дереве;
- все children внутри допустимых bounds;
- edge source/target валидны или есть targetPoint;
- у каждого node есть type;
- все цвета валидны;
- размеры > 0.

---

## 12. XML mapping patterns для основных компонентов

## 12.1. Screen
Экспортируется одним `mxCell` + optional title/subtitle text outside.

## 12.2. Field
Экспортируется как:
- container `mxCell vertex=1`
- label text `mxCell vertex=1 style=text`
- value text `mxCell vertex=1 style=text`

## 12.3. CheckboxRow
Экспортируется как:
- square block
- text node

## 12.4. Button
Экспортируется одним `mxCell` с текстом в `value`.

## 12.5. SegmentedControl
Экспортируется как:
- wrapper section optional
- button cells по числу сегментов

## 12.6. ProductRow
Экспортируется как набор внутренних `mxCell`:
- container
- title text
- subtitle text
- code badge
- bonus badge
- qty control
- optional delete text

## 12.7. Banner
Экспортируется как 1 block + 1..n text nodes.

## 12.8. CloudNote
Экспортируется как:
- cloud shape
- inner note rows
- optional CTA
- optional arrow

---

## 13. Технологическая архитектура

## 13.1. Выбранный стек
Нужно использовать:

- **React**
- **TypeScript**
- **Vite**
- **Zustand** — state management
- **Zod** — runtime schema validation
- **fast-xml-parser** для чтения XML
- **xmlbuilder2** для записи XML
- **Vitest** — unit tests
- **Playwright** — e2e tests

### Renderer
Выбрать **SVG-based renderer**, а не canvas-first.

### Почему SVG
Для этой задачи SVG предпочтительнее:
- проще делать crisp vector UI;
- проще инспектировать DOM;
- легче реализовать nested transforms и clipping;
- проще debug;
- проще экспортировать/сопоставлять с draw.io примитивами;
- количество объектов в v1 умеренное, performance будет достаточной.

### Допустимо
- dnd-kit — для palette/layers DnD;
- собственные pointer interactions — для canvas editing;
- React portal/overlay — для inline text edit.

---

## 13.2. Архитектурные модули
Минимальный набор модулей:

- `editor/model` — типы и schema
- `editor/state` — Zustand store
- `editor/board` — board, zoom, pan, selection
- `editor/interactions` — drag/resize/reparent/connect
- `editor/renderers` — SVG rendering layer
- `editor/components` — semantic components
- `editor/palette`
- `editor/inspector`
- `editor/layers`
- `editor/history`
- `editor/templates`
- `drawio/parse`
- `drawio/serialize`
- `drawio/mappers`
- `drawio/validation`
- `debug/xml-preview`
- `tests/unit`
- `tests/e2e`

---

## 13.3. Предлагаемая структура файлов

```text
mobile-mockup-editor/
  docs/
    architecture.md
    element-catalog.md
    drawio-mapping.md
    roadmap.md
    decisions.md
  public/
  src/
    app/
      App.tsx
      routes.tsx
    editor/
      model/
        types.ts
        schemas.ts
        defaults.ts
        presets.ts
      state/
        store.ts
        selectors.ts
        history.ts
      board/
        BoardView.tsx
        BoardBackground.tsx
        BoardViewport.ts
      render/
        SvgCanvas.tsx
        RenderNode.tsx
        RenderEdge.tsx
        overlays/
      interactions/
        drag.ts
        resize.ts
        selection.ts
        reparent.ts
        snapping.ts
        routing.ts
      palette/
      inspector/
      layers/
      templates/
      commands/
      utils/
    drawio/
      parse/
        parseDrawio.ts
        parseStyle.ts
        parseGeometry.ts
      serialize/
        serializeDrawio.ts
        serializeStyle.ts
        serializeTextHtml.ts
      mapping/
        importMap.ts
        exportMap.ts
      validation/
        validateDocument.ts
        validateExport.ts
    shared/
      ui/
      hooks/
      lib/
    main.tsx
  tests/
    unit/
    e2e/
  package.json
  vite.config.ts
  tsconfig.json
```

---

## 14. Поведенческие алгоритмы

## 14.1. Добавление элемента
1. Пользователь выбирает элемент в palette.
2. Перетаскивает на screen.
3. Если drop вне screen — не добавлять или создать floating preview с требованием выбрать parent.
4. Если drop на valid container — присвоить `parentId`.
5. Координаты сохранить относительно parent.

## 14.2. Drag внутри screen
- during drag:
  - перевод абсолютных координат курсора в parent-local coordinates;
  - snap;
  - clamp to bounds;
- on release:
  - commit transaction в history.

## 14.3. Reparent
- если элемент переносится в другой parent, координаты должны пересчитаться так, чтобы визуальная позиция сохранилась;
- old absolute position -> new local position.

## 14.4. Resize
- resize handles по углам/сторонам;
- respect minWidth / minHeight;
- для composite components разрешить только допустимые resize modes;
- напр. CheckboxRow менять width да, height — ограниченно.

## 14.5. Selection
- single selection;
- multi selection with Shift;
- marquee selection;
- property inspector отражает:
  - single node props
  - bulk edit of common props for multi-selection.

## 14.6. Clipboard
- copy/paste сохраняет:
  - nodes
  - relative structure
  - children
- новые id детерминированно генерируются заново.

## 14.7. Edge routing
- default orthogonal router;
- source/target anchors на сторонах rect;
- optional manual waypoints;
- reroute when endpoints move.

## 14.8. Snap
Snap должен работать к:
- grid;
- screen edges;
- sibling edges;
- center lines;
- section edges;
- common padding lines.

---

## 15. Компонентные пресеты и шаблоны

Нужно создать библиотеку preset-компонентов на основе текущего файла:

### Presets из файла
- CheckoutScreen
- MedicalCenterSelectionScreen
- CartScreen
- PaymentScreen
- PaymentSuccessScreen
- PaymentInCenterScreen
- AuthScreen
- OrderResultsScreen
- PdfResultScreen
- AdLinkCloudNote

### Layout snippets
- header strip
- field row
- checkbox row
- segmented control (2 items)
- segmented control (3 items)
- summary card
- product row
- pdf row
- warning banner
- primary CTA footer

Эти пресеты должны быть доступны в palette.

---

## 16. JSON как AI-friendly контракт

С самого начала нужно считать JSON-модель **основным AI-контрактом**.

### Требования:
- JSON должен быть максимально плоским и читаемым;
- названия props — очевидные;
- минимизировать скрытую магию;
- одно и то же значение не дублировать без нужды;
- component presets должны быть генерабельны из JSON;
- позднее можно добавить DSL/YAML, но не обязательно в первой реализации.

### Обязательно:
- команда “Export JSON scene”
- команда “Import JSON scene”
- validation errors с понятными сообщениями.

---

## 17. Хранение и persistence

Для v1 достаточно local-first:
- autosave в localStorage / IndexedDB;
- export/import file;
- открыть последний документ при перезапуске.

### Поддержать:
- `.json` — внутренний формат
- `.drawio` — внешний совместимый формат

---

## 18. Undo/redo и транзакции

Все действия должны идти через command/transaction layer.

Команды:
- create node
- delete node
- move node
- resize node
- reparent node
- change property
- create edge
- edit text
- duplicate
- paste
- align

История:
- bounded stack;
- group small drag updates into one commit;
- undo/redo keyboard support.

---

## 19. Validation

Нужен единый validation engine.

Проверки:
- geometry positive;
- no invalid nesting;
- no orphan children;
- no out-of-bounds children (или warning);
- no duplicate IDs;
- edge endpoints valid;
- exportable node types only;
- required props present.

Типы ошибок:
- fatal (export forbidden)
- warning (export allowed)
- info

---

## 20. Производительность и non-functional requirements

### Минимум:
- документ в `300–500` nodes должен работать плавно на обычном ноутбуке;
- zoom/pan не должны лагать;
- drag одного элемента должен быть smooth;
- import/export файла порядка текущего примера должен занимать < 1 сек на обычной машине.

### Качество кода:
- strict TypeScript;
- модульность;
- unit tests на parser/serializer;
- никакой giant god-file архитектуры;
- никакого raw-any кода без причины.

---

## 21. Тестирование

## 21.1. Unit tests
Покрыть:
- parseStyle
- serializeStyle
- parseTextHtml
- serializeTextHtml
- parseGeometry
- export/import of Screen
- export/import of Field
- export/import of CheckboxRow
- export/import of Button
- export/import of Edge
- bounds clamp
- reparent coordinate conversion
- deterministic ID generation

## 21.2. Snapshot tests
Для component rendering:
- Screen
- Field
- CheckboxRow
- Button
- SegmentedControl
- ProductRow
- Banner
- CloudNote

## 21.3. Round-trip tests
Взять текущий `.drawio` и прогонять:

```text
drawio -> import -> json -> export -> drawio
```

Проверять:
- не потерялись основные элементы;
- иерархия сохранена;
- ключевые стили сохранены;
- xml валиден;
- визуальная структура эквивалентна в пределах поддерживаемого subset.

## 21.4. E2E tests
Playwright сценарии:
1. Создать новый screen
2. Добавить field
3. Добавить checkbox
4. Добавить primary button
5. Сохранить JSON
6. Экспортировать drawio
7. Импортировать обратно
8. Проверить, что структура не сломалась

---

## 22. Acceptance criteria

Проект считается принятым, если выполнено всё ниже:

### Обязательно
1. В браузере открывается редактор.
2. Есть бесконечная доска с pan/zoom.
3. Можно создать screen и менять его размер.
4. Можно добавлять в screen элементы:
   - text
   - box/section
   - field
   - checkbox
   - button
   - segmented control
   - badge
   - banner
   - arrow
5. Все дети экрана остаются привязаны к экрану.
6. Нельзя случайно унести child за пределы screen.
7. Есть inspector свойств.
8. Есть layers/tree.
9. Есть undo/redo.
10. Есть import `.drawio`.
11. Есть export `.drawio`.
12. Есть import/export JSON.
13. Есть validation.
14. Есть debug/XML preview.
15. Есть хотя бы 3 screen templates и 5 component presets на базе текущего файла.

### Желательно
- Fit screen / fit board
- smart guides
- multi-select
- align/distribute
- placeholder/skeleton preset
- CloudNote preset

---

## 23. Пошаговый план реализации для Codex AI

### Этап 1. Анализ и документация
- найти draw.io файлы;
- распарсить;
- построить element catalog;
- построить drawio mapping table;
- зафиксировать design tokens.

### Этап 2. Каркас приложения
- Vite + React + TypeScript;
- layout shell;
- state store;
- board viewport.

### Этап 3. Базовая модель и рендер
- internal JSON model;
- SVG renderer;
- screen node;
- text/box nodes;
- selection + drag + resize.

### Этап 4. Composite components
- Field
- CheckboxRow
- Button
- SegmentedControl
- Badge
- Banner
- ProductRow

### Этап 5. Layers, inspector, history
- tree panel;
- property panel;
- undo/redo.

### Этап 6. Import/export
- draw.io parser;
- serializer;
- round-trip tests.

### Этап 7. QA/polish
- templates;
- validation;
- keyboard shortcuts;
- debug XML panel;
- e2e tests.

---

## 24. Решения по умолчанию, если что-то неясно

Codex AI не должен останавливать работу из-за мелкой неопределённости.

Если неясно:
- renderer → SVG
- state manager → Zustand
- XML parse → fast-xml-parser
- XML build → xmlbuilder2
- board background → светлый нейтральный
- grid size → 10
- text font → Helvetica/Arial/sans-serif
- default screen style → как `c17`
- default field style → как `c21`
- default button primary → как `c88`
- default segmented active → как `c48`
- default edge → как `e346`

---

## 25. Важные инженерные замечания

1. **Не делать raw-XML-first editor.**  
   XML нужен как формат импорта/экспорта, а не как primary model.

2. **Не делать клон всего diagrams.net.**  
   Нужен controlled subset.

3. **Не превращать composite UI в россыпь несвязанных примитивов.**  
   Это сделает редактор неудобным.

4. **Нужно сохранить пригодность для AI.**  
   Internal JSON должен быть простым и стабильным.

5. **Export должен быть детерминированным.**  
   Это важно для git diff и дальнейшей генерации.

6. **Нужен debug-mode.**  
   Без него будет неудобно отлаживать mapping draw.io.

---

## 26. Будущие расширения (не обязательны в v1, но архитектура должна позволять)

- prompt → scene JSON
- scene JSON → render/editor import
- YAML/DSL layer
- component library versioning
- screen preset packs
- responsive preview
- export PNG/SVG
- batch generation of screens
- AI assistant inside editor
- compare two scenes / diff mode

---

## 27. Итоговая краткая формулировка задачи для Codex AI

Нужно создать **локальный браузерный редактор мобильных макетов** с бесконечной доской, screen-as-parent и строгой иерархией, который поддерживает controlled subset draw.io XML, использует внутреннюю JSON-модель, умеет импортировать существующие `.drawio`, экспортировать обратно в `.drawio`, а также даёт удобный UI для сборки экранов, карточек, полей, кнопок, чекбоксов, секций, баннеров, badge и стрелок.

Главный ориентир — **не ширина возможностей**, а **управляемость, предсказуемость и пригодность для AI-генерации**.

---