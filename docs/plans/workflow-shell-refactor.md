# Workflow-first Editor Shell Refactor Plan

> For Hermes: execute in small commits with verification after each step.

Goal
- Convert the editor from dual-control UI (custom shell + full Puck chrome) into a workflow-first shell where Puck remains the editing substrate and lifecycle actions are explicit.

Architecture
- Keep Puck as the canonical editing engine.
- Reduce custom shell to a thin workflow/status bar + lightweight page nav.
- Add deterministic funnel actions: Content -> Inventory -> Checkout -> Launch -> Live.

Tech stack
- React + TypeScript (src/pages/EditorPage.tsx)
- Existing router/navigation patterns in the app
- Existing publish callback contract (onPublish)

---

## Task 1: Create shared workflow model + status semantics

Objective
- Add a typed workflow step model to avoid hardcoded button sprawl.

Files
- Create: src/lib/workflowSteps.ts
- Modify: src/pages/EditorPage.tsx

Steps
1) Create src/lib/workflowSteps.ts with:
- Step IDs: content, inventory, checkout, launch, live
- Labels + optional helper text
- Utility: getNextStep(current)
2) Import and render steps in EditorPage top bar (static, non-click first).
3) Verify build locally.

Verification
- npm run lint
- Editor renders stepper labels in top bar.

Commit
- feat(editor): add workflow step model and initial stepper scaffold

---

## Task 2: Remove visual noise and duplicate control authority

Objective
- De-emphasize decorative shell and make Puck controls primary.

Files
- Modify: src/pages/EditorPage.tsx

Steps
1) Remove pulse/attention affordances around assistant trigger.
2) Reduce excessive shadows/rounded pill styling in page nav/header controls.
3) Keep page nav but simplify delete affordance to always-visible icon button for non-home pages.
4) Keep Puck sidebars/header active; avoid adding duplicate editor controls in custom shell.

Verification
- Manual: no hover-only destructive control
- Manual: less decorative chrome, same functional behavior

Commit
- refactor(editor): simplify shell styling and remove duplicate visual authority

---

## Task 3: Add deterministic workflow actions in header

Objective
- Make funnel transitions explicit and always reachable.

Files
- Modify: src/pages/EditorPage.tsx
- Modify/create router/navigation helper file(s) as needed (based on existing routing patterns)

Steps
1) Replace current right-side header controls with action group:
- Save Draft (local editor state; no publish)
- Preview
- Inventory
- Checkout
- Launch
- Live Site
2) Wire each action to deterministic route transitions using existing siteId/project context.
3) Keep Publish button but rename to Publish Content (or equivalent) to clarify scope.

Verification
- Each action navigates or gives explicit, actionable error if required context missing.

Commit
- feat(editor): add deterministic workflow action bar for funnel transitions

---

## Task 4: Publish-success transition panel (no dead ends)

Objective
- After publish, present next-step CTAs explicitly.

Files
- Modify: src/pages/EditorPage.tsx

Steps
1) On successful onPublish callback, show success panel/toast with hard links:
- Open Inventory
- Open Checkout
- Open Live Storefront
2) Persist last publish timestamp/status in component state for operator confidence.

Verification
- Publish success always exposes next-step links.
- No ambiguous success state.

Commit
- feat(editor): add publish success next-step panel

---

## Task 5: Accessibility + interaction hardening

Objective
- Remove hover-only logic and strengthen keyboard/touch behavior.

Files
- Modify: src/pages/EditorPage.tsx

Steps
1) Ensure icon-only buttons have aria-label/title.
2) Ensure destructive actions are keyboard reachable and visible.
3) Replace prompt/alert/confirm usage for add/delete pages with controlled UI/dialog if feasible in this pass; if not, add follow-up TODOs with clear file refs.

Verification
- Keyboard tab flow reaches add/delete/workflow actions.
- No required action hidden behind hover-only state.

Commit
- fix(editor-a11y): make workflow and page actions explicit and keyboard accessible

---

## Task 6: Documentation + rollout notes

Objective
- Capture architecture intent and future extension points.

Files
- Create: docs/editor-workflow-shell.md

Steps
1) Document boundary:
- Puck owns editing substrate.
- Shell owns orchestration funnel.
2) Document required route contracts for each workflow action.
3) Add "Known Failure Signatures" section for workflow dead-ends and missing-context navigation failures.

Verification
- Doc references concrete routes/components.

Commit
- docs(editor): define workflow-shell ownership model and failure signatures

---

Execution notes
- Keep commits small and reversible.
- After Task 3 and Task 4, manually validate full funnel:
  editor -> inventory -> checkout -> launch -> live
- If route context is missing (siteId/projectId), fail loudly with deterministic guidance, never silent no-op.
