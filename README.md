# ArrayToolbox
Collection of frequently useful array algorithms, mostly for use with `Array.prototype.filter` and `Array.prototype.reduce`.

## Core
#### intersection
```JavaScript
ArrayToolbox.Core.intersection([1, 2, 1, 3], [1, 1, 1]);
// Returns `[1, 1]`.
```
#### modalValues
```JavaScript
ArrayToolbox.Core.modalValues([2, 1, 1, 3, 2]);
// Returns `[2, 1]`.
```

## Filter
#### unique
```JavaScript
[2, 1, 1, 3, 2].filter( ArrayToolbox.Filter.unique());
// Returns `[1, 3, 2]`.
```

## Reduce (Accumulate)
#### defaultIfEmpty
```JavaScript
[]
	.reduce( ArrayToolbox.Reduce.defaultIfEmpty(), [5])
	.reduce( ArrayToolbox.Reduce.firstOrDefaultTo(), null );
// Returns `5`, not `null`.
```
#### findAllIndexes
```JavaScript
[2, 1, 1, 3, 2].reduce( ArrayToolbox.Reduce.findAllIndexes( 2 ), []);
// Returns `[0, 4]`.
```
#### firstOrDefaultTo
```JavaScript
// Get minimum value of an array of objects.
let collator_comparator = function( left, right )
	{return( this.compare( left.value, right.value ));}
	.bind( new Intl.Collator([], {"numeric":true}));
let array =
[
	{"value":5},
	{"value":3},
	{"value":4}
];
array
	.sort( collator_comparator )
	.reduce( ArrayToolbox.Reduce.firstOrDefaultTo(), null );
// Returns `{"value":3}`.
```
#### lastOrDefaultTo
```JavaScript
// Get maximum value of an array of objects.
let collator_comparator = function( left, right )
	{return( this.compare( left.value, right.value ));}
	.bind( new Intl.Collator([], {"numeric":true}));
let array =
[
	{"value":5},
	{"value":3},
	{"value":4}
];
array
	.sort( collator_comparator )
	.reduce( ArrayToolbox.Reduce.lastOrDefaultTo(), null );
// Returns `{"value":5}`.
```
#### singleOrDefaultTo
```JavaScript
// Assert array is empty or contains only one element.
let array =
[
	{"value":5},
	{"value":3},
	{"value":4}
];
array
	.filter( function( each, n, every )
	{return( each.value > 3 );})
	.reduce( ArrayToolbox.Reduce.singleOrDefaultTo(), null );
// Throws `RangeError: 'array' should be of length 0 or 1.`.
```
