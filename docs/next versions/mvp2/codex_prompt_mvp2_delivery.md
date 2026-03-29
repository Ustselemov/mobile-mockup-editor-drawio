Ты работаешь как senior frontend architect + senior editor-platform engineer + QA lead.

В репозитории уже есть документы:
- `technical_spec_mobile_mockup_editor_for_codex.md`
- `drawio_observed_tokens_from_example.json`
- `mvp1_acceptance_audit_protocol.md`
- `technical_spec_mobile_mockup_editor_mvp2.md`

Твоя задача — не пересказывать документы, а выполнить работу по ним.

# Главный режим работы

Не нужно:
- пересказывать ТЗ длинным текстом;
- спрашивать очевидные вопросы;
- описывать идею проекта вместо реализации;
- выдавать “примерно готово”.

Нужно:
- сначала провести формальный аудит текущего состояния MVP1;
- затем закрыть gaps;
- затем реализовать MVP2;
- затем подготовить формальные отчеты приемки.

# Жёсткий порядок выполнения

## Этап 0. Прочитать документы
Прочитай полностью:
1. `technical_spec_mobile_mockup_editor_for_codex.md`
2. `drawio_observed_tokens_from_example.json`
3. `mvp1_acceptance_audit_protocol.md`
4. `technical_spec_mobile_mockup_editor_mvp2.md`

Не пересказывай их. Используй как source of truth.

## Этап 1. Аудит MVP1 (обязательный gate)
Проведи аудит текущего проекта строго по `mvp1_acceptance_audit_protocol.md`.

Создай папку:
`docs/audit/`

И обязательно создай файлы:
- `docs/audit/mvp1_requirement_traceability_matrix.md`
- `docs/audit/mvp1_manual_test_protocol.md`
- `docs/audit/mvp1_automated_test_report.md`
- `docs/audit/mvp1_drawio_roundtrip_report.md`
- `docs/audit/mvp1_gap_list.md`
- `docs/audit/mvp1_final_acceptance_report.md`

Требования к аудиту:
- разложить MVP1 ТЗ на атомарные требования;
- назначить каждому requirement ID, priority, evidence, status;
- не ставить PASS без доказательств;
- провести реальный gap analysis;
- зафиксировать blockers, major gaps, minor gaps;
- вынести честное решение: `ACCEPTED`, `ACCEPTED_WITH_GAPS` или `REJECTED`.

## Этап 2. Сначала закрыть Blocker и High gaps MVP1
До расширения функциональности MVP2:
- исправь все Blocker gaps;
- исправь все High / Major gaps, которые мешают продукту быть рабочим;
- особенно закрой:
  - board / pan / zoom
  - screen containment
  - parent-child consistency
  - import/export `.drawio`
  - validation
  - undo/redo
  - save/load JSON
  - inspector
  - layers/tree

Если аудит показывает, что что-то из MVP1 уже хорошо сделано, не ломай это, а используй как базу.

## Этап 3. Реализовать MVP2
После закрытия Blocker/High gaps реализуй MVP2 по `technical_spec_mobile_mockup_editor_mvp2.md`.

Минимально нужно довести продукт до состояния:
- удобная доска с pan/zoom/grid/snap;
- screen + lane;
- строгая иерархия parent-child;
- inspector v2;
- layers/tree с lock/hide/order;
- multi-select;
- align/distribute;
- keyboard shortcuts;
- clipboard / duplicate;
- templates/presets;
- расширенный набор mobile-компонентов;
- улучшенный import/export draw.io;
- validation summary;
- debug/json/xml tools;
- docs/tests/reports.

## Этап 4. Документация MVP2
Создай папку:
`docs/mvp2/`

И обязательно положи туда:
- `docs/mvp2/architecture.md`
- `docs/mvp2/element-catalog-v2.md`
- `docs/mvp2/design-tokens.md`
- `docs/mvp2/xml-mapping-v2.md`
- `docs/mvp2/manual-qa-v2.md`
- `docs/mvp2/release-notes.md`
- `docs/mvp2/final-acceptance-report.md`

## Этап 5. Тесты
Добавь и/или обнови:
- unit tests;
- integration tests;
- e2e tests;
- round-trip tests;
- visual regression baselines, если проект это уже позволяет сделать без перегруза.

Особенно проверь:
- drawio import/export;
- geometry conversion;
- reparent;
- clamp to parent;
- token resolution;
- composite components;
- selection/history consistency.

# Инженерные ограничения

1. Не делай клон draw.io.
2. Не используй raw draw.io XML как primary editing model.
3. Основа должна быть JSON-first.
4. Все unsupported import cases должны попадать в fallback/report, а не silently теряться.
5. Код должен быть clean, modular, strict TypeScript.
6. Не делай giant god-files.
7. Не плодить мусорные временные файлы.
8. Не останавливаться на документации — нужен реальный working product.

# Что считать конечным результатом

Нужно выдать:
1. Реально работающий проект.
2. Полный комплект audit docs для MVP1.
3. Полный комплект docs для MVP2.
4. Исправленные gaps MVP1.
5. Реализованный MVP2.
6. Финальный `docs/mvp2/final-acceptance-report.md`, где честно зафиксировано:
   - что сделано;
   - что не сделано;
   - что осталось ограничением;
   - почему продукт можно считать MVP2.

# Стиль исполнения

- думай как архитектор, но выдавай код;
- оценивай себя жёстко;
- не маскируй недоделки красивыми словами;
- сначала верифицируй, потом расширяй;
- делай устойчивые решения.

Начинай с Этапа 1: аудит MVP1.
