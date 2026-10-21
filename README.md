# Device Class Finder

Answer a few plain questions and see which risk class (A, B, C or D) a medical device likely falls in under India's Medical Device Rules, 2017.

## Use it

- Web: https://falakpat3l.github.io/device-class/
- Android: download the APK from [Releases](https://github.com/falakpat3l/device-class/releases) (test build).

## What it does

- One page, no sign-up, nothing sent anywhere. Works offline.
- Shows the likely class, the reason, which licensing authority handles it, and every answer you gave.
- "Copy result" copies all of that as plain text, ready to paste into a note or email.
- Back (on the page, in the browser, or the phone's Back gesture) goes to the previous question.

## How it is built

- All questions and answers live in one list (`steps`) in `docs/index.html`, so a rule is easy to read or change.
- The Android app (`app/`) shows the same `docs/` page from inside the APK, with no internet permission.
- Build the APK from the Actions tab ("Build APK"), or push a tag like `v0.1.0-alpha`.

## Please note

Guidance only, not regulatory advice. The questions follow the risk-based rules in the First Schedule of the Medical Device Rules, 2017, which are based on the international GHTF model. Always check the official rules and CDSCO's published classification lists.

Made by [Falak Patel](https://falakpatel.com).
