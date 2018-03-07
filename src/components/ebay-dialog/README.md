# ebay-dialog

```marko
<ebay-dialog open aria-label-close="Close Dialog">
  <h1>Hello World</h1>
</ebay-dialog>
```

## Attributes
Name | Type | Stateful | Description
--- | --- | --- | ---
`class` | String | No | A custom class.
`type` | String | No | Can be "full" / "fill" / "left" / "right".
`open` | Boolean | Yes | Whether dialog is open.
`aria-label-close` | String | No | Aria label for close button and mask.

## Events
Event | Data | Description
--- | --- | ---
`dialog-show` |  | dialog opened
`dialog-close` |  | dialog closed
