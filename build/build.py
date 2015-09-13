#!/usr/bin/python

import os, sys, time, subprocess
release = 'release' in sys.argv

print
if release:
	print 'mode: release (run once and compress)'
else:
	print 'mode: debug (constantly monitor files)'
	print '      use "python build.py release" to run once instead'
print

def foreground(command):
	os.system(command)

def background(command):
	subprocess.Popen(command, shell=True)

op = foreground if release else background
suffix = ' inline release' if release else ''
op('cd editor && python build.py' + suffix)
op('cd game && python build.py' + suffix)

def compile(a, b):
	compile = ' '.join([
		'java -jar ./closure_compiler/compiler.jar',
		'--compilation_level ADVANCED_OPTIMIZATIONS',
		# '--formatting PRETTY_PRINT',
		'--externs ./closure_compiler/jquery-1.4.4.externs.js',
		'--externs ./closure_compiler/jquery.mousewheel.externs.js',
		'--externs ./closure_compiler/editor.externs.js',
		'--externs ./closure_compiler/rapt.externs.js',
		'--js "%s"',
		'--js_output_file "%s"'
	])

	os.system(compile % (a, b))
	print 'built %s (%.2f%%)' % (b, 100.0 * len(open(b).read()) / len(open(a).read()))

def copy(a, b):
	os.system('cp "%s" "%s"' % (a, b))
	print 'copied %s to %s' % (a, b)

js_op = compile if release else copy
sources = {
	'./editor/www/editor.js': [js_op, '../app/assets/javascripts/editor.js'],
	'./game/www/rapt.js': [js_op, '../app/assets/javascripts/rapt.js'],

	'./editor/www/style.css': [copy, '../app/assets/stylesheets/editor.css'],
	'./game/www/style.css': [copy, '../app/assets/stylesheets/game.css']
}

oldStat = None

def build():
	global oldStat
	newStat = stat()
	for source in sources:
		if oldStat and oldStat[source] == newStat[source]:
			continue
		operation, destination = sources[source]
		operation(source, destination)
	oldStat = newStat

def stat():
	return dict((file, os.stat(os.path.abspath(file)).st_mtime) for file in sources)

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
	if not release:
		monitor()
