#!/usr/bin/python2.5
# modified from sexp.py, which can be found at http://code.google.com/p/pynarcissus/

import sys
import jsparser

################################################################################
# class Scope
################################################################################

# keeps track of generated local variables
class Scope:
	def __init__(self):
		self.vars = [[]]
		self.locals = [set()]

	# enter a new scope, forget about any local variables created before
	def push(self):
		self.vars.append([])
		self.locals.append(set())

	# returns the local variables allocated
	def pop(self):
		return sorted(list(self.locals.pop()), key=lambda x: int(x[1:]))

	# allocate a local variable
	def alloc(self):
		t = "_%d"
		i = 0
		while (t % i) in self.vars[-1]:
			i += 1
		var = t % i
		self.locals[-1].add(var)
		self.vars[-1].append(var)
		return var

	# free a local variable (to minimize the number used)
	def free(self, var):
		if var in self.vars[-1]:
			self.vars[-1].remove(var)
		self.last_freed_var = var

# global scope object, each SCRIPT node pushes one more level on this
scope = Scope()

# used to implement reuse of locals
result_var = None

# interesting to know how many new vector allocations were avoided
allocations_avoided = 0

################################################################################
# code generation functions
################################################################################

# if a node is just an identifier, don't bother making a local variable for it
def isid(n):
	return n.type == "IDENTIFIER" or n.type == "THIS" or n.type == "NUMBER"

# we can reuse temporaries created by inner computations
def isinline(n):
	if n.type != "CALL":
		return False
	if n[0].type == "DOT" and n[0][1].type == "IDENTIFIER":
		func = o(n[0][1])
		if len(n[1]) == 0 and func in unary_funcs:
			return True
		elif len(n[1]) == 1 and func in binary_funcs:
			return True
	elif n[0].type == "IDENTIFIER":
		func = o(n[0])
		if func in global_funcs:
			return True
	return False

NEED_TEMP = 1
NEED_RESULT = 2

def wrap_unary(flags, func, inplace=None):
	def convert(a):
		global result_var, allocations_avoided
		if inplace and isinline(a):
			allocations_avoided += 1
			r = unary_funcs[inplace](a)
			r.append(result_var)
			return r
		r = []
		va = o(a) if isid(a) else scope.alloc()
		vr = scope.alloc() if flags & NEED_RESULT else None
		vtemp = scope.alloc() if flags & NEED_TEMP else None
		if not isid(a):
			r.append("%s = %s" % (va, o(a)))
		if vr:
			r.append("%s = new Vector(0, 0)" % vr)
			r += (func(vr, va, vtemp) if vtemp else func(vr, va)) + [vr]
		else:
			r += func(va, vtemp) if vtemp else func(va)
		scope.free(va), scope.free(vr), scope.free(vtemp)
		result_var = vr if vr else va
		return r
	return convert

def wrap_binary(flags, func, inplace = None):
	def convert(a, b):
		global result_var, allocations_avoided
		if inplace and isinline(a):
			allocations_avoided += 1
			r = binary_funcs[inplace](a, b)
			r.append(result_var)
			return r
		r = []
		va = o(a) if isid(a) else scope.alloc()
		vb = o(b) if isid(b) else scope.alloc()
		vr = scope.alloc() if flags & NEED_RESULT else None
		vtemp = scope.alloc() if flags & NEED_TEMP else None
		if not isid(a):
			r.append("%s = %s" % (va, o(a)))
		if not isid(b):
			r.append("%s = %s" % (vb, o(b)))
		if vr:
			r.append("%s = new Vector(0, 0)" % vr)
			r += (func(vr, va, vb, vtemp) if vtemp else func(vr, va, vb)) + [vr]
		else:
			r += func(va, vb, vtemp) if vtemp else func(va, vb)
		scope.free(va), scope.free(vr), scope.free(vb), scope.free(vtemp)
		result_var = vr if vr else va
		return r
	return convert

def lerp(a, b, c):
	va = o(a) if isid(a) else scope.alloc()
	vb = o(b) if isid(b) else scope.alloc()
	vc = o(c) if isid(c) else scope.alloc()
	r = []
	if not isid(a): r.append("%s = %s" % (va, o(a)))
	if not isid(b): r.append("%s = %s" % (vb, o(b)))
	if not isid(c): r.append("%s = %s" % (vc, o(c)))
	r.append("%s + (%s - %s) * %s" % (va, vb, va, vc))
	scope.free(va), scope.free(vb), scope.free(vc)
	return r

