// This allows subclassing with access to the methods of the superclass:
//
//	   function A() {
//		   console.log('A.constructor()');
//	   }
//
//	   A.prototype.foo = function(arg) {
//		   console.log('A.foo(' + arg + ')');
//	   }
//
//	   A.prototype.bar = function(arg) {
//		   console.log('A.bar(' + arg + ')');
//	   }
//
//	   B.subclasses(A);
//	   function B() {
//		   A.prototype.constructor.call(this);
//		   console.log('B.constructor()');
//	   }
//
//	   B.prototype.foo = function(arg) {
//		   console.log('B.foo(' + arg + ')');
//		   A.prototype.foo.call(this, arg);
//	   }
//
//	   var a = new A();
//	   var b = new B();
//	   a.foo(1);
//	   a.bar(2);
//	   b.foo(3);
//	   b.bar(4);
//
// The above example will log this to the console:
//
//	   A.constructor()
//	   A.constructor()
//	   B.constructor()
//	   A.foo(1)
//	   A.bar(2)
//	   B.foo(3)
//	   A.foo(3)
//	   A.bar(4)
//
// BUT, in order to do this, this file and the superclass definition
// must come before the subclass definition.  This is currently
// enforced by using the #require directive at the top of the file:
//
//	 superclass.js:
//	   function Superclass() {
//	   }
//
//	 subclass.js:
//	   #require <class.js>
//	   #require <superclass.js>
//
//	   Subclass.subclasses(Superclass);
//	   function Subclass() {
//	   }
//
// One thing I was considering was setting:
//
//	   this.prototype.super = obj.prototype;
//
// when subclassing, but this doesn't work subclasses two or more
// levels deep, since this.super always refers to the superclass
// of the instance, not the superclass of the current function:
//
//	   function A(){}
//	   A.prototype.foo = function(){
//		   console.log('A.foo()');
//	   }
//
//	   B.subclasses(A);
//	   function B(){}
//	   B.prototype.foo = function(){
//		   console.log('B.foo()');
//		   this.super.foo.call(this);
//	   }
//
//	   C.subclasses(B);
//	   function C(){}
//	   C.prototype.foo = function(){
//		   console.log('C.foo()');
//		   this.super.foo.call(this);
//	   }
//
// The above code will enter an infinite loop because 'this' always refers
// to an instance of C, and 'this.super' always refers to an instance
// of B.  To fix this, always specify the superclass prototype instead:
//
//	   function A(){}
//	   A.prototype.foo = function(){
//		   console.log('A.foo()');
//	   }
//
//	   B.subclasses(A);
//	   function B(){}
//	   B.prototype.foo = function(){
//		   console.log('B.foo()');
//		   A.prototype.foo.call(this);
//	   }
//
//	   C.subclasses(B);
//	   function C(){}
//	   C.prototype.foo = function(){
//		   console.log('C.foo()');
//		   B.prototype.foo.call(this);
//	   }

Function.prototype.subclasses = function(obj) {
	$.extend(this.prototype, obj.prototype);
}
