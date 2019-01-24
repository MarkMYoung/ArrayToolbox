'use strict';
const ArrayToolbox =
{
	'Core':
	{
		// Finding the modal value can be too expensive to use Array.filter or 
		//	Array.reduce in some cases, but it can be used on Arrays known to be 
		//	relatively small.
		'modalValues':function( array )
		{
			if( !(array instanceof Array))
			{throw( new TypeError( "'array' should be an Array." ));}
			var modals = [];
			var length = array.length;
			// Use Math.floor + 1, instead of Math.ceil, to get the majority count
			//	(in case the array is exactly half one value and half another).
			var majority = Math.floor( length / 2 ) + 1;
			var counts = {};
			var count_max = 0;
			// Array.forEach or Array.reduce is much preferred, 
			//	but only a for-loop can make use of 'break'.
			for( var i = 0; i < length; ++i )
			{
				// Just in case 'toString' would produce something useless.
				var key = JSON.stringify( array[ i ]);
				if( !(key in counts))
				{counts[ key ] = {'count':0, 'index':i, 'value':array[ i ]};}
				// Store array values separately to prevent undesired casting to string 
				//	(which would happen regardless of using 'JSON.stringify').
				++counts[ key ].count;
				// Short-circuit if possible.
				if( counts[ key ].count >= majority )
				{
					modals.push( counts[ key ].value );
					break;// Short-circuit.
				}
				else if( counts[ key ].count > count_max )
				{count_max = counts[ key ].count;}
			}
			// Was not short-circuited.
			if( modals.length === 0 )
			{
				modals = Object.keys( counts )
					.filter( function keys_with_count_max( key, k, keys )
					{return( counts[ key ].count >= count_max );})
					.sort( function by_original_position( key_a, key_b )
					{return((counts[ key_a ].index < counts[ key_b ].index)?(-1):(+1));})
					.map( function original_value_of_keys( key, k, keys )
					{return( counts[ key ].value );});
			}
			return( modals );
		},
	},
	'Reduce':
	{
		// Example: array.reduce( ArrayToolbox.Reduce.defaultIfEmpty, [5])
		'defaultIfEmpty':function( result, each, n, every )
		{
			// 'defaultIfEmpty' will NOT be called at all if the 'every' array is empty.  
			//	So, the default value needs to be an array (not a single value) to replace the empty one.
			return( every );
		},
		// Pass to Array.reduce to get 1) the first element or 2) whatever was passed 
		//	as the initial/default value to Array.reduce without having to check array 
		//	length.  However, Array.reduce requires an initial value for zero-length 
		//	arrays.  However, when an initial value is provided to Array.reduce, it 
		//	starts at i0 (instead of i1) and the first parameter passed to the 
		//	accumulator is the initial value (instead of array[ 0 ]).
		// Example: Get minimum value of an array.
		//	[5, 3, 4].sort().reduce( ArrayToolbox.Reduce.firstOrDefaultTo, Number.Nan )
		'firstOrDefaultTo':function( result, each, n, array )
		{return((n === 0)?(each):(result));},
		// Example: Get maximum value of an array.
		//	[5, 3, 4].sort().reduce( ArrayToolbox.Reduce.lastOrDefaultTo, Number.Nan )
		'lastOrDefaultTo':function( result, each, n, array )
		{return((n === array.length - 1)?(each):(result));},
		// Same as 'firstOrDefaultTo' except it asserts that the array is empty 
		//	or contains only one element.
		'singleOrDefaultTo':function( result, each, n, array )
		{
			if( array.length > 1 )
			{throw( new RangeError( "'array' should be of length 0 or 1." ));}
			return((n === 0)?(each):(result));
		},
	},
};
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
(module || {'exports':{}}).exports = ArrayToolbox;
