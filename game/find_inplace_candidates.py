# make sure we read an up-to-date build
import os
os.system('python build.py release')
lines = open('./www/rapt.js').read().split('\n')

funcs = [
	'add',
	'sub',
	'mul',
	'div',
	'minComponents',
	'maxComponents'
]

# find all uses of functions we want to inline
def is_candidate(line):
	return any('.' + f + '(' in line for f in funcs)
lines = [(i, line.strip()) for i, line in enumerate(lines) if is_candidate(line)]

# check uses
for i, line in lines:
	parts = line.split()
	if len(parts) < 3:
		continue
	if len(parts) > 3:
		parts = [parts[0], parts[1], ' '.join(parts[3:])]
	start, equals, end = parts
	if equals == '=' and end.startswith(start):
		print line
