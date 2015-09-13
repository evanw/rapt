'var a = b.unit();';
var a = b.unit();

'b.normalize();';
b.normalize();

'var a = b.neg();';
var a = b.neg();

'var a = b.flip();';
var a = b.flip();

'var a = b.length();';
var a = b.length();

'var a = b.lengthSquared();';
var a = b.lengthSquared();

'var a = b.add(c);';
var a = b.add(c);

'var a = b.sub(c);';
var a = b.sub(c);

'var a = b.mul(c);';
var a = b.mul(c);

'var a = b.div(c);';
var a = b.div(c);

'var a = b.minComponents(c);';
var a = b.minComponents(c);

'var a = b.maxComponents(c);';
var a = b.maxComponents(c);

'var a = b.dot(c);';
var a = b.dot(c);

'a.inplaceNeg();';
a.inplaceNeg();

'a.inplaceAdd(b);';
a.inplaceAdd(b);

'a.inplaceSub(b);';
a.inplaceSub(b);

'a.inplaceMul(b);';
a.inplaceMul(b);

'a.inplaceDiv(b);';
a.inplaceDiv(b);

'lerp(a, b, c);';
lerp(a, b, c);

'randInRange(a, b);';
randInRange(a, b);

'var a = b.sub(c).unit().neg().flip(); // should only have one new vector';
var a = b.sub(c).unit().neg().flip(); // should only have one new vector

'var a = b.sub(c).add(d).mul(2).div(3); // should only have one new vector';
var a = b.sub(c).add(d).mul(2).div(3); // should only have one new vector
