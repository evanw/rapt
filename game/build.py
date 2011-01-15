#!/usr/bin/python

input_path = './src/'
output_path = './www/rapt.js'

import re, os, time, sys

class CompileError(Exception):
	def __init__(self, text):
		Exception.__init__(self, text)

class Source:
	def __init__(self, path):
		self.path = path
		self.name = os.path.basename(path)
		self.code = open(path, 'r').read()

		# pick out the names in every '#require <...>' line
		lines = self.code.split('\n')
		require_re = re.compile('^#require <(.*)>$')
		matches = [require_re.match(line) for line in lines]
		self.dependencies = set([match.group(1) for match in matches if match])

		# remove the '#require' lines from code
		self.code = '\n'.join(line for line in lines if require_re.match(line) is None)

def sources():
	return [os.path.join(base, f) for base, folders, files in os.walk(input_path) for f in files if f.endswith('.js')]

def compile(sources):
	sources = [Source(path) for path in sources]

	# check that no two sources have the same name
	for source in sources:
		for other in sources:
			if other != source and other.name == source.name:
				raise CompileError('%s and %s both named %s' %
					(source.path, other.path, source.name))

	# map source name => Source object
	lookup = {}
	for source in sources:
		lookup[source.name] = source

	# check that all dependencies exist
	for source in sources:
		for dependency in source.dependencies:
			if not dependency in lookup:
				raise CompileError('could not find dependency %s' % dependency)

	# order based on dependencies
	new_sources = []
	while len(sources) > 0:
		# find a source that doesn't need any other source in sources
		free_source = None
		for source in sources:
			if not any(other.name in source.dependencies for other in sources):
				free_source = source
				break

		# if we couldn't find a free source, then there is a circular dependency
		if free_source is None:
			raise CompileError('circular dependency between ' +
				' and '.join(s.name for s in sources))

		# add the free source to the new order
		new_sources.append(free_source)
		sources.remove(free_source)

	return '\n'.join('// %s' % s.name for s in new_sources) + '\n\n' + \
		'\n'.join(s.code for s in new_sources)

def build():
	try:
		data = compile(sources())
		if 'inline' in sys.argv:
			print 'inlining javascript...'
			from js_inline import js_inline
			data = js_inline(data)
		data = '(function(){\n\n' + data + '})();\n\n'
		open(output_path, 'w').write(data)
		print 'built %s (%u bytes)' % (output_path, len(data))
	except CompileError, e:
		print 'error: ' + str(e)
		open(output_path, 'w').write('alert("%s")' % str(e))

def stat():
	return [os.stat(file).st_mtime for file in sources()]

def monitor():
	a = stat()
	while True:
		time.sleep(0.5)
		b = stat()
		if a != b:
			a = b
			build()

if __name__ == '__main__':
	build()
	if 'release' not in sys.argv:
		monitor()
