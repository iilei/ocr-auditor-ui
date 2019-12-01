# hOCR View

A Canvas-renderer for hOCR

In Storybook, check out the options object under the _knobs_ section.

MouseDown and MouseUp Events are enriched with a payload that gives full access to the context (e.g which word / line / paragraph ... was clicked on)

## Basic Usage

Example Usage of `HocrView` with a `DocumentLoader`

```
<HocrView ...>
    <DocumentLoader url="./phototest.json" page={1} />
</HocrView>
```

## Getting a Snapshot for words in Range

Example Usage of `HocrView` to obtain a snapshot of a specific range

```
<HocrView ...>
    <DocumentLoader url="./phototest.json" page={1} />
    <Snapshot range={value} onReady={onReady} />
</HocrView>
```

When taking Snapshot it should be avoided to hide inner / outer word boundary boxes. Recommendation;
use the [defaults](src/plugins/_constants.ts) just for the instant the snapshot is taken and reset
it afterwards.