def randInRange(a, b):
	va = o(a) if isid(a) else scope.alloc()
	vb = o(b) if isid(b) else scope.alloc()
	r = []
	if not isid(a): r.append("%s = %s" % (va, o(a)))
	if not isid(b): r.append("%s = %s" % (vb, o(b)))
	r.append("%s + (%s - %s) * Math.random()" % (va, vb, va))
	scope.free(va), scope.free(vb)
	return r

global_funcs = {
	"lerp": lerp,
	"randInRange": randInRange
}

unary_funcs = {
	"unit": wrap_unary(NEED_RESULT | NEED_TEMP, lambda r, a, length: [
		"%s = Math.sqrt(%s.x*%s.x + %s.y*%s.y)" % (length, a, a, a, a),
		"%s.x = %s.x / %s" % (r, a, length),
		"%s.y = %s.y / %s" % (r, a, length)
	], "normalize"),
	"normalize": wrap_unary(NEED_TEMP, lambda a, length: [
		"%s = Math.sqrt(%s.x*%s.x + %s.y*%s.y)" % (length, a, a, a, a),
		"%s.x /= %s" % (a, length),
		"%s.y /= %s" % (a, length)
	]),
	"neg": wrap_unary(NEED_RESULT, lambda r, a: [
		"%s.x = -%s.x" % (r, a),
		"%s.y = -%s.y" % (r, a)
	], "inplaceNeg"),
	"flip": wrap_unary(NEED_RESULT, lambda r, a: [
		"%s.x = %s.y" % (r, a),
		"%s.y = -%s.x" % (r, a)
	], "inplaceFlip"),
	"length": wrap_unary(0, lambda a: [
		"Math.sqrt(%s.x*%s.x + %s.y*%s.y)" % (a, a, a, a)
	]),
	"lengthSquared": wrap_unary(0, lambda a: [
		"%s.x*%s.x + %s.y*%s.y" % (a, a, a, a)
	]),
	"inplaceNeg": wrap_unary(0, lambda a: [
		"%s.x = -%s.x" % (a, a),
		"%s.y = -%s.y" % (a, a)
	]),
	"inplaceFlip": wrap_unary(NEED_TEMP, lambda a, temp: [
		"%s = %s.x" % (temp, a),
		"%s.x = %s.y" % (a, a),
		"%s.y = -%s" % (a, temp)
	]),
}

binary_funcs = {
	"add": wrap_binary(NEED_RESULT, lambda r, a, b: [
		"%s.x = %s.x + %s.x" % (r, a, b),
		"%s.y = %s.y + %s.y" % (r, a, b)
	], "inplaceAdd"),
	"sub": wrap_binary(NEED_RESULT, lambda r, a, b: [
		"%s.x = %s.x - %s.x" % (r, a, b),
		"%s.y = %s.y - %s.y" % (r, a, b)
	], "inplaceSub"),
	"mul": wrap_binary(NEED_RESULT, lambda r, a, b: [
		"%s.x = %s.x * %s" % (r, a, b),
		"%s.y = %s.y * %s" % (r, a, b)
	], "inplaceMul"),
	"div": wrap_binary(NEED_RESULT, lambda r, a, b: [
		"%s.x = %s.x / %s" % (r, a, b),
		"%s.y = %s.y / %s" % (r, a, b)
	], "inplaceDiv"),
	"minComponents": wrap_binary(NEED_RESULT, lambda r, a, b: [
		"%s.x = Math.min(%s.x, %s.x)" % (r, a, b),
		"%s.y = Math.min(%s.y, %s.y)" % (r, a, b)
	], "inplaceMinComponents"),
	"maxComponents": wrap_binary(NEED_RESULT, lambda r, a, b: [
		"%s.x = Math.max(%s.x, %s.x)" % (r, a, b),
		"%s.y = Math.max(%s.y, %s.y)" % (r, a, b)
	], "inplaceMaxComponents"),
	"dot": wrap_binary(0, lambda a, b: [
		"%s.x * %s.x + %s.y * %s.y" % (a, b, a, b)
	]),
	"inplaceAdd": wrap_binary(0, lambda a, b: [
		"%s.x += %s.x" % (a, b),
		"%s.y += %s.y" % (a, b)
	]),
	"inplaceSub": wrap_binary(0, lambda a, b: [
		"%s.x -= %s.x" % (a, b),
		"%s.y -= %s.y" % (a, b)
	]),
	"inplaceMul": wrap_binary(0, lambda a, b: [
		"%s.x *= %s" % (a, b),
		"%s.y *= %s" % (a, b)
	]),
	"inplaceDiv": wrap_binary(0, lambda a, b: [
		"%s.x /= %s" % (a, b),
		"%s.y /= %s" % (a, b)
	]),
	"inplaceMinComponents": wrap_binary(0, lambda a, b: [
		"%s.x = Math.min(%s.x, %s.x)" % (a, a, b),
		"%s.y = Math.min(%s.y, %s.y)" % (a, a, b)
	]),
	"inplaceMaxComponents": wrap_binary(0, lambda a, b: [
		"%s.x = Math.max(%s.x, %s.x)" % (a, a, b),
		"%s.y = Math.max(%s.y, %s.y)" % (a, a, b)
	]),
}

