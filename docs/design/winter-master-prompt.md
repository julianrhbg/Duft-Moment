# DAZWISCHEN — November warmth: implementation brief

Written before implementation, 13 November 2026. This is the working instruction for the current design pass, not new visitor-facing copy. Apply this brief directly after the visual study is available. The existing application remains the product: a very short German fragrance quiz, followed by one recommendation. Its usefulness, simplicity, and trustworthy stock handling are more important than any decorative element.

## Purpose and emotional direction

Create the feeling of entering a quiet, warm room while the world outside is becoming colder. The owner describes this as cold warmth: autumn moving towards winter, amber light next to slate sky, soft cream beside restrained cool shadows. Translate that contrast into the whole interface, rather than adding a seasonal banner. The design should feel inhabited and considered, without looking like a holiday template, an online shop, or a promotional landing page. Let the visitor notice a change in atmosphere immediately, without having to read anything about it.

Use the visual design study as a composition and colour reference, not as a screenshot to paste over functioning controls. A generated interface illustration is not production HTML and does not prove usability. Preserve actual accessible buttons, real text, genuine dialogs, and the existing keyboard interactions. The final interface must be built from the existing lightweight application, with no new animation framework or component library.

## Evidence and interpretation

The design research found a useful material vocabulary in Gira's winter lighting article: cream, chocolate, fir green, dusk blue, wood, and smoked glass. Treat these as design references, not scientific evidence that particular colours guarantee relaxation. The intended emotional effect is subjective. Use a restrained combination of warm neutral foundations and a small cool counterpoint. Do not reproduce a third party's photography, branding, or copyrighted interface.

MDN's perceived-performance guidance supports showing useful content early, avoiding layout jumps, and not forcing users to wait for unrelated resources. Apply that principle to the opening screen. An attractive loading animation is not a substitute for a usable first question. Removing a sentence does not itself make a server faster, so describe the resulting change accurately.

## Colour and hierarchy

In light mode, move the surface towards pale oatmeal, limestone, and softly lit paper. Text should be a deep warm charcoal rather than saturated green. Use muted brown for secondary information and a restrained toasted amber accent for interaction. Introduce a cool grey-blue undertone only in the atmospheric area, with enough restraint that the interface remains warm. Avoid a broad orange wash, highly saturated gradients, fake grain overlays, and busy background textures.

In dark mode, use deep walnut charcoal rather than pure black. Main text should be warm ivory with clearly readable muted text. Borders should remain visible without forming bright boxes. The atmospheric element can feel like a distant warm light against a blue-grey exterior. Keep both schemes intentionally designed, including dialogs, inputs, buttons, selection indicators, error messages, and focus rings. Respect system colour changes automatically. Never force the entire application into permanent dark mode.

## Atmospheric composition

Retain the existing seasonal scene system and local date logic. Its compact original illustrations already avoid ongoing network costs. Refine the circular landscape treatment into a quiet window-like object with less plastic shine and less metallic ornament. Show more of the landscape and use controlled warm and cool light around it. A small rim and a soft grounding shadow are sufficient. Do not add snow particles, animated flames, a simulated fireplace, exaggerated smoke, floating ornaments, or additional explanatory text.

The circular composition must not collide with the question, options, or result. On phones, the heading and controls take priority; on desktop, the atmosphere may occupy the adjacent column. Maintain the current responsive positioning unless real visual inspection shows a problem. Do not enlarge artwork merely to create the appearance of a redesign. Preserve generous whitespace and the concise existing typography. Keep all primary choices comfortably tappable and maintain clear selection feedback.

## Opening and data loading

Remove the visible sentence saying that stock is loading. Instead, deliver the first question and ordinary activity choices in the initial document. These are navigation choices, not recommendations, and can be shown without stock data. Attach their interactions as soon as the application module is ready. Load configuration concurrently and retain the selected activity if the visitor chooses before the request finishes. Do not use a fake default stock list, cached visitor answers, or invented availability to generate a result.

If the configuration request fails, show the existing honest retry state. Never trap the visitor behind a blank layer. Avoid unnecessary duplicate configuration requests during startup by sharing an in-flight request where appropriate. Protect against late initialization overwriting an activity selection, opening a dialog unexpectedly, or resetting an already advanced quiz. Keep Home, browser navigation, administration entry, and source dialogs working. Respect the configured title and custom question once the real configuration arrives.

## Scope and preservation

Do not change recipe scoring, dose limits, oil approvals, administration credentials, sessions, saved recipes, custom products, or persistent settings for this design pass. Frankincense remains marked empty. The new-oils announcement stays removed. The archived intro and demonstration remain unlinked. Do not introduce tracking, a visitor login, an extra question, a new explanatory card, or a decorative paragraph. The same production URL and QR code must continue to work.

Inspect the current supported publishing and GitHub capabilities. Preserve the Worker adapter and R2 storage instead of substituting the historical Node server. Synchronizing source with GitHub is valuable for maintenance but does not automatically improve visual quality. Do not claim automatic continuous deployment unless it has actually been configured and verified through supported capabilities. Push only relevant source changes with a current-head check.

## Verification and completion

Run focused checks for configuration loading, early activity choice, error recovery, and the existing quiz and hosting protections. Build the deployment artifact and check its validity. Inspect the actual browser output at phone width in light and dark presentations, including a quiz transition and a return Home. Assess readability, spacing, contrast, and whether the warm-cool balance is visible without becoming decoration-heavy. Treat screenshots as visual evidence, not as proof of network performance.

Publish using the existing authorized hosting route and preserve the current public audience. Report the actual deployment outcome, the unchanged link, the main visual adjustments, and any testing limitations. Provide this prompt as a project document so the design intent remains reviewable. Do not claim to have searched every website or achieved an objectively perfect design. The final result should be quieter, warmer, and immediately usable, with less visible waiting and exactly the same core purpose.

## Research links

- https://www.gira.com/en/en/g-pulse-magazine/interior-ideas/winter-trends
- https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/Perceived_performance
- https://help.openai.com/en/articles/20001339-creating-and-using-chatgpt-sites
