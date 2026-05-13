# Edge Marketplace Hub Architecture

## System Architecture

Edge Marketplace Hub is built as a multi-tenant React application that utilizes Puck as its primary visual editing engine.

1.  **Intake Application:** A standalone form workflow that captures business requirements.
2.  **AI Onboarding Mapper:** An intelligent translation layer that maps intake strings (like "We sell luxury flowers") to a structured `EdgeRootProps` object and a `TemplateFamily`.
3.  **Template Manifest Engine:** Enforces layout constraints. A user in `food-catering` cannot accidentally add an artisan product grid.
4.  **Editor (Puck):** A highly constrained instance of Puck Editor. It receives a filtered list of components from the `Puck Config Factory`.
5.  **Validation Plugin Layer:** Intercepts the "Publish" action and runs programmatic checks against the generated JSON tree and Root Props.
6.  **Persistence Layer:** Saves the validated `Data` object back to Supabase.
7.  **Render Engine:** Uses the same React components from the Editor to hydrate the live site.

## Folder Structure

```
/src
  /components
    /puck               # Puck Editor integration and config
      PuckEditor.tsx    # The main editor wrapper
      config.tsx        # The Puck Config Factory
      /blocks           # The safe, editable Safe React Components
        HeroSection.tsx
        OfferSection.tsx
        ...
    /ui                 # Shared UI components (buttons, inputs)
  /lib
    types.ts            # Core TypeScript interfaces
    section-manifest.ts # Section definitions and template combinations
    validation.ts       # Validation Plugin architecture
    ai-mapper.ts        # AI logic to convert intake to Puck payload
  /pages
    Onboarding.tsx      # The intake form
    EditorPage.tsx      # The main builder view
  App.tsx               # Routing
```

## Recommended Implementation Order

1.  **Types & Constants:** Establish the strongly typed `CommerceMode`, `TemplateFamily`, `EdgeRootProps`, and the `SECTION_INVENTORY`. *(Completed)*
2.  **Mocked AI Mapper:** Create the translation function. *(Completed)*
3.  **Section React Components:** Build strongly typed React components for the editor. *(In Progress)*
4.  **Puck Config Factory:** Build the dynamic Puck config that respects the manifest. *(In Progress)*
5.  **Validation Engine:** Implement the publish gatekeeper. *(Completed)*
6.  **Onboarding UI:** Build the React Hook Form intake workflow. *(In Progress)*
7.  **Editor UI:** Integrate Puck and hook up the validation engine. *(In Progress)*
8.  **Database Connection:** Link the mock persistence to the Supabase schema. *(Pending)*
