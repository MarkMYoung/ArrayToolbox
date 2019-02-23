'use strict';
/**
 * @description Collection of frequently useful array algorithms, mostly for 
 *	use with `Array.prototype.filter` and `Array.prototype.reduce`.
 * @version 2.0.0
 * @author Mark M. Young
 * 
 * @callback ComparatorCallback
 * @param {string} left - The left-hand value to compare.
 * @param {string} right - The right-hand value to compare.
 *
 * @callback SerializerCallback
 * @param {*} value - The value to convert to a string.
 */
const ArrayToolbox =
{
	'Core':
	{
		/**
		 * Finds the intersection of two arrays.
		 * @param {Array} leftArray - Array of elements to be passed as the left-hand element to the comparator.
		 * @param {Array} rightArray - Array of elements to be passed as the right-hand element to the comparator.
		 * @param {ComparatorCallback} [item_comparator=(new Intl.Collator()).compare] - Function returning a number 
		 *	less than, equal to, or greater than 0 to indicate their comparison.
		 * @returns {Array} Array of elements found in both arrays, maintaining element multiplicity.
		 * @throws {TypeError} when `leftArray` is not an Array.
		 * @throws {TypeError} when `rightArray` is not an Array.
		 * @throws {TypeError} when `item_comparator` is not a function.
		 * @throws {TypeError} when `item_comparator` does not return a number.
		 * @example
		 *	ArrayToolbox.Core.intersection([1, 2, 1, 3], [1, 1, 1]);
		 *	// Returns `[1, 1]`.
		 */
		'intersection':function( leftArray, rightArray, item_comparator = (new Intl.Collator()).compare )
		{
			if( !Array.isArray( leftArray ))
			{throw( new TypeError( "'leftArray' must be an array." ));}
			else if( !Array.isArray( rightArray ))
			{throw( new TypeError( "'rightArray' must be an array." ));}
			else if( typeof( item_comparator ) !== 'function' )
			{throw( new TypeError( "'item_comparator' must be a function." ));}
			// There must be a more efficient way to do this.
			function notInOther( leftItem, l, leftList )
			{
				let found = this.some( function( rightItem, r, rightList )
				{
					let comparison = item_comparator( leftItem, rightItem );
					if( typeof( comparison ) !== 'number' )
					{throw( new TypeError( "'item_comparator' did not return a number (for example, -1, 0, or 1)." ));}
					return( comparison == 0 );
				}, this );
				return( found );
			}
			let leftNotInRight = leftArray.filter( notInOther, rightArray );
			let rightNotInLeft = rightArray.filter( notInOther, leftArray );
			let is_shorter_than = leftNotInRight.length < rightNotInLeft.length;
			let intersectionArray = ((is_shorter_than)?(leftNotInRight):(rightNotInLeft))
				.filter( 
					notInOther, 
					((is_shorter_than)?(rightNotInLeft):(leftNotInRight))
				);
			return( intersectionArray );
		},
		/**
		 * Finds the modal elements of an array.  In some cases, calculating 
		 *	this using `filter` or `reduce` can be too expensive so this is 
		 *	not defined as a filter or accumulator.
		 * @param {Array} array - Array of values to evaluate.
		 * @param {SerializerCallback} [item_serializer=JSON.stringify] - Function returning a string 
		 *	uniquely identifying the value.
		 * @returns {Array} Array of elements appearing the most often (or tied for the most).
		 * @throws {TypeError} when `array` is not an Array.
		 * @throws {TypeError} when `item_seralizer` is not a function.
		 * @throws {TypeError} when `item_seralizer` does not return a string.
		 * @example
		 *	ArrayToolbox.Core.modalValues([2, 1, 1, 3, 2]);
		 *	// Returns `[2, 1]`.
		 */
		//TODO change this to use an 'item_comparator' keeping track of the count of times the comparison equals zero?
		'modalValues':function( array, item_serializer = JSON.stringify )
		{
			if( !(array instanceof Array))
			{throw( new TypeError( "'array' should be an Array." ));}
			else if( typeof( item_serializer ) !== 'function' )
			{throw( new TypeError( "'item_serializer' must be a function." ));}
			let modals = [];
			let length = array.length;
			// Use Math.floor + 1, instead of Math.ceil, to get the majority count
			//	(in case the array is exactly half one value and half another).
			let majority = Math.floor( length / 2 ) + 1;
			let counts = {};
			let count_max = 0;
			// `forEach` or `reduce` is much preferred, 
			//	but only a for-loop can make use of 'break'.
			for( let i = 0; i < length; ++i )
			{
				// Just in case 'toString' would produce something useless.
				let key = item_serializer( array[ i ]);
				if( typeof( key ) !== 'string' )
				{throw( new TypeError( "'item_serializer' did not return a string." ));}
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
	'Filter':
	{
		/**
		 * Find the unique elements of an array.  If the `item_comparator` 
		 *	returns a comparison of `0`, the last (or rightmost) element is 
		 *	kept (a.k.a last one wins).  O(n*log(n))
		 * @param {ComparatorCallback} [item_comparator=(new Intl.Collator()).compare] - Function returning a number 
		 *	less than, equal to, or greater than 0 to indicate their comparison.
		 * @throws {ReferenceError} when passed directly without being called.
		 * @throws {TypeError} when `item_comparator` is not a function.
		 * @returns {Array} Array of unique elements.
		 * @example
		 *	[2, 1, 1, 3, 2].filter( ArrayToolbox.Filter.unique());
		 *	// Returns `[1, 3, 2]`.
		 */
		'unique':function( item_comparator = (new Intl.Collator()).compare )
		{
			if( arguments.length == 3 )
			{throw( new ReferenceError( "This function must be called to generate the filter." ));}
			else if( typeof( item_comparator ) !== 'function' )
			{throw( new TypeError( "'item_comparator' must be a function." ));}
			return( function unique_filter( each, n, every )
			{
				let higher_index = -1;
				// Not using `Array.prototype.slice` because it would deep-copy 
				//	the array, which might be large.
				for( let o = n + 1, len = every.length; o < len; ++o )
				{
					let comparison = item_comparator( each, every[ o ]);
					if( typeof( comparison ) !== 'number' )
					{throw( new TypeError( "'item_comparator' did not return a number (for example, -1, 0, or 1)." ));}
					if( comparison == 0 )
					{
						higher_index = o;
						break;
					}
				}
				return( higher_index <= n );
			});
		},
	},
	'Reduce':
	{
		/**
		 * `defaultIfEmpty` will NOT be called at all if the calling array is 
		 *	empty.  So, the default value needs to be an array (not a single 
		 *	element) to replace the empty one.
		 * @returns {Array} Array to replace the calling array if empty.
		 * @throws {ReferenceError} when passed directly without being called.
		 * @example
		 *	[]
		 *	.reduce( ArrayToolbox.Reduce.defaultIfEmpty(), [5])
		 *	.reduce( ArrayToolbox.Reduce.firstOrDefaultTo(), null );
		 *	// Returns `5`, not `null`.
		 */
		'defaultIfEmpty':function()
		{
			if( arguments.length == 4 )
			{throw( new ReferenceError( "This function must be called to generate the accumulator." ));}
			return( function defaultIfEmpty_accumulator( result, each, n, every )
			{return( every );});
		},
		/**
		 * Like `findIndex` except it returns all matching indexes.
		 * @param {*} needle - Value to compare against each element.
		 * @param {ComparatorCallback} [item_comparator=(new Intl.Collator()).compare] - Function returning a number 
		 *	less than, equal to, or greater than 0 to indicate their comparison.
		 * @returns {Array} Array of (integer) indexes where `needle` was found.
		 * @throws {ReferenceError} when passed directly without being called.
		 * @throws {TypeError} when `item_comparator` is not a function.
		 * @example
		 *	[2, 1, 1, 3, 2].reduce( ArrayToolbox.Reduce.findAllIndexes( 2 ), []);
		 *	// Returns `[0, 4]`.
		 */
		'findAllIndexes':function( needle, item_comparator = (new Intl.Collator()).compare )
		{
			if( arguments.length == 4 )
			{throw( new ReferenceError( "This function must be called to generate the accumulator." ));}
			else if( typeof( item_comparator ) !== 'function' )
			{throw( new TypeError( "'item_comparator' must be a function." ));}
			return( function allIndexesOf_accumulator( result, each, n, every )
			{
				if( !(result instanceof Array))
				{
					let previous = result;
					result = [];
					// Yet another accommodation for `reduce` not always starting at 0.
					if( n == 0 || n == every.length - 1 )
					{
						let comparison = item_comparator( each, previous );
						if( typeof( comparison ) !== 'number' )
						{throw( new TypeError( "'item_comparator' did not return a number (for example, -1, 0, or 1)." ));}
						if( comparison == 0 )
						{result.push( n );}
					}
				}
				let comparison = item_comparator( each, needle );
				if( typeof( comparison ) !== 'number' )
				{throw( new TypeError( "'item_comparator' did not return a number (for example, -1, 0, or 1)." ));}
				if( comparison == 0 )
				{result.push( n );}
				return( result );
			});
		},
		/**
		 * Pass returned accumulator to `Array.prototype.reduce` to get the 
		 *	first element of the array or the default value.
		 * @returns {*} The first element of the array or the default value.  If 
		 *	the accumulator is passed to `reduceRight`, the last element of 
		 *	the array or default value will be returned instead.
		 * @throws {TypeError} when reducing an empty array with no initial value.
		 * @throws {ReferenceError} when passed directly without being called.
		 * @example <caption>Get minimum value of an array of objects.</caption>
		 *	let collator_comparator = function( left, right )
		 *		{return( this.compare( left.value, right.value ));}
		 *		.bind( new Intl.Collator([], {"numeric":true}));
		 *	let array =
		 *	[
		 *		{"value":5},
		 *		{"value":3},
		 *		{"value":4}
		 *	];
		 *	array
		 *		.sort( collator_comparator )
		 *		.reduce( ArrayToolbox.Reduce.firstOrDefaultTo(), null );
		 *	// Returns `{"value":3}`.
		 */
		'firstOrDefaultTo':function()
		{
			if( arguments.length == 4 )
			{throw( new ReferenceError( "This function must be called to generate the accumulator." ));}
			return( function firstOrDefaultTo_accumulator( result, each, n, array )
			{return((n === 0)?(each):(result));});
		},
		/**
		 * Same as `firstOrDefaultTo` except it returns the last element.
		 * @returns {*} The last element of the array or the default value.  If 
		 *	the accumulator is passed to `reduceRight`, the first element of 
		 *	the array or default value will be returned instead.
		 * @throws {ReferenceError} when passed directly without being called.
		 */
		'lastOrDefaultTo':function()
		{
			if( arguments.length == 4 )
			{throw( new ReferenceError( "This function must be called to generate the accumulator." ));}
			return( function lastOrDefaultTo_accumulator( result, each, n, array )
			{return((n === array.length - 1)?(each):(result));});
		},
		/**
		 * Same as `firstOrDefaultTo` except it asserts that the array is empty 
		 *	or contains only one element.
		 * @returns {*} The only element of the array or the default value.  The 
		 *	same is true if the accumulator is passed to `reduceRight` instead.
		 * @throws {ReferenceError} when passed directly without being called.
		 * @throws {RangeError} when array has length greater than 1.
		 */
		'singleOrDefaultTo':function()
		{
			if( arguments.length == 4 )
			{throw( new ReferenceError( "This function must be called to generate the accumulator." ));}
			return( function singleOrDefaultTo_accumulator( result, each, n, array )
			{
				if( array.length > 1 )
				{throw( new RangeError( "'array' should be of length 0 or 1." ));}
				return((n === 0)?(each):(result));
			});
		},
	},
};
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
if( typeof( module ) !== 'undefined' ){module.exports = ArrayToolbox;}