################################################################################
# parse tree visitor
################################################################################

opmap = {
	# unary operands
	"NOT": "!",
	"VOID": "void",
	"UNARY_PLUS": "+",
	"UNARY_MINUS": "-",
	"BITWISE_NOT": "~",

	# binary operands
	"PLUS": "+",
	"LT": "<",
	"EQ": "==",
	"AND": "&&",
	"OR": "||",
	"MINUS": "-",
	"MUL": "*",
	"LE": "<=",
	"NE": "!=",
	"STRICT_EQ": "===",
	"DIV": "/",
	"GE": ">=",
	"INSTANCEOF": "instanceof",
	"IN": "in",
	"GT": ">",
	"BITWISE_OR": "|",
	"BITWISE_AND": "&",
	"BITWISE_XOR": "^",
	"STRICT_NE": "!==",
	"LSH": "<<",
	"RSH": ">>",
	"URSH": ">>>",
	"MOD": "%"
}

# interesting to know how many function calls got inlined
inline_count = 0

# modified from s-expr output example, just turns the parse tree back
# into javascript except specific function calls, which it inlines
# (sexp.py can be found at http://code.google.com/p/pynarcissus/)
def o(n, handledattrs=[]):
	global inline_count
	attrs_ = {}
	for attr in handledattrs:
		attrs_[attr] = True
	subnodes_ = []
	had_error = False
	def check(attrs=[], optattrs=[], subnodes=0):
		if not (type(attrs) == list and type(optattrs) == list and
				type(subnodes) == int):
			raise ProgrammerError, "Wrong arguments to check(...)!"
		for attr in attrs: attrs_[attr] = True
		for attr in optattrs:
			if hasattr(n, attr): attrs_[attr] = True
		for i in xrange(subnodes):
			subnodes_.append(True)
	try:
		check(attrs=["append", "count", "extend", "filename", "getSource",
					"indentLevel", "index", "insert", "lineno", "pop",
					"remove", "reverse", "sort", "tokenizer", "type", "type_"],
					optattrs=["end", "start", "value"])

		if n.type == "ARRAY_INIT":
			check(subnodes=len(n))
			return "[" + ", ".join(o(x) if x else '' for x in n) + "]"

		elif n.type == "ASSIGN":
			check(subnodes=2)
			if getattr(n[0],"assignOp", None) is not None:
				return "%s %s= %s" % (o(n[0], handledattrs=["assignOp"]), jsparser.tokens[n[0].assignOp], o(n[1]))
			else:
				return "%s = %s" % (o(n[0], handledattrs=["assignOp"]), o(n[1]))

		elif n.type == "BLOCK":
			check(subnodes=len(n))
			return "{%s\n}" % "".join("\n" + o(x) + ";" for x in n)

		elif n.type in ("BREAK", "CONTINUE"):
			check(attrs=["target"], optattrs=["label"])
			if hasattr(n,"label"):
				return "%s %s" % (n.value, n.label)
			return n.value

		elif n.type == "CALL":
			check(subnodes=2)
			if n[0].type == "DOT" and n[0][1].type == "IDENTIFIER":
				# must pass n[0][0] and n[1][0] directly to unary_funcs[func] or binary_funcs[func]
				# because of required order of scope.alloc() and scope.free()
				func = o(n[0][1])
				if len(n[1]) == 0 and func in unary_funcs:
					inline_count += 1
					return "(%s)" % ", ".join(unary_funcs[func](n[0][0]))
				elif len(n[1]) == 1 and func in binary_funcs:
					inline_count += 1
					return "(%s)" % ", ".join(binary_funcs[func](n[0][0], n[1][0]))
			elif n[0].type == "IDENTIFIER":
				func = o(n[0])
				if func in global_funcs:
					inline_count += 1
					return "(%s)" % ", ".join(global_funcs[func](*n[1]))
			return "%s(%s)" % (o(n[0]), o(n[1]))

		elif n.type == "CASE":
			check(attrs=["caseLabel","statements"])
			return "case %s:%s" % (o(n.caseLabel), o(n.statements))

		elif n.type == "CATCH":
			check(attrs=["block","guard","varName"])
			return "catch (%s) %s" % (n.varName, o(n.block))

		elif n.type == "COMMA":
			check(subnodes=2)
			return "%s" % ", ".join("%s" % o(x) for x in n)

		elif n.type == "DEFAULT":
			check(attrs=["statements"])
			return "default: %s" % o(n.statements)

		elif n.type == "NEW":
			check(subnodes=1)
			return "new %s()" % o(n[0])

		elif n.type == "TYPEOF":
			check(subnodes=1)
			return "typeof %s " % o(n[0])

		elif n.type == "DELETE":
			check(subnodes=1)
			return "delete %s" % o(n[0])

		elif n.type in ("UNARY_MINUS", "NOT", "VOID", "BITWISE_NOT", "UNARY_PLUS"):
			check(subnodes=1)
			return "%s%s%s" % (opmap[n.type], " " if n.type == "VOID" else "", o(n[0]))

		elif n.type == "DO":
			check(attrs=["body", "condition", "isLoop"])
			assert n.isLoop
			return "do %s while (%s)" % (o(n.body), o(n.condition))

		elif n.type == "DOT":
			check(subnodes=2)
			return "%s.%s" % (o(n[0]), o(n[1]))

		elif n.type == "FUNCTION":
			check(attrs=["functionForm","params","body"],
					optattrs=["name"])
			if n.functionForm == 0:
				return "function %s(%s) {\n%s\n}" % (n.name, ", ".join(n.params), o(n.body))
			else:
				return "function(%s) {\n%s\n}" % (", ".join(n.params), o(n.body))

		elif n.type == "FOR":
			check(attrs=["body","setup","condition","update","isLoop"])
			assert n.isLoop
			setup = o(n.setup) if n.setup is not None else ""
			condition = o(n.condition) if n.condition is not None else ""
			update = o(n.update) if n.update is not None else ""
			body = o(n.body) if n.body is not None else ""
			return "for (%s; %s; %s) %s" % (setup, condition, update, body)

		elif n.type == "FOR_IN":
			check(attrs=["body","iterator","object","isLoop","varDecl"])
			assert n.isLoop
			s = "for ("
			if n.varDecl:
				assert n.varDecl.type == "VAR"
				assert len(n.varDecl) == 1
				assert n.varDecl[0].type == "IDENTIFIER"
				assert n.varDecl[0].value == n.iterator.value
				s += "var "
			return s + "%s in %s) %s" % (o(n.iterator), o(n.object), o(n.body))

		elif n.type == "GROUP":
			check(subnodes=1)
			return "(%s)" % o(n[0])

		elif n.type == "HOOK":
			check(subnodes=3)
			return "%s ? %s : %s" % (o(n[0]), o(n[1]), o(n[2]))

		elif n.type == "IDENTIFIER":
			check(optattrs=["initializer","name","readOnly"])
			if hasattr(n,"name"): assert n.name == n.value
			if hasattr(n,"initializer"):
				return "%s = %s" % (n.value, o(n.initializer))
			return str(n.value)

		elif n.type == "IF":
			check(attrs=["condition","thenPart","elsePart"])
			if n.elsePart:
				return "if (%s) %s else %s" % (o(n.condition), o(n.thenPart), o(n.elsePart))
			return "if (%s) %s" % (o(n.condition), o(n.thenPart))

		elif n.type in ("INCREMENT", "DECREMENT"):
			check(optattrs=["postfix"], subnodes=1)
			op = "++" if n.type == "INCREMENT" else "--"
			if getattr(n, "postfix", False):
				return "%s%s" % (o(n[0]), op)
			return "%s%s" % (op, o(n[0]))

		elif n.type == "INDEX":
			check(subnodes=2)
			return "%s[%s]" % (o(n[0]), o(n[1]))

		elif n.type == "LIST":
			check(subnodes=len(n))
			return ", ".join(o(x) for x in n)

		elif n.type == "NEW_WITH_ARGS":
			check(subnodes=2)
			return "%s %s(%s)" % (n.value, o(n[0]), o(n[1]))

		elif n.type in ("NUMBER", "TRUE", "FALSE", "THIS", "NULL"):
			return str(n.value)

		elif n.type == "OBJECT_INIT":
			check(subnodes=len(n))
			return "{%s\n}" % ",".join("\n" + o(x) for x in n)

		elif n.type in ("PLUS", "LT", "EQ", "AND", "OR", "MINUS", "MUL", "LE",
				"NE", "STRICT_EQ", "DIV", "GE", "INSTANCEOF", "IN", "GT",
				"BITWISE_OR", "BITWISE_AND", "BITWISE_XOR", "STRICT_NE", "LSH",
				"RSH", "URSH", "MOD"):
			check(subnodes=2)
			return "%s %s %s" % (o(n[0]), opmap[n.type], o(n[1]))

		elif n.type == "PROPERTY_INIT":
			check(subnodes=2)
			return "%s: %s" % (o(n[0]), o(n[1]))

		elif n.type == "REGEXP":
			return "/%s/%s" % (n.value["regexp"], n.value["modifiers"])

		elif n.type == "RETURN":
			if type(n.value) == str:
				return "return;"
			return "return %s;" % o(n.value)

		elif n.type == "SCRIPT":
			check(attrs=["funDecls","varDecls"], subnodes=len(n))
			scope.push()
			body = ""
			for x in n:
				body += o(x) + ";\n"
			locals = scope.pop()
			if locals:
				return "var %s;\n%s" % (", ".join(locals), body)
			return body

		elif n.type == "SEMICOLON":
			check(attrs=["expression"])
			if not n.expression: return ";"
			return o(n.expression) + ";"

		elif n.type == "STRING":
			return repr(n.value)

		elif n.type == "SWITCH":
			check(attrs=["cases", "defaultIndex", "discriminant"])
			assert (n.defaultIndex == -1 or
					n.cases[n.defaultIndex].type == "DEFAULT")
			return "switch (%s) {\n%s\n}" % (o(n.discriminant), "\n".join(o(x) for x in n.cases))

		elif n.type == "THROW":
			check(attrs=["exception"])
			return "throw %s" % o(n.exception)

		elif n.type == "TRY":
			check(attrs=["catchClauses","tryBlock"], optattrs=["finallyBlock"])
			if hasattr(n,"finallyBlock"):
				return " ".join(["try " + o(n.tryBlock)] + [o(x) for x in n.catchClauses] + ["finally " + o(n.finallyBlock)])
			return "try %s" % " ".join([o(n.tryBlock)] + [o(x) for x in n.catchClauses])

		elif n.type in ("VAR", "CONST"):
			check(subnodes=len(n))
			return "var %s" % ", ".join(o(x) for x in n)

		elif n.type == "WHILE":
			check(attrs=["condition","body","isLoop"])
			assert n.isLoop
			return "while (%s) %s" % (o(n.condition), o(n.body))

		else:
			raise UnknownNode, "Unknown type %s" % n.type
	except Exception, e:
		had_error = True
		raise
	finally:
		if not had_error:
			realkeys = [x for x in dir(n) if x[:2] != "__"]
			for key in realkeys:
				if key not in attrs_:
					raise ProgrammerError, "key '%s' unchecked on node %s!" % (
							key, n.type)
			if len(realkeys) != len(attrs_):
				for key in attrs_:
					if key not in realkeys:
						raise ProgrammerError, ("key '%s' checked "
								"unnecessarily on node %s!" % (key, n.type))
			if len(subnodes_) != len(n):
				raise ProgrammerError, ("%d subnodes out of %d checked on node "
						"%s" % (len(subnodes_), len(n), n.type))

def js_inline(js):
	global inline_count
	inline_count = 0
	result = o(jsparser.parse(js))
	print "inlined %d function calls" % inline_count
	print "avoided allocating %d new vectors" % allocations_avoided
	return result

if __name__ == "__main__":
	if len(sys.argv) > 1:
		for arg in sys.argv[1:]:
			print js_inline(open(arg).read())
	else:
		print js_inline(open("js_inline.test.js").read())
