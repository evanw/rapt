# on firefox, if you forget the last false argument for the canvas arc() function you're toast (firefox freezes)
# since we test mostly on chrome, which doesn't require the last argument, these bugs creep in there

# make sure we read an up-to-date build
import os
os.system('python build.py release')
lines = open('./www/rapt.js').read().split('\n')

# find all uses of the canvas arc() function
import re
arc = re.compile('c.arc\([^;]*\);')
lines = [(i, line.strip()) for i, line in enumerate(lines) if arc.search(line.strip())]

# check uses of arc() function
for i, line in lines:
	match = arc.search(line)
	if len(match.group(0).split(',')) != 6:
		print 'line %d: %s' %(i, line)
