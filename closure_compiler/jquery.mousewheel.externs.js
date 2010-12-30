/*
 * Copyright 2010 The Closure Compiler Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
* @fileoverview Externs for jQuery 1.4.4.
* Note that some functions use different return types depending on the number
* of parameters passed in. In these cases, you may need to annotate the type
* of the result in your code, so the JSCompiler understands which type you're
* expecting. For example:
*    <code>var elt = /** @type {Element} * / (foo.get(0));</code>
* @see http://api.jquery.com/
* @externs
*/

/** @typedef {(Window|Document|Element|Array.<Element>|string|jQueryObject)} */
var jQuerySelector;

/**
 * @param {(jQuerySelector|Element|Array|Object|string|function())=} arg1
 * @param {(Element|jQueryObject|Document|Object)=} arg2
 * @return {jQueryObject}
 */
function $(arg1, arg2) {};

/**
 * @param {(jQuerySelector|Element|Array|Object|string|function())=} arg1
 * @param {(Element|jQueryObject|Document|Object)=} arg2
 * @return {jQueryObject}
 */
function jQuery(arg1, arg2) {};

/**
 * @constructor
 * @param {string} eventType
 */
jQuery.event = function(eventType) {};

/**
 * @constructor
 * @private
 */
function jQueryObject() { };

/**
 * @param {(function(jQuery.event)|Object)=} arg1
 * @param {function(jQuery.event)=} handler
 * @return {jQueryObject}
 */
jQueryObject.prototype.mousewheel = function(arg1, handler) {};
