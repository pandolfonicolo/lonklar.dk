# Repository design decisions

- Preserve the shared Rientro icon family: `lk`, Nordic blue `#5b7a9e`, ivory `#eeece5`, outlined glyphs and the common curved recess.
- Read `brand/README.md` before changing icons. The lk monogram has an approved optical correction; do not center it again using font metrics or bounding boxes alone.
- The header, favicon and Apple touch icon must use the same generated mark. Run `npm run icons:check` from `frontend` after syncing.
- Preserve the existing interface colors and salary calculations when changing branding. Keep credentials and feedback data out of Git.
- Keep freshness dates consistent through `/api/meta`. Update `RULES_VERIFIED_ON` in `api/data.py` only after checking the official tax/SU sources; a UI release does not count as a new rules verification. Production sets `APP_UPDATED_AT` from the published Git revision automatically.
