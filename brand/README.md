# Shared Rientro icon family

Lonklar uses `lk`, Nordic blue `#5b7a9e`, ivory `#eeece5`, and the rounded shape with a curved upper-right recess. The header, favicon and Apple touch icon share one outlined mark.

The source of truth, generator, family palette and extension rules live in [nicolopandolfo.com/brand](https://github.com/pandolfonicolo/nicolopandolfo.com/tree/main/brand). With sibling checkouts, run `npm run icons:sync` there. Commit the synchronized assets, `brand/icon.json`, `scripts/check-brand-icons.mjs` and updated cache versions here.

The lk glyphs are centered on their painted horizontal bounds and moved upward optically to balance np and ps. Preserve those paths; do not re-type the monogram or realign it from its bounding box alone. Future family members may vary their color and central symbol while retaining the common shape and proportions.

Run `npm run icons:check` from `frontend`. Every frontend build, including the production Docker build, verifies file hashes, PNG dimensions and font-independent SVGs. Source PNGs are opaque squares; the operating system applies the Home Screen mask. The Apple touch icon is 180px, separate from the 32px browser favicon.
